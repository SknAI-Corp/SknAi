import React, { useState } from "react";
import axios from "axios";
import { Container, Button, Typography, CircularProgress, AppBar, Toolbar, Card, CardContent, Box  } from "@mui/material";

const App = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [prediction, setPrediction] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file.size > 500000) { // 500 KB limit
            alert("Image too large! Please upload a smaller image.");
            return;
        }
        setSelectedImage(file);
    };

    const handleSubmit = async () => {
        if (!selectedImage) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("image", selectedImage);

        try {
            const response = await axios.post("http://localhost:5000/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPrediction(response.data.prediction);
        } catch (error) {
            console.error("Error uploading image", error);
            setPrediction("Error processing image");
        }
        setLoading(false);
    };

    return (
        <>
        <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Image Classifier</Typography>
                </Toolbar>
         </AppBar>
        {/* <Container maxWidth="sm" style={{ marginTop: "50px", textAlign: "center" }}>
            <Typography variant="h4">Chat Image Classifier</Typography>
            <input type="file" onChange={handleImageUpload} />
            <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: "20px" }}>
                Predict
            </Button>
            {loading && <CircularProgress style={{ marginTop: "20px" }} />}
            {prediction && <Typography variant="h6" style={{ marginTop: "20px" }}>Prediction: {prediction}</Typography>}
        </Container> */}
        <Card sx={{ maxWidth: 400, textAlign: "center", padding: 2, margin: "auto", mt:"80px" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload an Image
        </Typography>
        <Box sx={{ marginBottom: 2, marginTop: 6 }}>
          {/* <input
            type="file"
            
            onChange={handleImageUpload}
            style={{ display: "none" }}
            
          />
          <label htmlFor="upload-button">
            <Button variant="contained" onClick={handleSubmit} component="span">
              Choose File
            </Button>
          </label> */}
          <input type="file" onChange={handleImageUpload} />
            <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: "20px" }}>
                Predict
            </Button>
        </Box>
        
      </CardContent>
      {loading && <CircularProgress style={{ marginTop: "20px" }} />}
            {prediction && <Typography variant="h6" style={{ marginTop: "20px" }}>Prediction: {prediction}</Typography>}
    </Card>
        </>
    );
};

export default App;
