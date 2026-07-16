import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# ==========================
# Load Preprocessed Dataset
# ==========================
df = pd.read_csv("AIML/data/processed/preprocessed_superstore.csv")

# ==========================
# Select Features & Target
# ==========================
X = df[["Quantity", "Discount", "Order Year", "Order Month", "Order Day"]]
y = df["Sales"]

# ==========================
# Split Dataset
# ==========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ==========================
# Train Model
# ==========================
model = LinearRegression()
model.fit(X_train, y_train)

print("✅ Model Training Completed Successfully!")

# ==========================
# Model Evaluation
# ==========================
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\n========== MODEL EVALUATION ==========")
print(f"Mean Absolute Error (MAE): {mae:.2f}")
print(f"Mean Squared Error (MSE): {mse:.2f}")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
print(f"R2 Score: {r2:.4f}")

# ==========================
# Save Model
# ==========================
joblib.dump(model, "AIML/models/sales_prediction_model.pkl")

print("\n✅ Model saved successfully!")
print("Location: AIML/models/sales_prediction_model.pkl")

# ==========================
# Save Evaluation Report
# ==========================
with open("AIML/output/model_evaluation_report.txt", "w") as file:
    file.write("MODEL EVALUATION REPORT\n")
    file.write("=======================\n\n")
    file.write("Algorithm: Linear Regression\n\n")
    file.write(f"Mean Absolute Error (MAE): {mae:.2f}\n")
    file.write(f"Mean Squared Error (MSE): {mse:.2f}\n")
    file.write(f"Root Mean Squared Error (RMSE): {rmse:.2f}\n")
    file.write(f"R2 Score: {r2:.4f}\n\n")
    file.write("Observations:\n")
    file.write("- The model successfully predicts sales.\n")
    file.write("- This serves as a baseline forecasting model.\n")
    file.write("- Future improvements can use Random Forest and XGBoost.\n")

print("\n✅ Model Evaluation Report saved successfully!")
print("Location: AIML/output/model_evaluation_report.txt")