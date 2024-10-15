import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import graphData from './assets/graph.json';

const Graph = () => {
  const [nodes, setNodes] = useState(graphData.graphs[0].nodes);
  const [edges, setEdges] = useState(graphData.graphs[0].edges);
  const [startNode, setStartNode] = useState(graphData.graphs[0].startNode);
  const [endNode, setEndNode] = useState(graphData.graphs[0].endNode);
  const [totalWeight, setTotalWeight] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [lastClickedNode, setLastClickedNode] = useState(startNode);
  const [optimalPathWeight, setOptimalPathWeight] = useState(null);
  const [reachedDestination, setReachedDestination] = useState(false);

  // Dijkstra's Algorithm to find the shortest path
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

      if (currentNode.id === endNode) {
        break;
      }

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

  useEffect(() => {
    const { weight } = dijkstra(startNode, endNode);
    setOptimalPathWeight(weight);
  }, [startNode, endNode, nodes, edges]);

  // Handle user clicks on nodes
  const handleNodeClick = currentNode => {
    if (gameOver || lastClickedNode === currentNode || reachedDestination) return;
  
    const edge = edges.find(
      e =>
        (e.from === lastClickedNode && e.to === currentNode) ||
        (e.from === currentNode && e.to === lastClickedNode)
    );
  
    if (edge) {
      const newEdge = { from: lastClickedNode, to: currentNode };
      setSelectedEdges([...selectedEdges, newEdge]);
  
      // Reset message when the user continues playing after seeing "Keep going"
      setMessage('');
  
      if (currentNode === endNode) {
        setTotalWeight(totalWeight + edge.weight);
        setReachedDestination(true);
        setMessage('You have reached the destination!');
      } else {
        setTotalWeight(totalWeight + edge.weight);
        setLastClickedNode(currentNode);
      }
    } else {
      Alert.alert('Invalid move', 'There is no direct path between these nodes.');
    }
  };
  
  // Check if edge is selected by user
  const isEdgeSelected = (from, to) => {
    return selectedEdges.some(
      edge => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)
    );
  };

  // Check if user's path matches the optimal path
  const checkPath = () => {
    if (!reachedDestination) {
      setMessage("Keep going, you haven't reached the destination yet.");
      return;
    }

    const { shortestPath } = dijkstra(startNode, endNode);

    // Extract user's selected path as an array of nodes
    const userPath = [startNode, ...selectedEdges.map(edge => edge.to)];

    // Compare the user-selected path with the shortest path
    const isPathCorrect =
      userPath.length === shortestPath.length &&
      userPath.every((node, index) => node === shortestPath[index]);

    if (isPathCorrect) {
      setMessage('Bravo! You found the optimal path!');
      setGameOver(true);
    } else {
      setMessage('Sorry, you lost! Try again.');
      setGameOver(true);
    }
  };

  // Reset the game after losing
  const playAgain = () => {
    setTotalWeight(0);
    setSelectedEdges([]);
    setLastClickedNode(startNode);
    setGameOver(false);
    setMessage('');
    setReachedDestination(false);
  };

  // Move to the next level
  const playNextLevel = () => {
    if (currentLevel < graphData.graphs.length - 1) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setNodes(graphData.graphs[nextLevel].nodes);
      setEdges(graphData.graphs[nextLevel].edges);
      setStartNode(graphData.graphs[nextLevel].startNode);
      setEndNode(graphData.graphs[nextLevel].endNode);
      playAgain();
    } else {
      setMessage('You have completed all levels!');
    }
  };

  // Undo the last step
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
    setLastClickedNode(lastEdge.from); // Go back to the previous node
    setMessage(''); // Clear message
    setReachedDestination(false); // Reset destination status
  }
};

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Svg height="400" width="400">
        {edges.map((edge, index) => {
          const startNode = nodes.find(n => n.id === edge.from);
          const endNode = nodes.find(n => n.id === edge.to);

          return (
            <Line
              key={index}
              x1={startNode.x}
              y1={startNode.y}
              x2={endNode.x}
              y2={endNode.y}
              stroke={isEdgeSelected(edge.from, edge.to) ? 'green' : 'yellow'}
              strokeWidth={isEdgeSelected(edge.from, edge.to) ? '3' : '2'}
            />
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
            key={node.id}
            x={node.x - 5}
            y={node.y + 5}
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {node.id}
          </SvgText>
        ))}

        {edges.map((edge, index) => {
          const startNode = nodes.find(n => n.id === edge.from);
          const endNode = nodes.find(n => n.id === edge.to);

          return (
            <SvgText
              key={index}
              x={(startNode.x + endNode.x) / 2}
              y={(startNode.y + endNode.y) / 2}
              fill="black"
              fontSize="15"
              fontWeight="bold"
            >
              {edge.weight}
            </SvgText>
          );
        })}
      </Svg>

      <Text style={{ marginTop: 20 }}>Total Weight: {totalWeight}</Text>

      <Button title="Undo Last Step" onPress={undo} disabled={gameOver} style={{ marginTop: 20 }} />
      <Button title="Check Path" onPress={checkPath} disabled={gameOver} style={{ marginTop: 10 }} />

      {message !== '' && <Text style={{ marginTop: 10 }}>{message}</Text>}

      {gameOver && (
        <Button
          title={message.includes('Bravo') ? 'Next Level' : 'Play Again'}
          onPress={message.includes('Bravo') ? playNextLevel : playAgain}
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  );
};

export default Graph;
