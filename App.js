import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Button } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import graphData from './assets/graph.json';

const Graph = () => {
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [message, setMessage] = useState('');
  const shortestPathWeight = 11; // Calculated shortest path weight for the graph

  useEffect(() => {
    const graph = graphData.graphs[0];
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, []);

  const handleEdgeClick = (from, to, weight) => {
    const newEdge = { from, to };
    setSelectedEdges([...selectedEdges, newEdge]);
    setTotalWeight(totalWeight + weight);
  };

  const isEdgeSelected = (from, to) => {
    return selectedEdges.some(edge => edge.from === from && edge.to === to);
  };

  const undo = () => {
    if (selectedEdges.length > 0) {
      const lastEdge = selectedEdges[selectedEdges.length - 1];
      const newEdges = selectedEdges.slice(0, -1);
      setSelectedEdges(newEdges);
      setTotalWeight(totalWeight - lastEdge.weight);
    }
  };

  const checkPath = () => {
    if (totalWeight === shortestPathWeight) {
      setMessage('Bravo! You found the shortest path!');
    } else {
      setMessage('Try again!');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Svg height="400" width="400">
        {/* Draw Edges */}
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
              onPress={() => handleEdgeClick(edge.from, edge.to, edge.weight)}
            />
          );
        })}

        {/* Draw Nodes */}
        {nodes.map(node => (
          <Circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={20}
            stroke="goldenrod"
            strokeWidth="2"
            
            fill="silver"
            onPress={() => handleEdgeClick(node.id, node.id, 0)}
            >
            <SvgText x={node.x - 10} y={node.y - 10} fill="black" fontSize="12" fontWeight="bold">
              {node.id}
            </SvgText>
          </Circle>
        ))}

        {/* Draw Weights */}
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

      <Button title="Undo Last Step" onPress={undo} style={{ marginTop: 20 }} />
      <Button title="Check Path" onPress={checkPath} style={{ paddingTop: 20 }} />
      {message !== '' && <Text>{message}</Text>}
    </View>
  );
};

export default Graph;
