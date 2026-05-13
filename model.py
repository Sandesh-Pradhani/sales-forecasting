"""
model.py - Linear Regression Sales Forecasting Model
Core ML logic: training, evaluation, and prediction
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler
import joblib
import os

FEATURES = ['advertising_spend', 'num_salespeople', 'avg_price']
TARGET = 'sales'
MODEL_PATH = 'model/sales_model.pkl'
SCALER_PATH = 'model/scaler.pkl'
BOUNDS_PATH = 'model/bounds.json'


def load_data(filepath='sales_data.csv'):
    """Load and validate the dataset."""
    df = pd.read_csv(filepath)
    print(f"✅ Data loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(df.describe())
    return df


def train_model(df):
    """
    Train a Linear Regression model.
    Returns: model, scaler, metrics dict
    """
    X = df[FEATURES]
    y = df[TARGET]

    # Save training data bounds for clamping predictions later
    import json
    bounds = {
        'min_sales': float(y.min()),
        'max_sales': float(y.max()),
        'features': {
            col: {'min': float(X[col].min()), 'max': float(X[col].max())}
            for col in FEATURES
        }
    }
    os.makedirs('model', exist_ok=True)
    with open(BOUNDS_PATH, 'w') as f:
        json.dump(bounds, f, indent=2)

    # Split data: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Linear Regression
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)

    # Predictions
    y_train_pred = model.predict(X_train_scaled)
    y_test_pred = model.predict(X_test_scaled)

    # Evaluation Metrics
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    train_mae = mean_absolute_error(y_train, y_train_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)

    metrics = {
        'train_r2': round(train_r2, 4),
        'test_r2': round(test_r2, 4),
        'train_rmse': round(train_rmse, 2),
        'test_rmse': round(test_rmse, 2),
        'train_mae': round(train_mae, 2),
        'test_mae': round(test_mae, 2),
        'r2_score': round(test_r2, 4),
        'rmse': round(test_rmse, 2),
        'mae': round(test_mae, 2),
        'mse': round(mean_squared_error(y_test, y_test_pred), 2),
        'coefficients': dict(zip(FEATURES, model.coef_.tolist())),
        'intercept': round(model.intercept_, 2),
        'train_size': len(X_train),
        'test_size': len(X_test),
        'actual': y_test.tolist(),
        'predicted': [round(v, 2) for v in y_test_pred.tolist()]
    }

    print(f"\n📊 Model Metrics:")
    print(f"   R² Score : {test_r2:.4f}")
    print(f"   RMSE     : {test_rmse:.2f}")
    print(f"   MAE      : {test_mae:.2f}")

    return model, scaler, metrics


def save_model(model, scaler):
    """Save trained model and scaler to disk."""
    os.makedirs('model', exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"✅ Model saved to {MODEL_PATH}")


def load_model():
    """Load model and scaler from disk."""
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    return model, scaler


def predict(advertising_spend, num_salespeople, avg_price):
    """
    Make a single prediction given feature values.
    - Inputs are soft-clamped to training data range to avoid wild extrapolation
    - Result is always >= minimum training sales value (never negative)
    Returns predicted sales as float (USD).
    """
    import json

    model, scaler = load_model()

    # Load training bounds
    min_sales = 0.0
    if os.path.exists(BOUNDS_PATH):
        with open(BOUNDS_PATH, 'r') as f:
            bounds = json.load(f)
        min_sales = max(0.0, bounds['min_sales'] * 0.5)  # allow slightly below min

        # Soft-clamp inputs to 80%-120% of training range to prevent bad extrapolation
        def clamp(val, feature):
            lo = bounds['features'][feature]['min'] * 0.5
            hi = bounds['features'][feature]['max'] * 1.5
            return max(lo, min(hi, val))

        advertising_spend  = clamp(advertising_spend,  'advertising_spend')
        num_salespeople    = clamp(num_salespeople,     'num_salespeople')
        avg_price          = clamp(avg_price,           'avg_price')

    input_data = np.array([[advertising_spend, num_salespeople, avg_price]])
    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled)[0]

    # Never return negative — floor at a sensible minimum
    return round(max(min_sales, prediction), 2)