# 🔮 SalesCast — Sales Forecasting using Linear Regression

A Machine Learning web application that predicts monthly sales revenue based on advertising spend, number of salespeople, and average product price. Built as a mini project for the Machine Learning course at BLDEA's V.P. Dr. P.G. Halakatti College of Engineering and Technology.

---

## 🚀 Quick Start

```bash
git clone https://github.com/sandesh-pradhani/Sales-forcasting.git
cd Sales-forcasting
pip install -r requirements.txt
python train.py
python app.py
```
Open `http://127.0.0.1:5000`

---

## ✨ Features

- 📈 Linear Regression model with R² ≈ 0.99
- 💱 Real-time USD ↔ INR currency toggle (1 USD = ₹83.5)
- 📊 Interactive Coefficients bar chart + Trend scatter plot
- 🔬 Model equation with plain-English explanation of every term
- 🗂️ Dataset preview — all 50 training rows visible
- 🎓 Animated Linear Regression visual explainer (no video needed)
- 🔄 One-click model retraining
- 🛡️ Input clamping to prevent negative predictions

---

## 🧠 How It Works

```
Advertising Spend ($)      ─┐
Number of Salespeople       ├─►  Linear Regression  ─►  Predicted Sales (₹ / $)
Average Price per Unit ($)  ─┘
```

**Model equation learned from data:**
```
Sales = 63,812 + 21,728 × Ad Spend − 5,442 × Avg Price + 9,688 × Salespeople
```

---

## 🗂️ Project Structure

```
Sales-forcasting/
├── app.py                  # Flask backend — 4 API routes
├── model.py                # ML core — train, predict, clamp
├── train.py                # Run once to train & save model
├── sales_data.csv          # 50-row training dataset
├── requirements.txt
├── model/
│   ├── sales_model.pkl     # Saved LinearRegression model
│   ├── scaler.pkl          # StandardScaler
│   ├── bounds.json         # Input range for clamping
│   └── metrics.json        # R², RMSE, MAE
├── templates/
│   └── index.html          # Full web dashboard
└── static/
    ├── style.css           # Dark terminal theme (Space Mono + Sora)
    └── script.js           # Charts, sliders, currency, prediction
```

---

## ⚙️ Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Train the model (only needed once)
python train.py

# Start the server
python app.py
```

---

## 🌐 API Routes

| Method | Route       | Description                        |
|--------|-------------|------------------------------------|
| GET    | `/`         | Serve the web dashboard            |
| POST   | `/predict`  | Predict sales from input features  |
| GET    | `/metrics`  | Return model R², RMSE, MAE         |
| GET    | `/dataset`  | Return dataset rows for preview    |
| POST   | `/retrain`  | Retrain model on current CSV       |

---

## 📦 Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Language   | Python 3                         |
| ML         | scikit-learn — LinearRegression  |
| Backend    | Flask                            |
| Data       | pandas, NumPy                    |
| Model Save | joblib                           |
| Frontend   | HTML, CSS, JavaScript            |
| Charts     | Chart.js                         |
| Fonts      | Space Mono + Sora (Google Fonts) |

---

## 📊 Model Performance

| Metric   | Value      |
|----------|------------|
| R² Score | ≈ 0.99     |
| RMSE     | ₹2,37,975  |
| MAE      | ₹1,75,350  |
| Train    | 40 rows    |
| Test     | 10 rows    |

---

## 📁 Dataset

50 rows · 3 input features · 1 target variable

| Feature              | Range                       | Effect    |
|----------------------|-----------------------------|-----------|
| Advertising Spend    | ₹2,50,500 → ₹11,69,000     | ↑ Sales   |
| Num. Salespeople     | 8 → 21 people               | ↑ Sales   |
| Avg Price per Unit   | ₹1,670 → ₹3,757             | ↓ Sales   |
| Sales Revenue (Y)    | ₹23,38,000 → ₹1,06,88,000  | Target    |

> Avg Price has a **negative coefficient** — higher price → fewer units sold → total revenue drops. This is the price-demand effect and is expected.

---

## 🔭 Future Scope

- Try Random Forest / XGBoost for comparison
- Add features like season, region, day of week
- Connect to live MySQL / Firebase database
- Deploy on Render / Railway / AWS
- Add user login and prediction history log

---

## 👨‍💻 Developer

**Sandesh Pradhani** · Roll No: 2BL23CI042  
Dept. of CSE (Artificial Intelligence & Machine Learning)  
BLDEA's V.P. Dr. P.G. Halakatti College of Engineering and Technology, Vijayapura

---

## 🏫 Academic Details

| Field       | Details                                        |
|-------------|------------------------------------------------|
| Course      | Machine Learning Mini Project                  |
| University  | Visvesvaraya Technological University, Belagavi|
| Guide       | Prof. Sneha Talikoti                           |
| Year        | 2026 – 27                                      |

---

## 📄 License

Academic project — for learning and demonstration purposes only.