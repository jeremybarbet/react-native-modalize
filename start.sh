#!/bin/bash
if [ -z $@ ]
  # If no command passed to yarn start, we just watch the src folder
  then
    yarn
    yarn tsc --watch

elif [ $@ == "expo" ]
  # Expo example
  then
    echo "Running Expo example..."
    cd examples/expo
    yarn
    yarn start

elif [ $@ == "react-native-navigation" ]
  # React Native Navigation example
  then
    echo "Running React Native Navigation example..."
    cd examples/react-native-navigation
    yarn
    yarn start

elif [ $@ == "react-navigation" ]
  # React Navigation example
  then
    echo "Running React Navigation example..."
    cd examples/react-navigation
    yarn
    yarn start

fi
