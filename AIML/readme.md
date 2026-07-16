# Small Business Sales Intelligence Platform - AI/ML Module

## AI/ML Engineer
Keerthika Devi S S

## Project Overview
This AI/ML module predicts sales using historical Superstore sales data. The model was developed using Python and Scikit-learn and integrated with FastAPI.

## Technologies Used
- Python
- Pandas
- NumPy
- Matplotlib
- Scikit-learn
- FastAPI
- Uvicorn
- Joblib

## Workflow
1. Data Collection
2. Data Loading
3. Data Understanding
4. Data Cleaning
5. Data Preprocessing
6. Feature Engineering
7. Exploratory Data Analysis (EDA)
8. Model Training
9. Model Evaluation
10. Model Saving
11. Prediction API using FastAPI

## Machine Learning Model
- Algorithm: Linear Regression

## Evaluation Metrics
- MAE
- MSE
- RMSE
- R² Score

## API Endpoint
GET /predict

## Project Status
Milestone 1 Completed Successfully

## API Testing

The FastAPI service was successfully tested using Swagger UI.

Sample Input:
- Quantity: 5
- Discount: 0.2
- Order Year: 2017
- Order Month: 10
- Order Day: 15

Sample Output:
Predicted Sales: 284.89