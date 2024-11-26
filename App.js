import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TextInput, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import graphData from './assets/graph.json';

/**
 * Graph component to visualize and interact with graph data.
 * Allows users to find the shortest path using Dijkstra's algorithm,
 * and handles negative cycles using Bellman-Ford.
 */
const Graph = () => {
  // State variables for nodes, edges, and game state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState(null);

  const [endNode, setEndNode] = useState(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [message, setMessage] = useState('');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [lastClickedNode, setLastClickedNode] = useState(null);
  const [optimalPathWeight, setOptimalPathWeight] = useState(null);
  const [reachedDestination, setReachedDestination] = useState(false);
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [mode, setMode] = useState(''); // '' | 'student' | 'teacher'

  // Load the current level when the component mounts
  useEffect(() => {
    loadLevel(currentLevel);
  }, []);

  /**
   * Validates the minimum and maximum weights inputted by the user.
   * @returns {boolean} True if weights are valid, false otherwise.
   */
  const validateWeights = () => {
    const min = parseInt(minWeight);
    const max = parseInt(maxWeight);
    if (isNaN(min) || isNaN(max) || max <= 0 || min >= max) {
      Alert.alert('Invalid Weights', 'Ensure both max weights are positive, and max is greater than min.');
      return false;
    }
    return true;
  };

  

  const bellmanFord = (startNode) => {
    const distances = {};
    const predecessors = {};
  
    // Step 1: Initialize distances and predecessors
    nodes.forEach((node) => {
      distances[node.id] = Infinity;
      predecessors[node.id] = null;
    });
  
    distances[startNode] = 0;
  
    // Step 2: Relax all edges |V| - 1 times
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.forEach((edge) => {
        if (distances[edge.from] + edge.weight < distances[edge.to]) {
          distances[edge.to] = distances[edge.from] + edge.weight;
          predecessors[edge.to] = edge.from;
        }
      });
    }
  
    // Step 3: Check for negative weight cycles
    let negativeCycleNodes = [];
    let negativeCycleEdges = [];
    let cycleStart = null;
  
    edges.forEach((edge) => {
      if (distances[edge.from] + edge.weight < distances[edge.to]) {
        cycleStart = edge.to; // Found a node in the negative cycle
      }
    });
  
    if (cycleStart) {
      let visited = new Set();
  
      // Trace back the cycle
      let currentNode = cycleStart;
      for (let i = 0; i < nodes.length; i++) {
        currentNode = predecessors[currentNode];
      }
  
      let cycleNode = currentNode;
      do {
        negativeCycleNodes.push(cycleNode);
        visited.add(cycleNode);
        const edge = edges.find(
          (e) => e.from === predecessors[cycleNode] && e.to === cycleNode
        );
        if (edge) {
          negativeCycleEdges.push(edge);
        }
        cycleNode = predecessors[cycleNode];
      } while (!visited.has(cycleNode));
  
      negativeCycleNodes.push(cycleNode); // Close the cycle
    }
  
    return {
      negativeCycleEdges,
      negativeCycleNodes,
      distances,
      predecessors,
    };
  };
  
  /**
   * Adjusts the graph to resolve negative cycles by regenerating edge weights.
   */
  const adjustNegativeCycles = () => {
    const MAX_ITERATIONS = 100;
    let attempts = 0;
  
    while (attempts < MAX_ITERATIONS) {
      const { negativeCycleEdges } = bellmanFord(startNode);
  
      if (negativeCycleEdges.length === 0) {
        // No negative cycles, compute the optimal path
        const { weight } = dijkstra(startNode, endNode);
        setOptimalPathWeight(weight);
        return;
      }
  
      // Adjust weights to resolve the negative cycle
      adjustWeightsToResolveCycle(negativeCycleEdges);
      attempts++;
    }
  
    // If cycles persist after multiple attempts
    Alert.alert(
      'Failed to Resolve Negative Cycles',
      'The system was unable to resolve negative cycles after multiple attempts.'
    );
  };
  
  const adjustWeightsToResolveCycle = (negativeCycleEdges) => {
    // Calculate the total weight of the negative cycle
    const totalCycleWeight = negativeCycleEdges.reduce((sum, edge) => sum + edge.weight, 0);
  
    // Calculate the required increment to make the cycle weight positive
    const requiredIncrement = Math.abs(totalCycleWeight) + 1;
  
    // Adjust the weights of edges in the negative cycle
    const newEdges = edges.map((edge) => {
      if (negativeCycleEdges.some((cycleEdge) => cycleEdge.from === edge.from && cycleEdge.to === edge.to)) {
        // Increment the edge weight to resolve the negative cycle
        return {
          ...edge,
          weight: edge.weight + requiredIncrement,
        };
      }
      return edge; // Keep other edges unchanged
    });
  
    setEdges(newEdges);
  };
  

  /**
   * Dijkstra's algorithm to find the shortest path from startNode to endNode.
   
   */
  const dijkstra = (startNode, endNode) => {
    const distances = {};
    const previousNodes = {};
    // Clone the nodes array to keep track of unvisited nodes
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

  /**
   * Loads the level specified by index, setting up nodes, edges, and start/end nodes.
   * @param {number} level - The level index to load.
   */
  const loadLevel = (level) => {
    if (level < graphData.graphs.length) {
      const graph = graphData.graphs[level];
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setStartNode(graph.startNode);
      setEndNode(graph.endNode);
      setLastClickedNode(graph.startNode);
      setTotalWeight(0);
      setSelectedEdges([]);
      setGameOver(false);
      setMessage('');
      setReachedDestination(false);
      setCurrentLevel(level);

      adjustNegativeCycles();
    } else {
      setMessage('Congratulations! All levels completed.');
    }
  };

  /**
   * Resets the graph to its initial state for the current level.
   */
  const resetGraph = () => {
    setSelectedEdges([]);
    setLastClickedNode(startNode);
    setTotalWeight(0);
    setGameOver(false);
    setMessage('');
    setReachedDestination(false);

    adjustNegativeCycles();
  };

  // Update optimal path weight whenever startNode or endNode changes
  useEffect(() => {
    if (startNode && endNode) {
      const { weight } = dijkstra(startNode, endNode);
      setOptimalPathWeight(weight);
    }
  }, [startNode, endNode, nodes, edges]);

  /**
   * Displays the running total weight by adding the additional weight.
   * @param {number} additionalWeight - The weight to add to the total.
   */
  const displayRunningTotal = (additionalWeight) => {
    setTotalWeight(prevWeight => prevWeight + additionalWeight);
  };

  /**
   * Handles node click events to update the path and check if the destination is reached.
   * @param {number} currentNode - The currently clicked node ID.
   */
  const handleNodeClick = (currentNode) => {
    if (gameOver || lastClickedNode === currentNode || reachedDestination) return;

    const edge = edges.find(
      e =>
        (e.from === lastClickedNode && e.to === currentNode) ||
        (e.from === currentNode && e.to === lastClickedNode)
    );

    if (edge) {
      const newEdge = { from: lastClickedNode, to: currentNode };
      setSelectedEdges([...selectedEdges, newEdge]);
      displayRunningTotal(edge.weight);

      if (currentNode === endNode) {
        setReachedDestination(true);
        setMessage('You have reached the destination!');
      } else {
        setLastClickedNode(currentNode);
      }
    } else {
      Alert.alert('Invalid move', 'There is no direct path between these nodes.');
    }
  };

  /**
   * Checks if an edge is selected by the user.
   * @param {number} from - The starting node ID of the edge.
   * @param {number} to - The ending node ID of the edge.
   * @returns {boolean} True if the edge is selected, false otherwise.
   */
  const isEdgeSelected = (from, to) => {
    return selectedEdges.some(
      edge => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)
    );
  };

  /**
   * Checks the current path against the optimal path weight and updates the message.
   */
  const checkPath = () => {
    if (!reachedDestination) {
      setMessage("Keep going, you haven't reached the destination yet.");
      return;
    }

    if (totalWeight <= optimalPathWeight) {
      setMessage('Bravo! You found the optimal path weight!');
      setGameOver(true);
    } else {
      setMessage('Sorry, your path weight is not optimal. Try again.');
      setGameOver(true);
    }
  };

  /**
   * Handles the action to play again or proceed to the next level.
   */
  const playAgainOrNextLevel = () => {
    if (message === 'Bravo! You found the optimal path weight!') {
      setCurrentLevel(currentLevel + 1);
      loadLevel(currentLevel + 1);
    } else {
      // loadLevel(currentLevel);
      setSelectedEdges([]);
    setLastClickedNode(startNode);
    setTotalWeight(0);
    setGameOver(false);
    setMessage('');
    setReachedDestination(false);

    adjustNegativeCycles();
    }
  };

  /**
   * Randomly generates new edge weights within the specified range.
   */
  const generateRandomEdges = () => {
    if (!validateWeights()) return;
    const newEdges = edges.map(edge => ({
      ...edge,
      weight: Math.floor(Math.random() * (parseInt(maxWeight) - parseInt(minWeight) + 1)) + parseInt(minWeight),
    }));
    setEdges(newEdges);
    const { weight } = dijkstra(startNode, endNode);
    setOptimalPathWeight(weight);
  };

  /**
   * Undoes the last selected edge, reverting the path to its previous state.
   */
  const undo = () => {
    if (selectedEdges.length > 0 && !gameOver) {
      const lastEdge = selectedEdges[selectedEdges.length - 1];
      const newEdges = selectedEdges.slice(0, -1);
      setSelectedEdges(newEdges);
      setTotalWeight(
        totalWeight - edges.find(
          e => (e.from === lastEdge.from && e.to === lastEdge.to) || 
               (e.from === lastEdge.to && e.to === lastEdge.from)
        ).weight
      );
      setLastClickedNode(lastEdge.from);
      setMessage('');
      setReachedDestination(false);
    }
  };

  /**
   * Resets the mode and loads the first level, simulating a 'home' action.
   */
  const goHome = () => {
    setMode('');
    loadLevel(0);
    setCurrentLevel(0);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Home Page */}
      {!mode ? (
        <View style={{ marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Select Mode</Text>
          <Button title="Student Mode" onPress={() => setMode('student')} />
          <View style={{ marginVertical: 10 }} />
          <Button title="Teacher Mode" onPress={() => setMode('teacher')} />
        </View>
      ) : (
        /* Game UI */
        <Svg height="400" width="400">
          {edges.map((edge, index) => {
            const startNode = nodes.find(n => n.id === edge.from);
            const endNode = nodes.find(n => n.id === edge.to);
            const midX = (startNode.x + endNode.x) / 2;
            const midY = (startNode.y + endNode.y) / 2;

            return (
              <React.Fragment key={index}>
                <Line
                  x1={startNode.x}
                  y1={startNode.y}
                  x2={endNode.x}
                  y2={endNode.y}
                  stroke={isEdgeSelected(edge.from, edge.to) ? 'green' : 'yellow'}
                  strokeWidth={isEdgeSelected(edge.from, edge.to) ? '3' : '2'}
                />
                <SvgText
                  x={midX}
                  y={midY - 10}
                  fill="black"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {edge.weight}
                </SvgText>
              </React.Fragment>
            );
          })}

          {nodes.map(node => (
            <Circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={20}
              stroke="gray"
              strokeWidth="2"
              fill={node.id === startNode ? 'green' : node.id === endNode ? 'red' : 'blue'}
              onPress={() => handleNodeClick(node.id)}
            />
          ))}
          {nodes.map(node => (
            <SvgText
              key={node.id + '-label'}
              x={node.x}
              y={node.y + 5}
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              {node.id}
            </SvgText>
          ))}
        </Svg>
      )}

      {/* Teacher Mode UI */}
      {mode === 'teacher' && !gameOver && (
        <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
          <TextInput
            style={{ borderWidth: 1, padding: 5, width: 80, marginBottom: 5 }}
            placeholder="Min Weight"
            keyboardType="numeric"
            value={minWeight}
            onChangeText={text => setMinWeight(text)}
          />
          <TextInput
            style={{ borderWidth: 1, padding: 5, width: 80, marginBottom: 5 }}
            placeholder="Max Weight"
            keyboardType="numeric"
            value={maxWeight}
            onChangeText={text => setMaxWeight(text)}
          />
          <Button title="Generate New Weights" onPress={generateRandomEdges} />
        </View>
      )}

      {/* Common Game Controls */}
      {mode && (
        <>
          <Text style={{ marginTop: 10 }}>Total Weight: {totalWeight}</Text>
          <Text style={{ marginTop: 10 }}>{message}</Text>

          {gameOver && (
            <View style={{ marginVertical: 20 }}>
              <Button title={message.includes('Bravo') ? "Next Level" : "Play Again"} onPress={playAgainOrNextLevel} />
            </View>
          )}

          <Button title="Undo" onPress={undo} />
          <Button title="Check Path" onPress={checkPath} />
          <Button title="Reset Graph" onPress={resetGraph} />
        </>
      )}

      {/* Home Button */}
      <TouchableOpacity
        onPress={goHome}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          padding: 10,
          borderRadius: 5,
          backgroundColor: 'lightgray',
        }}
      >
        <Text>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Graph;
