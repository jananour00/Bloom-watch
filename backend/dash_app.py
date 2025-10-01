# dash_app.py
import os
import json
from datetime import datetime, timedelta
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from utils import fetch_power_point, build_features_from_df
import xgboost as xgb

import dash
from dash import html, dcc, Output, Input, State, callback_context
import dash_bootstrap_components as dbc
import dash_leaflet as dl
import plotly.express as px
import plotly.graph_objects as go

MODELS_DIR = Path(os.environ.get("MODELS_DIR", "./models"))
MODEL_FILE = MODELS_DIR / "bloom_model.joblib"
if not MODEL_FILE.exists():
    raise SystemExit(f"Model file not found at {MODEL_FILE}. Run model_train.py first.")

obj = joblib.load(MODEL_FILE)
bst = obj["model"]
FEATURE_COLS = obj["feature_columns"]

# Load additional models
CLUSTER_MODEL = MODELS_DIR / "bloom_clustering.joblib"
DESERT_MODEL = MODELS_DIR / "desertification_rf.joblib"
FORECAST_MODEL = MODELS_DIR / "forecasting_lstm.joblib"

if CLUSTER_MODEL.exists():
    cluster_obj = joblib.load(CLUSTER_MODEL)
    kmeans = cluster_obj["kmeans"]
    cluster_scaler = cluster_obj["scaler"]
    CLUSTER_COLS = cluster_obj["feature_columns"]
else:
    kmeans = None

if DESERT_MODEL.exists():
    desert_obj = joblib.load(DESERT_MODEL)
    rf = desert_obj["rf"]
    DESERT_COLS = desert_obj["feature_columns"]
else:
    rf = None

if FORECAST_MODEL.exists():
    forecast_obj = joblib.load(FORECAST_MODEL)
    lstm = forecast_obj["lstm"]
    forecast_scaler = forecast_obj["scaler"]
    seq_length = forecast_obj["seq_length"]
else:
    lstm = None

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
server = app.server

# initial layout
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H2("BloomWatch — Advanced Analytics (POWER-driven demo)"), width=9),
        dbc.Col(dbc.Button("Train Model (run script)", color="secondary", href="/"), width=3)
    ], align="center"),
    dbc.Row([
        dbc.Col([
            html.H5("Map (click to select a point)"),
            dl.Map(center=[30.0444, 31.2357], zoom=4, children=[
                dl.TileLayer(),
                dl.Marker(position=[30.0444, 31.2357], id="marker", draggable=True),
                dl.LayerGroup(id="layer"),
            ], style={'width': '100%', 'height': '400px'}, id="map"),
            html.Br(),
            dbc.Row([
                dbc.Col(dcc.DatePickerRange(
                    id='date-range',
                    min_date_allowed=datetime(2017,1,1),
                    max_date_allowed=datetime.today(),
                    start_date=(datetime.today() - timedelta(days=365)).date(),
                    end_date=datetime.today().date()
                ), width=8),
                dbc.Col(dbc.Button("Fetch & Predict", id="fetch-btn", color="primary"), width=4)
            ]),
            html.Br(),
            dbc.Card([
                dbc.CardBody([
                    html.H6("Selected point info"),
                    html.Div(id="point-info"),
                    html.Div(id="predict-info")
                ])
            ])
        ], width=5),

        dbc.Col([
            html.H5("Time Series & Forecast"),
            dcc.Loading(id="loading-ts", children=[
                dcc.Graph(id="timeseries-plot")
            ]),
            html.Br(),
            html.H5("Feature importance (global)"),
            dcc.Graph(id="feat-importance")
        ], width=7)
    ]),
    dbc.Row([
        dbc.Col(html.Div(id="debug"), width=12)
    ])
], fluid=True)

# helper to prepare features for most recent month
def prepare_latest_features(lat, lon, start_date, end_date):
    # fetch daily POWER for the point and period
    start = start_date.strftime("%Y%m%d")
    end = end_date.strftime("%Y%m%d")
    try:
        df_daily = fetch_power_point(lat, lon, start, end)
    except BaseException as e:
        raise RuntimeError(f"Failed to fetch POWER data: {e}")
    feat = build_features_from_df(df_daily, n_lags=6)
    return df_daily, feat

@app.callback(
    Output("marker", "position"),
    Output("point-info", "children"),
    Input("map", "click_lat_lng"),
    State("marker", "position")
)
def update_marker(click_lat_lng, current_pos):
    if not click_lat_lng:
        return current_pos, f"Default marker at {current_pos[0]:.4f}, {current_pos[1]:.4f}"
    lat, lon = click_lat_lng
    return [lat, lon], f"Selected: lat={lat:.4f}, lon={lon:.4f}"

@app.callback(
    Output("timeseries-plot", "figure"),
    Output("predict-info", "children"),
    Output("feat-importance", "figure"),
    Output("debug", "children"),
    Input("fetch-btn", "n_clicks"),
    State("marker", "position"),
    State("date-range", "start_date"),
    State("date-range", "end_date")
)
def on_fetch(n_clicks, marker_pos, start_date, end_date):
    ctx = callback_context
    if not ctx.triggered:
        # initial empty figure
        fig0 = go.Figure()
        fig0.update_layout(title="Time series will appear after fetch")
        return fig0, "", go.Figure(), ""
    lat, lon = marker_pos
    sd = pd.to_datetime(start_date)
    ed = pd.to_datetime(end_date)
    try:
        df_daily, feat_monthly = prepare_latest_features(lat, lon, sd, ed)
    except Exception as e:
        return go.Figure(), f"Error fetching data: {e}", go.Figure(), str(e)

    # plot daily T2M & precipitation
    fig = make_ts_figure(df_daily)

    # take the most recent month available in monthly features
    if feat_monthly.shape[0] < 2:
        return fig, "Not enough monthly history to predict", go.Figure(), "Not enough monthly history"

    latest_row = feat_monthly.iloc[-1]
    Xvec = latest_row[FEATURE_COLS].values.reshape(1, -1)
    # XGBoost booster predict - convert to DMatrix
    dm = xgb.DMatrix(Xvec, feature_names=FEATURE_COLS)
    probs = bst.predict(dm)[0]  # probabilities for 4 classes
    pred_class = np.argmax(probs)
    class_names = ['No Bloom', 'Early Bloom', 'Peak Bloom', 'Late Bloom']
    pred_text = f"Predicted bloom stage next month: {class_names[pred_class]} (prob: {probs[pred_class]:.3f})"
    pred_text += f"<br>Probabilities: No Bloom: {probs[0]:.3f}, Early: {probs[1]:.3f}, Peak: {probs[2]:.3f}, Late: {probs[3]:.3f}"

    # Clustering bloom stage
    if kmeans is not None and CLUSTER_COLS:
        cluster_feat = latest_row[CLUSTER_COLS].values.reshape(1, -1)
        cluster_feat_scaled = cluster_scaler.transform(cluster_feat)
        cluster_pred = kmeans.predict(cluster_feat_scaled)[0]
        cluster_names = ['No Bloom Cluster', 'Early Bloom Cluster', 'Peak Bloom Cluster', 'Late Bloom Cluster']
        pred_text += f"<br>Clustering: {cluster_names[cluster_pred]}"

    # Desertification risk
    if rf is not None and DESERT_COLS:
        desert_feat = latest_row[DESERT_COLS].values.reshape(1, -1)
        risk_prob = rf.predict_proba(desert_feat)[0][1]
        pred_text += f"<br>Desertification Risk: {risk_prob:.3f}"

    # Forecast next temp
    if lstm is not None and feat_monthly.shape[0] >= seq_length:
        recent_temps = feat_monthly["T2M_t"].tail(seq_length).values.reshape(-1, 1)
        recent_scaled = forecast_scaler.transform(recent_temps)
        recent_scaled = recent_scaled.reshape(1, seq_length, 1)
        forecast_scaled = lstm.predict(recent_scaled)[0]
        forecast_temp = forecast_scaler.inverse_transform(forecast_scaled.reshape(-1, 1))[0][0]
        pred_text += f"<br>Forecasted T2M next month: {forecast_temp:.1f} °C"

    # feature importance (global) from booster
    try:
        fscore = bst.get_score(importance_type='gain')
        # map to feature columns
        fi = {k: fscore.get(k, 0.0) for k in FEATURE_COLS}
        # sort top 10
        fi_items = sorted(fi.items(), key=lambda x: x[1], reverse=True)[:12]
        feat_names = [i[0] for i in fi_items]
        feat_vals  = [i[1] for i in fi_items]
        fig_fi = go.Figure([go.Bar(x=feat_names, y=feat_vals)])
        fig_fi.update_layout(title="Feature importance (gain, top features)", xaxis_tickangle=-45, height=350)
    except Exception as e:
        fig_fi = go.Figure()
        fig_fi.update_layout(title="Feature importance not available")
    # debug info: show latest features (as JSON snippet)
    debug_info = json.dumps(dict(lat=float(lat), lon=float(lon), date=str(feat_monthly.index[-1].date()), probs=probs.tolist()), indent=2)
    return fig, pred_text, fig_fi, debug_info

def make_ts_figure(df_daily):
    # df_daily indexed by date, columns like T2M, PRECTOT
    fig = go.Figure()
    if "T2M" in df_daily.columns:
        fig.add_trace(go.Scatter(x=df_daily.index, y=df_daily["T2M"], name="T2M (°C)"))
    if "PRECTOT" in df_daily.columns:
        fig.add_trace(go.Bar(x=df_daily.index, y=df_daily["PRECTOT"], name="PRECTOT (mm)"))
    fig.update_layout(title="Daily climate (POWER) at selected point", height=400)
    return fig

if __name__ == '__main__':
    app.run_server(debug=True, port=8050)
