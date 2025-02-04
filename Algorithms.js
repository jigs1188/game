import { OperationType } from "firebase/auth";

// Algorithms.js
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

// Algorithms.js (Final Bellman-Ford Implementation)
export const bellmanFord = (nodes, originalEdges, startNode, endNode) => {
  const distances = {};
  const predecessors = {};
  const edges = originalEdges.filter(edge => edge.from !== endNode);

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  });
  distances[startNode] = 0;

  // Create virtual undirected edges (not stored)
  const undirectedEdges = [];
  edges.forEach(edge => {
    undirectedEdges.push(edge);
    undirectedEdges.push({...edge, from: edge.to, to: edge.from});
  });

  // Relax edges |V| - 1 times
  for (let i = 0; i < nodes.length - 1; i++) {
    undirectedEdges.forEach(edge => {
      if (distances[edge.from] + edge.weight < distances[edge.to]) {
        distances[edge.to] = distances[edge.from] + edge.weight;
        predecessors[edge.to] = edge.from;
      }
    });
  }


  // Detect negative cycles excluding endNode
  const inNegativeCycle = new Set();
  undirectedEdges.forEach(edge => {
    if (distances[edge.from] + edge.weight < distances[edge.to]) {
      let node = edge.to;
      const visited = new Set();

      while (node !== null && !visited.has(node)) {
        visited.add(node);
        node = predecessors[node];
      }

      if (node !== null && node !== endNode) {
        let current = node;
        do {
          inNegativeCycle.add(current);
          current = predecessors[current];
        } while (current !== node && current !== null);
      }
    }
  });

  if (inNegativeCycle.size > 0) {
    const negativeCycleEdges = undirectedEdges.filter(edge => 
      inNegativeCycle.has(edge.from) && inNegativeCycle.has(edge.to)
    );

    const adjustedEdges = adjustNegativeCycle(edges, negativeCycleEdges);
    return { 
      shortestPath: [], 
      weight: Infinity, 
      negativeCycleEdges,
      adjustedEdges 
    };
  }

  // Reconstruct path
  const shortestPath = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    shortestPath.unshift(currentNode);
    currentNode = predecessors[currentNode];
  }

  return { 
    shortestPath,
    weight: distances[endNode],
    negativeCycleEdges: [],
    adjustedEdges: edges
  };
};

// Algorithms.js
const adjustNegativeCycle = (originalEdges, negativeCycleEdges) => {
  // Calculate total negative weight in the cycle
  let cycleWeight = negativeCycleEdges.reduce((sum, edge) => sum + edge.weight, 0);
  
  // Calculate minimum adjustment needed per edge to make cycle positive
  const numEdgesInCycle = negativeCycleEdges.length;
  const adjustmentPerEdge = Math.ceil(Math.abs(cycleWeight) / numEdgesInCycle) + 1;

  return originalEdges.map(edge => {
    const isInCycle = negativeCycleEdges.some(e => 
      (e.from === edge.from && e.to === edge.to) ||
      (e.to === edge.from && e.from === edge.to) // Undirected check
    );
    return isInCycle ? { 
      ...edge, 
      weight: edge.weight + adjustmentPerEdge 
    } : edge;
  });
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