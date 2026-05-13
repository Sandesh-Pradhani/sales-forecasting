/* ============================================
   SalesCast - script.js
   - Currency toggle USD/INR
   - Animated LR explainer canvas
   - Coefficient explanation cards
   - Plain-English model equation
   - Trend chart annotation
   ============================================ */

// ─── Currency State ───────────────────────────
let currentCurrency = 'USD';
const USD_TO_INR = 83.5;

const SLIDER_CONFIG = {
  USD: {
    adSpend:  { min: 1000,    max: 20000,   step: 500,   default: 12000,   prefix: '$' },
    avgPrice: { min: 10,      max: 300,     step: 5,     default: 130,     prefix: '$' },
  },
  INR: {
    adSpend:  { min: 83500,   max: 1670000, step: 41750, default: 1002000, prefix: '₹' },
    avgPrice: { min: 835,     max: 25050,   step: 418,   default: 10855,   prefix: '₹' },
  }
};

function toggleCurrency() {
  currentCurrency = currentCurrency === 'USD' ? 'INR' : 'USD';
  applyCurrentCurrency();
}

function applyCurrentCurrency() {
  const isINR = currentCurrency === 'INR';
  const sym   = isINR ? '₹' : '$';
  const cfg   = SLIDER_CONFIG[currentCurrency];

  document.querySelector('.toggle-track').classList.toggle('inr', isINR);
  document.getElementById('curLabelUSD').classList.toggle('active', !isINR);
  document.getElementById('curLabelINR').classList.toggle('active',  isINR);

  const bar = document.getElementById('currencyBar');
  bar.classList.toggle('inr-active', isINR);
  document.getElementById('currencyBarText').innerHTML =
    `Entering values in <strong>${isINR ? 'INR (₹)' : 'USD ($)'}</strong>`;

  document.getElementById('labelAdSpend').textContent  = `Advertising Spend (${sym})`;
  document.getElementById('labelAvgPrice').textContent = `Average Price per Unit (${sym})`;
  document.getElementById('prefixAdSpend').textContent  = sym;
  document.getElementById('prefixAvgPrice').textContent = sym;

  const adSlider = document.getElementById('adSpendSlider');
  adSlider.min = cfg.adSpend.min; adSlider.max = cfg.adSpend.max;
  adSlider.step = cfg.adSpend.step; adSlider.value = cfg.adSpend.default;
  document.getElementById('adSpend').value = cfg.adSpend.default;
  document.getElementById('adSpendVal').textContent = sym + Number(cfg.adSpend.default).toLocaleString();

  const priceSlider = document.getElementById('avgPriceSlider');
  priceSlider.min = cfg.avgPrice.min; priceSlider.max = cfg.avgPrice.max;
  priceSlider.step = cfg.avgPrice.step; priceSlider.value = cfg.avgPrice.default;
  document.getElementById('avgPrice').value = cfg.avgPrice.default;
  document.getElementById('avgPriceVal').textContent = sym + Number(cfg.avgPrice.default).toLocaleString();

  document.getElementById('resultBox').classList.add('hidden');
  document.getElementById('errorBox').classList.add('hidden');
}


// ─── Slider Sync ─────────────────────────────
function syncSlider(sliderId, inputId, displayId, prefixFn) {
  const slider  = document.getElementById(sliderId);
  const input   = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  slider.addEventListener('input', () => {
    input.value = slider.value;
    display.textContent = prefixFn() + Number(slider.value).toLocaleString();
  });
  input.addEventListener('input', () => {
    slider.value = input.value;
    display.textContent = prefixFn() + Number(input.value).toLocaleString();
  });
}
syncSlider('adSpendSlider',  'adSpend',  'adSpendVal',  () => currentCurrency === 'INR' ? '₹' : '$');
syncSlider('numSalesSlider', 'numSales', 'numSalesVal', () => '');
syncSlider('avgPriceSlider', 'avgPrice', 'avgPriceVal', () => currentCurrency === 'INR' ? '₹' : '$');

document.getElementById('adSpend').value  = 12000;
document.getElementById('numSales').value = 15;
document.getElementById('avgPrice').value = 130;


// ─── Tab switching ────────────────────────────
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btn.classList.add('active');
}


// ─── Chart defaults ───────────────────────────
Chart.defaults.color = '#d4dff0';
Chart.defaults.font  = { family: 'Space Mono, monospace', size: 11 };
let coeffChartRef = null;
let scatterChartRef = null;


// ─── Animated LR Canvas Explainer ─────────────
// Draws dots appearing one by one, then draws best-fit line
function startLRAnimation() {
  const canvas = document.getElementById('lrAnimCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Fixed size
  canvas.width  = canvas.offsetWidth  || 400;
  canvas.height = 200;

  // Sample training-like points (x=adSpend scaled, y=sales scaled)
  const raw = [
    [1,1.5],[1.5,2],[2,2.8],[2.5,3.2],[3,3.8],[3.5,4.5],
    [4,5],[4.5,5.5],[5,6.2],[5.5,7],[6,7.5],[6.5,8.2],
    [7,9],[7.5,9.5],[8,10]
  ];

  const W = canvas.width, H = canvas.height;
  const PAD = 30;

  // Scale to canvas
  const xMin = 0.5, xMax = 9, yMin = 0.5, yMax = 11;
  function toX(v) { return PAD + ((v - xMin) / (xMax - xMin)) * (W - PAD*2); }
  function toY(v) { return H - PAD - ((v - yMin) / (yMax - yMin)) * (H - PAD*2); }

  // Best-fit line params (pre-computed for these points)
  const m = 1.18, b = 0.25;

  let dotIdx = 0;
  let lineProgress = 0;
  let phase = 'dots'; // 'dots' → 'line' → 'done'
  const captions = [
    'Step 1: Plotting data — each dot is one sale record',
    'Step 2: Drawing best-fit line that minimises total error',
    'Step 3: Line is ready! Use it to predict any new Sales value'
  ];

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = '#1e2d45';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, PAD); ctx.lineTo(PAD, H - PAD);
    ctx.lineTo(W - PAD, H - PAD);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#5a6d8a';
    ctx.font = '10px Space Mono, monospace';
    ctx.fillText('Ad Spend →', W/2 - 30, H - 6);
    ctx.save();
    ctx.translate(12, H/2 + 20);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Sales →', 0, 0);
    ctx.restore();

    // Dots so far
    for (let i = 0; i < dotIdx && i < raw.length; i++) {
      const [rx, ry] = raw[i];
      ctx.beginPath();
      ctx.arc(toX(rx), toY(ry), 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,176,0.85)';
      ctx.fill();
    }

    // Best-fit line (animating)
    if (phase === 'line' || phase === 'done') {
      const x1 = xMin, x2 = xMin + (xMax - xMin) * lineProgress;
      const y1 = m * x1 + b, y2 = m * x2 + b;
      ctx.beginPath();
      ctx.moveTo(toX(x1), toY(y1));
      ctx.lineTo(toX(x2), toY(y2));
      ctx.strokeStyle = '#3d8bff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Y = mX + b label
      if (lineProgress > 0.6) {
        ctx.fillStyle = '#3d8bff';
        ctx.font = 'bold 11px Space Mono, monospace';
        ctx.fillText('Y = mX + b', toX(5.5), toY(7.5));
      }
    }
  }

  function tick() {
    if (phase === 'dots') {
      dotIdx++;
      document.getElementById('lrAnimCaption').textContent = captions[0];
      draw();
      if (dotIdx >= raw.length) {
        phase = 'line';
        document.getElementById('lrAnimCaption').textContent = captions[1];
      }
      setTimeout(tick, 120);
    } else if (phase === 'line') {
      lineProgress = Math.min(lineProgress + 0.06, 1);
      draw();
      if (lineProgress >= 1) {
        phase = 'done';
        document.getElementById('lrAnimCaption').textContent = captions[2];
      } else {
        requestAnimationFrame(tick);
      }
    }
  }

  tick();
}


// ─── Load Metrics ─────────────────────────────
async function loadMetrics() {
  try {
    const res  = await fetch('/metrics');
    const data = await res.json();
    if (data.error) return;
    drawCoeffChart(data.coefficients);
    buildEquation(data.coefficients, data.intercept);
  } catch (e) {
    console.warn('Could not load metrics:', e);
  }
}


// ─── Coefficients Chart + Explanation Cards ───
function drawCoeffChart(coefficients) {
  const labels = Object.keys(coefficients).map(k =>
    k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );
  const values = Object.values(coefficients);
  const colors = values.map(v => v >= 0 ? 'rgba(0,229,176,0.8)' : 'rgba(255,107,53,0.8)');

  if (coeffChartRef) coeffChartRef.destroy();

  coeffChartRef = new Chart(document.getElementById('coeffChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Coefficient',
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              const dir = v >= 0 ? '↑ increases' : '↓ decreases';
              return ` ${v.toFixed(2)}  →  Sales ${dir} by $${Math.abs(v).toFixed(0)} per unit`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: '#1e2d45' }, ticks: { color: '#5a6d8a' } },
        y: {
          grid: { color: '#1e2d45' }, ticks: { color: '#5a6d8a' },
          title: { display: true, text: 'Effect on Sales ($)', color: '#5a6d8a' }
        }
      }
    }
  });

  // Render explanation cards below chart
  const DESCRIPTIONS = {
    'advertising_spend': {
      icon: '📢',
      positive: 'More ad spend brings in more customers → Sales go UP. Positive coefficient ✅',
      negative: 'Unusual — more ad spend is reducing sales. Check dataset.'
    },
    'num_salespeople': {
      icon: '👤',
      positive: 'More salespeople → more deals closed → Sales go UP. Positive coefficient ✅',
      negative: 'Unusual — more people reducing sales. Check for data issues.'
    },
    'avg_price': {
      icon: '💰',
      positive: 'Higher price → more revenue per unit → Sales UP.',
      negative: 'Higher price → fewer units sold → total Sales go DOWN. Negative coefficient ⚠️ This is normal (price-demand effect).'
    }
  };

  const container = document.getElementById('coeffCards');
  if (!container) return;
  container.innerHTML = Object.entries(coefficients).map(([key, val]) => {
    const info = DESCRIPTIONS[key] || { icon: '📊', positive: 'Positive effect', negative: 'Negative effect' };
    const isPos = val >= 0;
    const colorClass = isPos ? 'coeff-pos' : 'coeff-neg';
    const arrow = isPos ? '▲' : '▼';
    const msg = isPos ? info.positive : info.negative;
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `
      <div class="coeff-card ${colorClass}">
        <div class="coeff-card-top">
          <span>${info.icon} ${label}</span>
          <span class="coeff-val">${arrow} ${val.toFixed(2)}</span>
        </div>
        <p>${msg}</p>
      </div>`;
  }).join('');
}


// ─── Model Equation + Plain English ──────────
function buildEquation(coefficients, intercept) {
  const panel = document.getElementById('coeffPanel');
  const box   = document.getElementById('equationBox');
  panel.style.display = 'block';

  // Raw equation line
  const terms = Object.entries(coefficients)
    .map(([k, v]) => {
      const sign = v >= 0 ? '+' : '−';
      return `${sign} ${Math.abs(v).toFixed(2)} × ${k.replace(/_/g, ' ')}`;
    }).join('  ');
  box.textContent = `Sales  =  ${intercept}  ${terms}`;

  // Plain English breakdown
  const plain = document.getElementById('equationPlain');
  if (!plain) return;

  const PLAIN = {
    'advertising_spend': (v) => v >= 0
      ? `Every <strong>$1 increase</strong> in Ad Spend adds <strong>$${v.toFixed(2)}</strong> to Sales`
      : `Every <strong>$1 increase</strong> in Ad Spend <em>reduces</em> Sales by <strong>$${Math.abs(v).toFixed(2)}</strong>`,
    'num_salespeople': (v) => v >= 0
      ? `Adding <strong>1 more salesperson</strong> adds <strong>$${v.toFixed(2)}</strong> to Sales`
      : `Adding <strong>1 more salesperson</strong> <em>reduces</em> Sales by <strong>$${Math.abs(v).toFixed(2)}</strong>`,
    'avg_price': (v) => v >= 0
      ? `Every <strong>$1 rise in price</strong> adds <strong>$${v.toFixed(2)}</strong> to Sales`
      : `Every <strong>$1 rise in price</strong> <em>reduces</em> Sales by <strong>$${Math.abs(v).toFixed(2)}</strong> (price-demand effect)`
  };

  plain.innerHTML = `
    <div class="plain-list">
      <div class="plain-item plain-base">
        <span>🔢 Base value (intercept)</span>
        <span>= $${intercept.toLocaleString()}</span>
      </div>
      ${Object.entries(coefficients).map(([k, v]) => {
        const fn = PLAIN[k] || ((v) => `${k}: coefficient ${v.toFixed(2)}`);
        const isPos = v >= 0;
        return `<div class="plain-item ${isPos ? 'plain-pos' : 'plain-neg'}">
          <span>${fn(v)}</span>
          <span class="plain-sign">${isPos ? '＋' : '－'}</span>
        </div>`;
      }).join('')}
    </div>`;
}


// ─── Load Dataset ─────────────────────────────
async function loadDataset() {
  try {
    const res  = await fetch('/dataset?limit=50');
    const data = await res.json();
    if (data.error) return;

    const head = document.getElementById('tableHead');
    const body = document.getElementById('tableBody');

    head.innerHTML = data.columns.map(c =>
      `<th>${c.replace(/_/g, ' ')}</th>`
    ).join('');
    body.innerHTML = data.data.map(row =>
      `<tr>${data.columns.map(c =>
        `<td>${typeof row[c] === 'number' ? row[c].toLocaleString() : row[c]}</td>`
      ).join('')}</tr>`
    ).join('');

    const badge = document.getElementById('datasetCountBadge');
    if (badge) badge.textContent = data.total_rows + ' rows';

    drawScatterChart(data.data);
  } catch (e) {
    console.warn('Could not load dataset:', e);
  }
}


// ─── Scatter Chart ────────────────────────────
function drawScatterChart(rows) {
  const points = rows.map(r => ({ x: r.advertising_spend, y: r.sales }));
  if (scatterChartRef) scatterChartRef.destroy();

  scatterChartRef = new Chart(document.getElementById('scatterChart'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Ad Spend vs Sales',
        data: points,
        backgroundColor: 'rgba(0,229,176,0.7)',
        pointRadius: 6,
        pointHoverRadius: 9
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx =>
              ` Ad Spend: $${ctx.parsed.x.toLocaleString()}  →  Sales: $${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Advertising Spend ($) — Higher spend = more customers', color: '#5a6d8a' },
          grid: { color: '#1e2d45' }, ticks: { color: '#5a6d8a' }
        },
        y: {
          title: { display: true, text: 'Sales Revenue ($)', color: '#5a6d8a' },
          grid: { color: '#1e2d45' }, ticks: { color: '#5a6d8a' }
        }
      }
    }
  });
}


// ─── Run Prediction ───────────────────────────
async function runPrediction() {
  const btn       = document.getElementById('predictBtn');
  const resultBox = document.getElementById('resultBox');
  const errorBox  = document.getElementById('errorBox');
  const isINR     = currentCurrency === 'INR';
  const sym       = isINR ? '₹' : '$';

  const adSpend  = parseFloat(document.getElementById('adSpend').value);
  const numSales = parseInt(document.getElementById('numSales').value);
  const avgPrice = parseFloat(document.getElementById('avgPrice').value);

  if (!adSpend || !numSales || !avgPrice) { showError('Please fill in all three fields.'); return; }
  if (adSpend <= 0 || numSales < 1 || avgPrice <= 0) { showError('All values must be greater than zero.'); return; }

  btn.innerHTML = '<span>Forecasting...</span>';
  btn.disabled = true;
  errorBox.classList.add('hidden');
  resultBox.classList.add('hidden');

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advertising_spend: adSpend,
        num_salespeople: numSales,
        avg_price: avgPrice,
        currency: currentCurrency
      })
    });
    const data = await res.json();
    if (data.error) { showError(data.error); return; }

    const primaryVal   = isINR ? data.predicted_sales_inr : data.predicted_sales_usd;
    const secondaryVal = isINR ? data.predicted_sales_usd : data.predicted_sales_inr;
    const secondarySym = isINR ? '$' : '₹';

    document.getElementById('resultValue').textContent =
      sym + primaryVal.toLocaleString(undefined, { maximumFractionDigits: 0 });
    document.getElementById('resultSecondary').textContent =
      `≈ ${secondarySym}${secondaryVal.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${isINR ? 'USD' : 'INR'})`;
    document.getElementById('resultBreakdown').textContent =
      `Ad Spend: ${sym}${adSpend.toLocaleString()} | People: ${numSales} | Avg Price: ${sym}${avgPrice.toLocaleString()}`;

    resultBox.classList.remove('hidden');
  } catch (e) {
    showError('Network error. Is the Flask server running?');
  } finally {
    btn.innerHTML = '<span>Run Forecast</span><span class="btn-arrow">→</span>';
    btn.disabled = false;
  }
}


// ─── Retrain ──────────────────────────────────
async function retrainModel() {
  const btn = document.querySelector('.btn-retrain');
  btn.textContent = '⏳ Retraining...';
  btn.disabled = true;
  try {
    const res  = await fetch('/retrain', { method: 'POST' });
    const data = await res.json();
    if (data.error) { alert('Error: ' + data.error); return; }
    alert(`✅ Retrained!\nR² Score: ${data.metrics.r2_score}\nRMSE: $${data.metrics.rmse}`);
    loadMetrics();
    loadDataset();
  } catch (e) {
    alert('Network error.');
  } finally {
    btn.textContent = '🔄 Retrain Model';
    btn.disabled = false;
  }
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.textContent = '⚠ ' + msg;
  box.classList.remove('hidden');
}


// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyCurrentCurrency();
  loadMetrics();
  loadDataset();
  startLRAnimation();
});