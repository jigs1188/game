// Algorithms.js

// boolean varible to check wethe the negative cycle adjusted or not 
// let negativeCycleAdjusted = false;



export const dijkstra = (nodes, edges, startNode, endNode) => {
  const distances = {};
  const previousNodes = {};
  const unvisitedNodes = nodes.slice();

  nodes.forEach(node => {
    distances[node.id] = Infinity;
  });

  distances[startNode] = 0;
  previousNodes[startNode] = null;

  while (unvisitedNodes.length > 0) {
    const currentNode = unvisitedNodes.reduce((minNode, node) => {
      return distances[node.id] < distances[minNode.id] ? node : minNode;
    }, unvisitedNodes[0]);

    unvisitedNodes.splice(unvisitedNodes.indexOf(currentNode), 1);

    if (currentNode.id === endNode) break;

    edges.forEach(edge => {
      if (edge.from === currentNode.id) {
        const neighborNode = nodes.find(node => node.id === edge.to);
        const distance = distances[currentNode.id] + edge.weight;

        if (distance < distances[neighborNode.id]) {
          distances[neighborNode.id] = distance;
          previousNodes[neighborNode.id] = currentNode.id;
        }
      }
    });
  }

  const shortestPath = [];
  let currentNode = endNode;

  while (currentNode) {
    shortestPath.unshift(currentNode);
    currentNode = previousNodes[currentNode];
  }

  return { shortestPath, weight: distances[endNode] };
};
 

export const bellmanFord = (nodes, originalEdges, startNode, endNode) => {
  const distances = {};
  const predecessors = {};

  // Initialize distances and predecessors
  nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  });
  distances[startNode] = 0;

  console.log("[BF] Initial distances:", distances);
  console.log("[BF] Initial predecessors:", predecessors);

  // Relax edges for V-1 iterations
  for (let i = 0; i < nodes.length - 1; i++) {
    let updated = false;
    originalEdges.forEach(edge => {
      if (distances[edge.from] + edge.weight < distances[edge.to] && predecessors[edge.from] !== edge.to) {
        distances[edge.to] = distances[edge.from] + edge.weight;
        predecessors[edge.to] = edge.from;
        updated = true;
      }
    });
    console.log(`[BF] Iteration ${i + 1} distances:`, distances);
    console.log(`[BF] Iteration ${i + 1} predecessors:`, predecessors);
    if (!updated) break;
  }

  // / Detect negative cycles (multi-cycle support)
  const cycleEdges = new Set();
  const cycleCache = new Set(); // Track cycles by unique identifiers
  
  originalEdges.forEach(edge => {
    if (distances[edge.from] + edge.weight < distances[edge.to]) {
      let node = edge.from;
      const path = [];
      const visitedInThisCycle = new Set();
  
      // Trace predecessors to find cycle
      while (node !== null) {
        if (visitedInThisCycle.has(node)) {
          // Found a cycle, extract it
          const cycleStartIndex = path.indexOf(node);
          const cycle = path.slice(cycleStartIndex);
          const cycleKey = cycle.sort().join('-');
          
          if (!cycleCache.has(cycleKey) && cycle.length >= 3) {
            cycleCache.add(cycleKey);
            console.log("[BF] Found cycle:", cycle);
  
            // Collect all edges in this cycle
            for (let i = 0; i < cycle.length; i++) {
              const from = cycle[i];
              const to = cycle[(i + 1) % cycle.length];
              
              // Find both directions
              const forwardEdge = originalEdges.find(e => 
                e.from === from && e.to === to
              );
              const reverseEdge = originalEdges.find(e => 
                e.from === to && e.to === from
              );
  
              if (forwardEdge) cycleEdges.add(forwardEdge);
              if (reverseEdge) cycleEdges.add(reverseEdge);
            }
          }
          break;
        }
        
        if (path.length > nodes.length * 2) break; // Prevent infinite loops
        
        visitedInThisCycle.add(node);
        path.push(node);
        node = predecessors[node];
      }
    }
  });

  // Convert to array with deep comparison
  const uniqueCycleEdges = Array.from(cycleEdges).filter((edge, index, self) =>
    self.findIndex(e => 
      e.from === edge.from &&
      e.to === edge.to &&
      e.weight === edge.weight
    ) === index
  );

if (uniqueCycleEdges.length > 0) {
  return {
    shortestPath: [],
    weight: Infinity,
    negativeCycleDetected: true,
    cycleEdges: uniqueCycleEdges
  };
}

return {
  shortestPath: reconstructPath(predecessors, endNode),
  weight: distances[endNode],
  negativeCycleDetected: false,
  cycleEdges: []
};
};

export const adjustNegativeCycle = (originalEdges, cycleEdges) => {
  // negativeCycleAdjusted = true;

  console.log("[Adjust] Processing cycle edges:", cycleEdges);
  
  const uniqueNodes = new Set();
  cycleEdges.forEach(edge => {
    uniqueNodes.add(edge.from);
    uniqueNodes.add(edge.to);
  });

  const totalNegativeWeight = cycleEdges.reduce((sum, edge) => sum + edge.weight, 0);
  const averageAdjustment = Math.ceil(Math.abs(totalNegativeWeight) / uniqueNodes.size);

  return originalEdges.map(edge => {
    const isCycleEdge = cycleEdges.some(ce => 
      ce.from === edge.from &&
      ce.to === edge.to &&
      ce.weight === ce.weight
    );
    
    if (isCycleEdge) {
      console.log(`[Adjust] Modifying edge ${edge.from}->${edge.to} from ${edge.weight} to ${edge.weight + averageAdjustment}`);
      return { ...edge, weight: edge.weight + averageAdjustment };
    }
    return edge;
  });
};

const reconstructPath = (predecessors, endNode) => {
  const path = [];
  let currentNode = endNode;
  const visited = new Set();

  while (currentNode !== null && !visited.has(currentNode)) {
    visited.add(currentNode);
    path.unshift(currentNode);
    currentNode = predecessors[currentNode];
    
    // Prevent infinite loops
    if (path.length > Object.keys(predecessors).length) break;
  }

  return path.includes(endNode) ? path : [];
};


export const calculateOptimalPath = (nodes, edges, startNode, endNode, operation = 'sum') => {
  // Convert edges for multiplication using precise logarithmic conversion
  const operationEdges = operation === 'multiplication' 
    ? edges.map(edge => ({
        ...edge,
        weight: Math.log(edge.weight)
      }))
    : edges;

  // Filter out edges originating from endNode
  const filteredEdges = operationEdges.filter(edge => edge.from !== endNode);

  const hasNegativeWeights = filteredEdges.some(edge => edge.weight < 0);
  
  let result;
  try {
    result = hasNegativeWeights
      ? bellmanFord(nodes, filteredEdges, startNode, endNode)
      : dijkstra(nodes, filteredEdges, startNode, endNode);
  } catch (error) {
    console.error("Path calculation error:", error);
    return { weight: Infinity };
  }

  // Convert back with precise rounding
  if (operation === 'multiplication') {
    const EXP_TOLERANCE = 1e-10;
    const rawWeight = Math.exp(result.weight);
    const roundedWeight = Math.round((rawWeight + EXP_TOLERANCE) * 1e6) / 1e6;
    return { ...result, weight: roundedWeight };
  }
  
  return result;
};   
