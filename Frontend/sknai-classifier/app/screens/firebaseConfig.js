// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";

// // Your Firebase Config (Replace with your credentials)
// const firebaseConfig = {
//     apiKey: "AIzaSyAr0lyowy7eLXcdWOTNYv14fjjQRLPfItA",
//     authDomain: "sknai-bb557.firebaseapp.com",  // Typically in the format: projectId.firebaseapp.com
//     projectId: "sknai-bb557",
//     storageBucket: "sknai-bb557.appspot.com",  // Typically in the format: projectId.appspot.com
//     messagingSenderId: "42226817909",
//     appId: "1:42226817909:ios:a34e7dcedb5f98e2c9913c",
//   };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const googleProvider = new GoogleAuthProvider();

// export { auth, googleProvider, signInWithCredential };
import React, { Component } from 'react'
import { Text, View } from 'react-native'

export class firebaseConfig extends Component {
  render() {
    return (
      <View>
        <Text> textInComponent </Text>
      </View>
    )
  }
}

export default firebaseConfig
