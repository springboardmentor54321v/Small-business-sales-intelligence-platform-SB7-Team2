import pandas as pd

# Load dataset
df = pd.read_csv("AIML/data/processed/preprocessed_superstore.csv")

# Calculate statistical limits
mean_sales = df["Sales"].mean()
std_sales = df["Sales"].std()

upper_limit = mean_sales + (2 * std_sales)
lower_limit = mean_sales - (2 * std_sales)

# Detect anomalies
df["Anomaly"] = df["Sales"].apply(
    lambda x: "Yes"
    if x > upper_limit or x < lower_limit
    else "No"
)

# Save output
df.to_csv(
    "AIML/output/anomaly_results_v2.csv",
    index=False
)

print("Improved Anomaly Detection Completed!")
print(df[["Sales", "Anomaly"]].head())
print("\nUpper Limit:", upper_limit)
print("Lower Limit:", lower_limit)