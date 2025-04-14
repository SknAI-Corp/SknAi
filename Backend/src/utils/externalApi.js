import axios from "axios";

export const callClassifierAPI = async (imageUrl) => {
  try {
    const res = await axios.post("http://192.168.5.67:8080/predict", {
      image_url: imageUrl
    });
    return res.data?.prediction || null;
  } catch (err) {
    console.error("Classifier API failed", err.message);
    return null;
  }
};

export const callQnAAPI = async ({ user_message, predicted_disease, session_id }) => {
  try {
    const res = await axios.post("http://127.0.0.1:8081/chat", {
      user_message,
      user_id:"123456", //TODO: SHould be removed
      predicted_disease,
      session_id
    });
    return res.data;
  } catch (err) {
    console.error("QnA API failed", err.message);
    return { response: null };
  }
};
