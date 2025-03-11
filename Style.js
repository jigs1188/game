import { StyleSheet } from 'react-native';
import { Button } from 'react-native-web';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    // paddingTop: 20,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonSpacing: {
    marginVertical: 10,
  },
  teacherControls: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputBox: {
    borderWidth: 1,
    padding: 5,
    width: 80,
    marginBottom: 5,
  },
  gameMessage: {
    marginTop: 10,
  },
  gameControls: {
    marginVertical: 20,
  },
  homeButton: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'lightgray',
  },
  teacherControls: {
    marginVertical: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button:{
  // flexDirection: 'row',
  //   backgroundColor: 'lightgray',
  //   padding: 10,
  //   borderRadius: 5,
  //   margin: 5,
  },
  
  
});
