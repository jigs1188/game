import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TextInput, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import graphData from './assets/graph.json';

const Graph = () => {
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

  useEffect(() => {
    loadLevel(currentLevel);
  }, []);

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

    nodes.forEach((node) => {
      distances[node.id] = Infinity;
      predecessors[node.id] = null;
    });

    distances[startNode] = 0;

    for (let i = 0; i < nodes.length - 1; i++) {
      edges.forEach((edge) => {
        if (distances[edge.from] + edge.weight < distances[edge.to]) {
          distances[edge.to] = distances[edge.from] + edge.weight;
          predecessors[edge.to] = edge.from;
        }
      });
    }

    const negativeCycleEdges = [];

    edges.forEach((edge) => {
      if (distances[edge.from] + edge.weight < distances[edge.to]) {
        negativeCycleEdges.push(edge);
      }
    });

    return { negativeCycleEdges, distances, predecessors };
  };

  const adjustNegativeCycles = () => {
    const MAX_ITERATIONS = 100; // Limit regeneration attempts
    let attempts = 0;
  
    while (attempts < MAX_ITERATIONS) {
      const { distances, negativeCycleEdges } = bellmanFord(startNode);
  
      if (distances[endNode] >= 0) {
        break; // Positive destination path found
      }
  
      if (negativeCycleEdges.length > 0) {
        regenerateWeights(); // Attempt to resolve by weight changes
      }
  
      attempts++;
    }
  
    if (attempts >= MAX_ITERATIONS) {
      // Alert.alert('Failed to ensure positive path', 'Could not resolve the negative destination path.');
    }
  };
  
  const regenerateWeights = () => {
    const totalNodes = nodes.length;
    let edgePosBalance = Math.ceil(totalNodes / 3); // Ensuring more positive paths
  
    let newEdges;
    let negativeCycleEdges;
  
    do {
      newEdges = edges.map((edge) => {
        const weight = edgePosBalance > 0 && Math.random() < 0.8
          ? Math.floor(Math.random() * maxWeight) + 1 // Positive weight
          : Math.floor(Math.random() * minWeight * -1); // Negative weight
        edgePosBalance -= weight > 0 ? 1 : 0;
  
        return { ...edge, weight };
      });
  
      const { negativeCycleEdges: currentNegativeCycleEdges } = bellmanFord(startNode);
      negativeCycleEdges = currentNegativeCycleEdges;
    } while (negativeCycleEdges.length > 0);
  
    setEdges(newEdges);
  };

  const dijkstra = (startNode, endNode) => {
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
  
      adjustNegativeCycles(); // Detect or resolve any negative cycle for this level
      const { weight } = dijkstra(graph.startNode, graph.endNode);
      setOptimalPathWeight(weight); // Always reflect valid optimal paths
    } else {
      setMessage('Congratulations! All levels completed.');
    }
  };
  
  const resetGraph = () => {
    setSelectedEdges([]);
    setLastClickedNode(startNode);
    setTotalWeight(0);
    setGameOver(false);
    setMessage('');
    setReachedDestination(false);
  
    adjustNegativeCycles(); // Revalidate paths if user resets during level
    const { weight } = dijkstra(startNode, endNode);
    setOptimalPathWeight(weight);
  };
  
  
 
  useEffect(() => {
    if (startNode && endNode) {
      const { weight } = dijkstra(startNode, endNode);
      setOptimalPathWeight(weight);
    }
  }, [startNode, endNode, nodes, edges]);

  const displayRunningTotal = (additionalWeight) => {
    setTotalWeight(prevWeight => prevWeight + additionalWeight);
  };
  

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
  
  const isEdgeSelected = (from, to) => {
    return selectedEdges.some(
      edge => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)
    );
  };

  const checkPath = () => {
    if (!reachedDestination) {
      setMessage("Keep going, you haven't reached the destination yet.");
      return;
    }

    const isWeightCorrect = totalWeight === optimalPathWeight;

    if (isWeightCorrect) {
      setMessage('Bravo! You found the optimal path weight!');
      setGameOver(true);
    } else {
      setMessage('Sorry, your path weight is not optimal. Try again.');
      setGameOver(true);
    }
  };

  const playAgainOrNextLevel = () => {
    if (message === 'Bravo! You found the optimal path weight!') {
      setCurrentLevel(currentLevel + 1);
      loadLevel(currentLevel + 1);
    } else {
      loadLevel(currentLevel);
    }
  };

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

  // const resetGraph = () => {
  //   setSelectedEdges([]);
  //   setLastClickedNode(startNode);
  //   setTotalWeight(0);
  //   setGameOver(false);
  //   setMessage('');
  //   setReachedDestination(false);
  // };

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

  const goHome = () => {
    setMode('');
    loadLevel(0);
    setCurrentLevel(0);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!mode ? (
        <View style={{ marginBottom: 20 }}>
          <Button title="Student Mode" onPress={() => setMode('student')} />
          <Button title="Teacher Mode" onPress={() => setMode('teacher')} />
        </View>
      ) : (
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