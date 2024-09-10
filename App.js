import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import graphData from './assets/graphs.json';

const App = () => {
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    setGraph(graphData.graphs[0]); // Load the first graph for now
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shortest Path Game</Text>
      {graph && (
        <Svg height="300" width="300" viewBox="0 0 200 200">
          {/* Render edges */}
          {graph.edges.map((edge, index) => {
            const fromNode = graph.nodes.find(node => node.id === edge.from);
            const toNode = graph.nodes.find(node => node.id === edge.to);
            return (
              <Line
                key={index}
                x1={fromNode.x}
                y1={toNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="black"
                strokeWidth="1"
              />
            );
          })}

          {/* Render nodes */}
          {graph.nodes.map((node, index) => (
            <Circle
              key={index}
              cx={node.x}
              cy={node.y}
              r="5"
              fill="blue"
            />
          ))}

          {/* Render node labels */}
          {graph.nodes.map((node, index) => (
            <SvgText
              key={index}
              x={node.x}
              y={node.y - 15}
              fontSize="14"
              fill="black"
              textAnchor="middle"
            >
              {node.id}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default App;
