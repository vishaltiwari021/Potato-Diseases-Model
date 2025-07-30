from fastapi import FastAPI,UploadFile,File
from traitlets import Bytes
import uvicorn
from PIL import Image
import numpy as np
import tensorflow as tf
import requests

app =  FastAPI()
endpoint = "http://localhost:8501/v1/models/predict"
CLASS_NAMES =["Early Blight", "Late Blight", "Healthy"]



@app.get("/ping")
async def ping ():
    return "hello , I am working !"

def read_file_as_image(data) -> np.ndarray:
       image = np.array(Image.open(Bytes(data)))
       return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, axis=0)
    json_data = {
        "instances": img_batch.tolist()
    }
    response = requests.post(endpoint, json=json_data)
    prediction = response.json()["predictions"][0]
    predicted_class = CLASS_NAMES[np.argmax(prediction)]
    confidence = float(np.max(prediction))
    return {
        "class": predicted_class,
        "confidence": confidence
    }

if __name__ =="__main__":
    uvicorn.run(app, host='localhost', port=8000)