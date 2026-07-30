import pandas as pd

# Load dataset
df = pd.read_csv("AIML/data/processed/preprocessed_superstore.csv")

# Group products by category
recommendations = (
    df.groupby("Category")["Product Name"]
    .apply(list)
    .reset_index()
)

# Remove duplicates
recommendations["Product Name"] = recommendations[
    "Product Name"
].apply(lambda x: list(set(x)))

# Save output
recommendations.to_csv(
    "AIML/output/recommendations_v2.csv",
    index=False
)

print("Improved Product Recommendation Completed!")
print(recommendations.head())