import pandas as pd

# ==============================
# Load the Dataset
# ==============================
df = pd.read_csv("AIML/data/raw/Sample_Superstore.csv")

# ==============================
# Display Dataset Information
# ==============================
print("========== DATASET INFORMATION ==========")
df.info()

print("\n========== FIRST 5 ROWS ==========")
print(df.head())

print("\n========== DATASET SHAPE ==========")
print(df.shape)

# ==============================
# Check Missing Values
# ==============================
print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

# ==============================
# Check Duplicate Rows
# ==============================
print("\n========== DUPLICATE ROWS ==========")
print(df.duplicated().sum())

# ==============================
# Remove Duplicate Rows
# ==============================
df = df.drop_duplicates()

# ==============================
# Convert Date Columns
# ==============================
df['Order Date'] = pd.to_datetime(df['Order Date'], format='mixed')
df['Ship Date'] = pd.to_datetime(df['Ship Date'], format='mixed')

print("\n✅ Date columns converted successfully!")

# ==============================
# Display Data Types
# ==============================
print("\n========== DATA TYPES ==========")
print(df.dtypes)

# ==============================
# Feature Engineering
# ==============================
df['Order Year'] = df['Order Date'].dt.year
df['Order Month'] = df['Order Date'].dt.month
df['Order Day'] = df['Order Date'].dt.day

print("\n========== FEATURE ENGINEERING ==========")
print(df[['Order Date', 'Order Year', 'Order Month', 'Order Day']].head())

# ==============================
# Save Preprocessed Dataset
# ==============================
df.to_csv("AIML/data/processed/preprocessed_superstore.csv", index=False)

print("\n✅ Data Preprocessing Completed Successfully!")
print("Preprocessed dataset saved successfully.")
print("Location: AIML/data/processed/preprocessed_superstore.csv")