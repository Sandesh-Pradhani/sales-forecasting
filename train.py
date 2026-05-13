"""
train.py - Standalone script to train the sales forecasting model
Run this script to train the model and generate metrics.
"""

from model import load_data, train_model, save_model
import os
import json


def main():
    """Train the sales forecasting model."""
    print("=" * 50)
    print("Sales Forecasting Model Training")
    print("=" * 50)
    
    # Load data
    data_path = 'sales_data.csv'
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found!")
        return
    
    print(f"\nLoading data from {data_path}...")
    df = load_data(data_path)
    print(f"Loaded {len(df)} records")
    print(f"Columns: {df.columns.tolist()}")
    
    # Train model
    print("\nTraining model...")
    model, scaler, metrics = train_model(df)
    
    # Save model
    print("\nSaving model...")
    save_model(model, scaler)
    
    # Print metrics
    print("\n" + "=" * 50)
    print("Model Metrics")
    print("=" * 50)
    print(f"Training R² Score: {metrics['train_r2']:.4f}")
    print(f"Test R² Score: {metrics['test_r2']:.4f}")
    print(f"Training RMSE: {metrics['train_rmse']:.2f}")
    print(f"Test RMSE: {metrics['test_rmse']:.2f}")
    print(f"Training MAE: {metrics['train_mae']:.2f}")
    print(f"Test MAE: {metrics['test_mae']:.2f}")
    
    # Save metrics to JSON
    saveable_metrics = {k: v for k, v in metrics.items() 
                       if k not in ('actual', 'predicted')}
    os.makedirs('model', exist_ok=True)
    with open('model/metrics.json', 'w') as f:
        json.dump(saveable_metrics, f, indent=2)
    print(f"\nMetrics saved to model/metrics.json")
    
    print("\n" + "=" * 50)
    print("Training complete!")
    print("=" * 50)


if __name__ == '__main__':
    main()
