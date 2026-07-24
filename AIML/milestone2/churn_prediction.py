import pandas as pd

df = pd.read_csv("AIML/data/raw/Sample_Superstore.csv")

customer_data = df.groupby("Customer ID").agg(
    {
        "Order ID": "count",
        "Sales": "sum"
    }
).reset_index()

customer_data.rename(
    columns={"Order ID": "Purchase_Frequency"},
    inplace=True
)

print(customer_data.head())

def predict_churn(frequency):

    if frequency <= 3:
        return "High Risk"

    elif frequency <= 7:
        return "Medium Risk"

    else:
        return "Low Risk"


customer_data["Churn_Risk"] = customer_data[
    "Purchase_Frequency"
].apply(predict_churn)

print(customer_data.head())

customer_data.to_csv(
    "AIML/output/churn_predictions.csv",
    index=False
)

print("Churn Prediction Completed Successfully!")