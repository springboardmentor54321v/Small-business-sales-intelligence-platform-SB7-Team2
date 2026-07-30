import pandas as pd

# Load dataset
df = pd.read_csv("AIML/data/processed/preprocessed_superstore.csv")

# Calculate total sales per customer
customer_sales = df.groupby("Customer ID")["Sales"].sum().reset_index()

# Improved churn logic
def classify_churn(sales):
    if sales > 5000:
        return "Low Risk"
    elif sales > 1000:
        return "Medium Risk"
    else:
        return "High Risk"

customer_sales["Churn_Risk"] = customer_sales["Sales"].apply(classify_churn)

# Save output
customer_sales.to_csv(
    "AIML/output/churn_predictions_v2.csv",
    index=False
)

print("Improved Churn Prediction Completed!")
print(customer_sales.head())