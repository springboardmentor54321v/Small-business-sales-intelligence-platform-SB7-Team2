import joblib
import pandas as pd

# ==============================
# Load the Trained Model
# ==============================
model = joblib.load("AIML/models/sales_prediction_model.pkl")

print("✅ Model Loaded Successfully!")

# ==============================
# Sample Input Data
# ==============================
sample_data = pd.DataFrame({
    "Quantity": [5],
    "Discount": [0.20],
    "Order Year": [2017],
    "Order Month": [10],
    "Order Day": [15]
})

# ==============================
# Make Prediction
# ==============================
prediction = model.predict(sample_data)

print("\n========== SALES PREDICTION ==========")
print(f"Predicted Sales: {prediction[0]:.2f}")