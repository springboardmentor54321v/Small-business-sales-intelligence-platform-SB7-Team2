import pandas as pd
from sklearn.cluster import KMeans

# Load dataset
df = pd.read_csv("AIML/data/processed/preprocessed_superstore.csv")

# Select features
X = df[["Sales", "Quantity", "Profit"]]

# Apply K-Means
kmeans = KMeans(n_clusters=3, random_state=42)
df["Customer_Segment"] = kmeans.fit_predict(X)

# Save output
df.to_csv(
    "AIML/output/customer_segments_v2.csv",
    index=False
)

print("Customer Segmentation Improved Successfully!")
print(df[["Customer ID", "Customer_Segment"]].head())