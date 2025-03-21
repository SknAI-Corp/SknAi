# SKNAI - React Native App

## Overview
**SKNAI** is a React Native mobile application built using **Expo CLI**. This app leverages React Native's capabilities to provide a seamless user experience across iOS and Android devices.

## Features
- Cross-platform compatibility (iOS & Android)
- Built using Expo for easy development & deployment
- Intuitive UI/UX with React Native components
- State management with Context API
- API integration
- Authentication 

## Installation
To set up and run the project locally, follow these steps:

### Prerequisites
- Install [Node.js](https://nodejs.org/)
- Install [Expo CLI](https://docs.expo.dev/get-started/installation/):
  ```sh
  npm install -g expo-cli
  ```

### Install Dependencies
```sh
npm install
```

### Run the App
```sh
expo start
```
This will start the development server. You can then scan the QR code using the Expo Go app on your device or run it on an emulator.

## Project Structure
```
/sknai/Frontend/sknai-classifier/
│── /assets          # Static assets like images
│── /components      # Reusable UI components
│── /screens         # App screens
│── /hooks      # Navigation setup
│── App.js           # Main entry file
│── package.json     # Project metadata & dependencies
│── app.json         # Expo configuration
```

## Deployment
To build the app for production:
```sh
expo build:android  # For Android APK/AAB
expo build:ios      # For iOS (requires Apple Developer Account)
```
To publish the app:
```sh
expo publish
```

## License
This project is licensed under the [MIT License](LICENSE).

