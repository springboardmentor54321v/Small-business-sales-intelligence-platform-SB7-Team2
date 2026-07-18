import pandas as pd
import matplotlib.pyplot as plt

# Load the preprocessed dataset
df = pd.read_csv("AIML/data/processed/preprocessed_superstore.csv")

# ==============================
# Basic Dataset Information
# ==============================
print("========== DATASET SHAPE ==========")
print(df.shape)

print("\n========== SUMMARY STATISTICS ==========")
print(df.describe())

# ==============================
# Sales by Category
# ==============================
category_sales = df.groupby('Category')['Sales'].sum()

plt.figure(figsize=(8,5))
category_sales.plot(kind='bar')
plt.title("Sales by Category")
plt.xlabel("Category")
plt.ylabel("Total Sales")
plt.tight_layout()
plt.show()

# ==============================
# Sales by Region
# ==============================
region_sales = df.groupby('Region')['Sales'].sum()

plt.figure(figsize=(8,5))
region_sales.plot(kind='bar')
plt.title("Sales by Region")
plt.xlabel("Region")
plt.ylabel("Total Sales")
plt.tight_layout()
plt.show()

# ==============================
# Profit Distribution
# ==============================
plt.figure(figsize=(8,5))
plt.hist(df['Profit'], bins=30)
plt.title("Profit Distribution")
plt.xlabel("Profit")
plt.ylabel("Frequency")
plt.tight_layout()
plt.show()

print("\n✅ Exploratory Data Analysis (EDA) Completed Successfully!")