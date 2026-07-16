from fastapi import FastAPI
import pandas as pd
import joblib

# ==========================
# Create FastAPI App
# ==========================
app = FastAPI(
    title="Sales Prediction API",
    description="API for predicting sales using a trained Linear Regression model",
    version="1.0"
)

# ==========================
# Load Trained Model
# ==========================
model = joblib.load("AIML/models/sales_prediction_model.pkl")

# ==========================
# Home Endpoint
# ==========================
@app.get("/")
def home():
    return {
        "message": "Welcome to the Sales Prediction API!",
        "status": "API is running successfully."
    }

# ==========================
# Prediction Endpoint
# ==========================
@app.get("/predict")
def predict(
    quantity: int,
    discount: float,
    year: int,
    month: int,
    day: int
):
    data = pd.DataFrame({
        "Quantity": [quantity],
        "Discount": [discount],
        "Order Year": [year],
        "Order Month": [month],
        "Order Day": [day]
    })

    prediction = model.predict(data)

    return {
        "Quantity": quantity,
        "Discount": discount,
        "Order Year": year,
        "Order Month": month,
        "Order Day": day,
        "Predicted Sales": round(float(prediction[0]), 2)
    }