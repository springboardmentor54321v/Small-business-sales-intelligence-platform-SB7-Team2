import pandas as pd

df = pd.read_csv("AIML/data/raw/Sample_Superstore.csv")

print(df.head())
print(df.columns)

def recommend_products(product_id):

    product = df[df["Product ID"] == product_id]

    if product.empty:
        return "Product Not Found"

    category = product.iloc[0]["Category"]

    recommendations = df[
        (df["Category"] == category)
        & (df["Product ID"] != product_id)
    ]

    return recommendations[
        ["Product ID", "Product Name", "Category"]
    ].head(5)

print(recommend_products("FUR-BO-10001798"))

recommendations = recommend_products(
    "FUR-BO-10001798"
)

recommendations.to_csv(
    "AIML/output/recommendations.csv",
    index=False
)

print("Recommendation System Completed!")
print(df["Product ID"].head())