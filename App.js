import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import graphData from './assets/graph.json';

const Graph = () => {
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [lastClickedNode, setLastClickedNode] = useState(1); // Start at node 1
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false); // To prevent further clicks after the game ends

  const endNode = 4; // Destination node
  const optimalPathWeight = 8; // Optimal path weight for this game

  useEffect(() => {
    const graph = graphData.graphs[0];
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, []);

  const handleNodeClick = (currentNode) => {
    if (gameOver || lastClickedNode === currentNode) return; // Prevent clicks after game ends or on the same node
  
    const edge = edges.find(
      (e) =>
        (e.from === lastClickedNode && e.to === currentNode) ||
        (e.from === currentNode && e.to === lastClickedNode)
    );
  
    if (edge) {
      const newEdge = { from: lastClickedNode, to: currentNode };
      setSelectedEdges([...selectedEdges, newEdge]);
      setTotalWeight(totalWeight + edge.weight);
      setLastClickedNode(currentNode);
  
      // Automatically check if the user has reached the destination
      if (currentNode === endNode) {
        if (totalWeight === optimalPathWeight) {
          setMessage('Bravo! You found the optimal path!');
          setGameOver(true); // End game after winning
        } else {
          setMessage('You have reached the destination!');
        }
      } else {
        setMessage(''); // Clear message if not at destination
      }
    } else {
      Alert.alert('Invalid move', 'There is no direct path between these nodes.');
    }
  };
  const isEdgeSelected = (from, to) => {
    return selectedEdges.some((edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from));
  };
  const checkPath = () => {
    if (lastClickedNode === endNode) {
      if (totalWeight === optimalPathWeight) {
        setMessage('Bravo! You found the optimal path!');
      } else {
        setMessage('Good try! But you can find a better path. Play again!');
      }
      setGameOver(true); // End game after reaching destination
    } else {
      setMessage('You have not reached the destination. Keep going!');
    }
  };

  const undo = () => {
    if (selectedEdges.length > 0 && !gameOver) {
      const lastEdge = selectedEdges[selectedEdges.length - 1];
      const newEdges = selectedEdges.slice(0, -1);
      setSelectedEdges(newEdges);
      setTotalWeight(
        totalWeight - edges.find(e => (e.from === lastEdge.from && e.to === lastEdge.to) || (e.from === lastEdge.to && e.to === lastEdge.from)).weight
      );
      setLastClickedNode(lastEdge.from); // Go back to the previous node
      setMessage(''); // Clear message
    }
  };
  const resetGame = () => {
    setSelectedEdges([]);
    setLastClickedNode(1); // Reset to start node
    setTotalWeight(0);
    setMessage('');
    setGameOver(false); // Allow clicking again
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Svg height="400" width="400">
        {/* Draw edges */}
        {edges.map((edge, index) => {
          const startNode = nodes.find((n) => n.id === edge.from);
          const endNode = nodes.find((n) => n.id === edge.to);

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

        {/* Draw nodes */}
        {nodes.map((node) => (
          <Circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={20}
            stroke="gray"
            strokeWidth="2"
            fill={node.id === 1 ? 'green' : node.id === endNode ? 'red' : 'blue'}
            onPress={() => handleNodeClick(node.id)}
          />
        ))}

        {/* Draw node IDs */}
        {nodes.map((node) => (
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

        {/* Draw edge weights */}
        {edges.map((edge, index) => {
          const startNode = nodes.find((n) => n.id === edge.from);
          const endNode = nodes.find((n) => n.id === edge.to);

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
        <Button title="Play Again" onPress={resetGame} style={{ marginTop: 10 }} />
      )}
    </View>
  );
};

export default Graph;
