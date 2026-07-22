import pandas as pd

df = pd.read_csv("AIML/data/raw/Sample_Superstore.csv")

print(df.head())
df["Anomaly"] = df["Sales"].apply(
    lambda x: "Yes" if x > 5000 else "No"
)

print(
    df[["Order ID", "Sales", "Anomaly"]].head(20)
)

print(
    "Total Anomalies:",
    df[df["Anomaly"] == "Yes"].shape[0]
)
df.to_csv(
    "AIML/output/anomaly_results.csv",
    index=False
)

print("Anomaly Detection Completed Successfully!")
