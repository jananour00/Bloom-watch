"""
Train LSTM-based time series model for bloom forecasting
Predicts future bloom stages and timing
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

# Note: This is a simplified version. For production, use TensorFlow/PyTorch
# For now, we'll use a simpler approach with sklearn

from sklearn.ensemble import GradientBoostingClassifier

def create_lag_features(df, lag_periods=[1, 2, 3, 4]):
    """Create lagged features for time series prediction"""
    df = df.copy()
    
    for lag in lag_periods:
        df[f'ndvi_lag_{lag}'] = df.groupby('region')['ndvi'].shift(lag)
        df[f'evi_lag_{lag}'] = df.groupby('region')['evi'].shift(lag)
        df[f'temp_lag_{lag}'] = df.groupby('region')['temperature'].shift(lag)
    
    return df.dropna()

def prepare_forecast_features(df):
    """Prepare features for forecasting model"""
    features = [
        'ndvi', 'evi', 'soilMoisture', 'temperature', 'precipitation',
        'ndvi_slope', 'ndvi_rolling_avg',
        'ndvi_lag_1', 'ndvi_lag_2', 'ndvi_lag_3', 'ndvi_lag_4',
        'evi_lag_1', 'evi_lag_2', 'evi_lag_3', 'evi_lag_4',
        'temp_lag_1', 'temp_lag_2', 'temp_lag_3', 'temp_lag_4'
    ]
    
    X = df[features].fillna(0)
    y = df['bloom_stage']
    
    return X, y

def train_bloom_forecast_model(data_file, model_output='bloom_forecast_model.pkl'):
    """
    Train bloom forecasting model
    
    Args:
        data_file: Path to processed CSV data
        model_output: Path to save trained model
    """
    print("Loading processed data...")
    df = pd.read_csv(data_file)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(['region', 'date'])
    
    print(f"Total records: {len(df)}")
    
    # Create lag features
    print("Creating lag features...")
    df = create_lag_features(df)
    
    print(f"Records after lag features: {len(df)}")
    
    # Prepare features
    X, y = prepare_forecast_features(df)
    
    print(f"\nFeatures: {list(X.columns)}")
    print(f"Feature shape: {X.shape}")
    
    # Split data (time-aware split)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train Gradient Boosting model
    print("\nTraining Gradient Boosting classifier...")
    model = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=10,
        learning_rate=0.1,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"\nTraining accuracy: {train_score:.4f}")
    print(f"Test accuracy: {test_score:.4f}")
    
    # Feature importance
    print("\nTop 10 Most Important Features:")
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False).head(10)
    print(feature_importance)
    
    # Save model
    print(f"\nSaving model to {model_output}...")
    joblib.dump(model, model_output)
    joblib.dump(list(X.columns), 'bloom_forecast_features.pkl')
    
    print("Forecast model training complete!")
    
    return model

if __name__ == "__main__":
    model = train_bloom_forecast_model('bloom_processed_data.csv')
