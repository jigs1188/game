// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TextInput, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import graphData from './assets/graph.json';
import { dijkstra, bellmanFord, calculateOptimalPath  } from './Algorithms';
import { styles } from './Style';
import Login from './Login';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [teacherOperation, setTeacherOperation] = useState('sum'); // 'sum' | 'multiplication'



  // useEffect(() => {
  //   checkLoginState();
  // }, []);

 
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

  };

  // App.js
useEffect(() => {
  if (startNode && endNode) {
    const { weight } = calculateOptimalPath(
      nodes,
      edges,
      startNode,
      endNode,
      teacherOperation
    );
    setOptimalPathWeight(weight);
  }
}, [startNode, endNode, nodes, edges, teacherOperation]);


  // const displayRunningTotal = (additionalWeight) => {
  //   setTotalWeight(prevWeight => prevWeight + additionalWeight);
  // };


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

    const precision = teacherOperation === 'multiplication' ? 1e-6 : 0;
    const isValid = Math.abs(totalWeight - optimalPathWeight) <= precision;

    if (isValid) {
      setMessage('Bravo! You found the optimal path weight!');
      setGameOver(true);
    } else {
      setMessage(`Sorry, your path weight (${totalWeight}) is not optimal (${optimalPathWeight})`);
      setGameOver(true);
    }
  

    if (totalWeight == optimalPathWeight) {
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

    }
  };

  const handleNegativeCycleAdjustment = () => {
    const result = bellmanFord(nodes, edges, startNode, endNode);
    if (result.negativeCycleEdges.length > 0) {
      setEdges(result.adjustedEdges); // Update with adjusted edges




      Alert.alert("Negative cycle fixed! Weights adjusted.");
    } else {
      Alert.alert("No negative cycles detected.");
    }
  };
 
  /**
   * Randomly generates new edge weights within the specified range.
   */
  // App.js
const generateRandomEdges = () => {
  if (!validateWeights()) return;
  
  const newEdges = edges.map(edge => ({
    ...edge,
    weight: Math.floor(Math.random() * (parseInt(maxWeight) - parseInt(minWeight) + 1)) + parseInt(minWeight),
  }));
  
  setEdges(newEdges);
  
  // Recalculate optimal path with new edges and current operation
  const { weight } = calculateOptimalPath(
    nodes,
    newEdges,
    startNode,
    endNode,
    teacherOperation
  );
  
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

  const displayRunningTotal = (additionalWeight) => {
    setTotalWeight((prevWeight) =>
      teacherOperation === 'multiplication'
        ? prevWeight === 0
          ? additionalWeight
          : prevWeight * additionalWeight
        : prevWeight + additionalWeight
    );
  };
  

 

  return (
    <View style={styles.container}>
      {!mode ? (
        // Mode Selection Screen
        <View style={styles.homeContainer}>
          <Text style={styles.titleText}>Select Mode</Text>
          <Button title="Student Mode" onPress={() => setMode('student')} />
          <View style={styles.buttonSpacing} />
          <Button title="Teacher Mode" onPress={() => setMode('teacher')} />
        </View>
     ) : !isAuthenticated ? (
      // Authentication Screen
      <Login mode={mode} onAuthSuccess={() => setIsAuthenticated(true)} />
    ) : (
        // Game Screen (redirects based on mode)
        <>
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
                  <SvgText x={midX} y={midY - 10} fill="black" fontSize="10" fontWeight="bold">
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
              <SvgText key={node.id + '-label'} x={node.x} y={node.y + 5} fill="white" fontSize="12" fontWeight="bold">
                {node.id}
              </SvgText>
            ))}
          </Svg>

          {mode === 'teacher' && !gameOver && (
  <View style={styles.teacherControls}>
    <TextInput
      style={styles.inputBox}
      placeholder="Min Weight"
      keyboardType="numeric"
      value={minWeight}
      onChangeText={(text) => setMinWeight(text)}
    />
    <TextInput
      style={styles.inputBox}
      placeholder="Max Weight"
      keyboardType="numeric"
      value={maxWeight}
      onChangeText={(text) => setMaxWeight(text)}
    />
    <Button title="Generate New Weights" onPress={generateRandomEdges} />
    <Button
      title={`Switch to ${
        teacherOperation === 'sum' ? 'Multiplication' : 'Sum'
      }`}
      onPress={() =>
        setTeacherOperation((prev) =>
          prev === 'sum' ? 'multiplication' : 'sum'
        )
      }
    />
  </View>
)}


          <Text style={styles.gameMessage}>{message}</Text>
          {gameOver && (
            <View style={styles.gameControls}>
              <Button title={message.includes('Bravo') ? 'Next Level' : 'Play Again'} onPress={playAgainOrNextLevel} />
            </View>
          )}
          <Button title="Undo" onPress={undo} />
          <Button title="Check Path" onPress={checkPath} />
          <Button title="Reset Graph" onPress={resetGraph} />
          <Button title="Fix Negative Cycles" onPress={handleNegativeCycleAdjustment} />
        </>
      )}

      {/* Home Button */}
      <TouchableOpacity onPress={goHome} style={styles.homeButton}>
        <Text>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Graph;