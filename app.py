"""
app.py - Flask Web Application for Sales Forecasting
Routes: / (UI), /predict (POST), /metrics (GET), /retrain (POST), /dataset (GET)
"""

from flask import Flask, render_template, request, jsonify
import json
import os
from model import load_data, train_model, save_model, predict

app = Flask(__name__)

# 1 USD = approx 83.5 INR (update as needed)
USD_TO_INR = 83.5


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict_sales():
    """
    POST /predict
    Body: { advertising_spend, num_salespeople, avg_price, currency }
    currency = 'USD' or 'INR'
    Returns: { predicted_sales_usd, predicted_sales_inr, inputs }
    """
    try:
        data = request.get_json()
        currency         = data.get('currency', 'USD').upper()
        advertising_spend = float(data['advertising_spend'])
        num_salespeople   = int(data['num_salespeople'])
        avg_price         = float(data['avg_price'])

        # If inputs are in INR, convert to USD for the model
        if currency == 'INR':
            advertising_spend_usd = advertising_spend / USD_TO_INR
            avg_price_usd         = avg_price         / USD_TO_INR
        else:
            advertising_spend_usd = advertising_spend
            avg_price_usd         = avg_price

        if advertising_spend_usd <= 0 or num_salespeople <= 0 or avg_price_usd <= 0:
            return jsonify({'error': 'All values must be greater than zero'}), 400

        predicted_usd = predict(advertising_spend_usd, num_salespeople, avg_price_usd)
        predicted_inr = round(predicted_usd * USD_TO_INR, 2)

        return jsonify({
            'predicted_sales_usd': predicted_usd,
            'predicted_sales_inr': predicted_inr,
            'usd_to_inr_rate': USD_TO_INR,
            'inputs': {
                'advertising_spend': advertising_spend,
                'num_salespeople': num_salespeople,
                'avg_price': avg_price,
                'currency': currency
            }
        })

    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/metrics', methods=['GET'])
def get_metrics():
    try:
        metrics_path = 'model/metrics.json'
        if not os.path.exists(metrics_path):
            return jsonify({'error': 'Model not trained yet. Run train.py first.'}), 404
        with open(metrics_path, 'r') as f:
            metrics = json.load(f)
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/retrain', methods=['POST'])
def retrain_model():
    try:
        df = load_data('sales_data.csv')
        model, scaler, metrics = train_model(df)
        save_model(model, scaler)
        save_metrics = {k: v for k, v in metrics.items()
                        if k not in ('actual', 'predicted')}
        with open('model/metrics.json', 'w') as f:
            json.dump(save_metrics, f, indent=2)
        return jsonify({'message': 'Model retrained successfully!', 'metrics': save_metrics})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/dataset', methods=['GET'])
def get_dataset():
    try:
        df = load_data('sales_data.csv')
        limit = request.args.get('limit', 50, type=int)
        return jsonify({
            'columns': df.columns.tolist(),
            'data': df.head(limit).to_dict(orient='records'),
            'total_rows': len(df)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    if not os.path.exists('model/sales_model.pkl'):
        print("⚠️  Model not found. Training now...")
        df = load_data('sales_data.csv')
        model, scaler, metrics = train_model(df)
        save_model(model, scaler)
        save_metrics = {k: v for k, v in metrics.items()
                        if k not in ('actual', 'predicted')}
        os.makedirs('model', exist_ok=True)
        with open('model/metrics.json', 'w') as f:
            json.dump(save_metrics, f, indent=2)

    print("🚀 Starting SalesCast at http://127.0.0.1:5000")
    app.run(debug=True)