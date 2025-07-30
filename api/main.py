from fastapi import FastAPI,UploadFile,File
from traitlets import Bytes
import uvicorn
import io
from PIL import Image
import numpy as np
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware

app =  FastAPI()

origins = [
    "http://localhost",
    "http://loca  lhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL =tf.keras.models.load_model("./Project/api/my_model.keras")
CLASS_NAMES =["Early Blight", "Late Blight", "Healthy"]


@app.get("/ping")
async def ping ():
    return "hello , I am working !"

# def read_file_as_image(data) -> np.ndarray:
#        image = np.array(Image.open(Bytes(data)))
#        return image
import io
def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(io.BytesIO(data)))
    return image

@app.post("/predict")
async def predict(
    file:UploadFile = File(...)
):
    image= read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, axis=0)
    prediction = MODEL.predict(img_batch)
    predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
    confidence = np.max(prediction[0])
    return {
        "class": predicted_class,
        "confidence": float(confidence)
    }

if __name__ =="__main__":
    uvicorn.run(app, host='localhost', port=8000)