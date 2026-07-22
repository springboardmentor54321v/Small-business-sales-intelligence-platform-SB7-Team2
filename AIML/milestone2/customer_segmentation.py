import pandas as pd
from sklearn.cluster import KMeans
import os

df = pd.read_csv("AIML/data/raw/Sample_Superstore.csv")

print(df.head())
print(df.columns)
customer_data = df.groupby("Customer ID").agg(
    {
        "Sales": "sum",
        "Order ID": "count"
    }
).reset_index()

customer_data.rename(
    columns={"Order ID": "Purchase_Frequency"},
    inplace=True
)

print(customer_data.head())

kmeans = KMeans(n_clusters=3, random_state=42)

customer_data["Cluster"] = kmeans.fit_predict(
    customer_data[["Sales", "Purchase_Frequency"]]
)

print(customer_data.head())

cluster_names = {
    0: "Loyal",
    1: "Occasional",
    2: "High-Value"
}

customer_data["Customer_Segment"] = customer_data["Cluster"].map(cluster_names)

print(customer_data.head())

os.makedirs("AIML/output", exist_ok=True)

customer_data.to_csv(
    "AIML/output/customer_segments.csv",
    index=False
)

print("Customer Segmentation Completed Successfully!")

print(customer_data["Customer ID"].head(10))