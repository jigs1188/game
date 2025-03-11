// bfsWorker.js
self.onmessage = (e) => {
    const { nodes, edges, startNode, endNode } = e.data;
    
    try {
      const result = bellmanFord(nodes, edges, startNode, endNode);
      self.postMessage(result);
    } catch (error) {
      self.postMessage({ error: error.message });
    }
  };
  
  export const bellmanFord = (nodes, originalEdges, startNode, endNode) => {
    const distances = {};
    const predecessors = {};
    const MAX_ITERATIONS = nodes.length; // Allow sufficient iterations
  
    console.log("[BF] Starting with nodes:", nodes.map(n => n.id), "edges:", originalEdges);
  
    // Initialize distances and predecessors
    nodes.forEach(node => {
      distances[node.id] = Infinity;
      predecessors[node.id] = null;
    });
    distances[startNode] = 0;
  
    // Relax edges up to V-1 times
    let iteration;
    for (iteration = 0; iteration < nodes.length; iteration++) {
      let updated = false;
      originalEdges.forEach(edge => {
        if (distances[edge.from] + edge.weight < distances[edge.to]) {
          console.log(`[BF] Relaxing ${edge.from}->${edge.to} (${edge.weight})`);
          distances[edge.to] = distances[edge.from] + edge.weight;
          predecessors[edge.to] = edge.from;
          updated = true;
        }
      });
      if (!updated) break;
    }
  
    // Check for negative cycles
    let hasNegativeCycle = false;
    const cycleEdges = new Set();
    for (const edge of originalEdges) {
      if (distances[edge.from] + edge.weight < distances[edge.to]) {
        console.log(`[BF] Negative cycle detected via edge ${edge.from}->${edge.to}`);
        hasNegativeCycle = true;
        // Trace back to find the cycle
        let node = edge.from;
        const visited = new Set();
        while (!visited.has(node)) {
          visited.add(node);
          node = predecessors[node];
          if (node === null) break; // No predecessor
        }
        if (node !== null) {
          // Reconstruct cycle
          const cycle = [];
          let current = node;
          do {
            cycle.push(current);
            current = predecessors[current];
          } while (current !== node && cycle.length <= nodes.length);
          
          if (cycle.length >= 3) {
            console.log("[BF] Cycle nodes:", cycle);
            // Collect all edges in the cycle
            for (let i = 0; i < cycle.length; i++) {
              const from = cycle[i];
              const to = cycle[(i + 1) % cycle.length];
              const edge = originalEdges.find(e => 
                (e.from === from && e.to === to) || 
                (e.from === to && e.to === from)
              );
              if (edge) cycleEdges.add(edge);
            }
          }
        }
      }
    }
  
    if (hasNegativeCycle) {
      console.log("[BF] Confirmed negative cycle edges:", Array.from(cycleEdges));
      return {
        shortestPath: [],
        weight: Infinity,
        negativeCycleEdges: Array.from(cycleEdges),
        adjustedEdges: adjustNegativeCycle(originalEdges, Array.from(cycleEdges))
      };
    }
  
    return {
      shortestPath: reconstructPath(predecessors, endNode),
      weight: distances[endNode],
      negativeCycleEdges: [],
      adjustedEdges: originalEdges
    };
  };
  
  const reconstructPath = (predecessors, endNode) => {
    const path = [];
    let currentNode = endNode;
    while (currentNode !== null && !path.includes(currentNode)) {
      path.unshift(currentNode);
      currentNode = predecessors[currentNode];
    }
    return path.includes(endNode) ? path : [];
  };
  
  const adjustNegativeCycle = (originalEdges, cycleEdges) => {
    // Increase each cycle edge's weight by 1 to break the negative cycle
    return originalEdges.map(edge => {
      if (cycleEdges.includes(edge)) {
        return { ...edge, weight: edge.weight + 1 };
      }
      return edge;
    });
  };