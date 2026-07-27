from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# CORS middleware to allow React app to connect directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Load Trained Model
# ==========================
model = joblib.load("models/sales_prediction_model.pkl")

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

# ==========================
# Customer Segmentation API
# ==========================
@app.get("/customer-segment/{customer_id}")
def get_customer_segment(customer_id: str):

    df = pd.read_csv("output/customer_segments.csv")

    result = df[df["Customer ID"] == customer_id]

    if result.empty:
        return {"message": "Customer not found"}

    return result.to_dict(orient="records")


# ==========================
# Churn Risk API
# ==========================
@app.get("/churn-risk/{customer_id}")
def get_churn_risk(customer_id: str):

    df = pd.read_csv("output/churn_predictions.csv")

    result = df[df["Customer ID"] == customer_id]

    if result.empty:
        return {"message": "Customer not found"}

    return result.to_dict(orient="records")


# ==========================
# Product Recommendation API
# ==========================
@app.get("/recommend-product/{product_id}")
def recommend_product(product_id: str):

    df = pd.read_csv("data/raw/Sample_Superstore.csv")

    product = df[df["Product ID"] == product_id]

    if product.empty:
        return {"message": "Product not found"}

    category = product.iloc[0]["Category"]

    recommendations = df[
        (df["Category"] == category)
        & (df["Product ID"] != product_id)
    ]

    return recommendations[
        ["Product ID", "Product Name", "Category"]
    ].head(5).to_dict(orient="records")


# ==========================
# Anomaly Detection API
# ==========================
@app.get("/anomaly/{order_id}")
def get_anomaly(order_id: str):

    df = pd.read_csv("output/anomaly_results.csv")

    result = df[df["Order ID"] == order_id]

    if result.empty:
        return {"message": "Order ID not found"}

    return result[
        ["Order ID", "Sales", "Anomaly"]
    ].to_dict(orient="records")