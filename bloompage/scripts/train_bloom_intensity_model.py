"""
Train regression model for bloom intensity prediction
Predicts continuous bloom intensity score
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib

def prepare_features(df):
    """Prepare feature matrix for training"""
    features = [
        'ndvi',
        'evi',
        'soilMoisture',
        'temperature',
        'precipitation',
        'ndvi_slope',
        'ndvi_rolling_avg',
        'evi_rolling_avg'
    ]
    
    X = df[features].fillna(0)
    
    # Create continuous intensity target from NDVI and EVI
    y = (df['ndvi'] + df['evi']) / 2
    
    return X, y

def train_bloom_intensity_regressor(data_file, model_output='bloom_intensity_model.pkl'):
    """
    Train bloom intensity regression model
    
    Args:
        data_file: Path to processed CSV data
        model_output: Path to save trained model
    """
    print("Loading processed data...")
    df = pd.read_csv(data_file)
    
    print(f"Total records: {len(df)}")
    
    # Prepare features and target
    X, y = prepare_features(df)
    
    print(f"\nFeatures: {list(X.columns)}")
    print(f"Target range: {y.min():.4f} to {y.max():.4f}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train Random Forest regressor
    print("\nTraining Random Forest regressor...")
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    print("\nEvaluating model...")
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    y_pred = model.predict(X_test)
    
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Training R²: {train_score:.4f}")
    print(f"Test R²: {test_score:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE: {mae:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    # Feature importance
    print("\nFeature Importance:")
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print(feature_importance)
    
    # Save model
    print(f"\nSaving model to {model_output}...")
    joblib.dump(model, model_output)
    joblib.dump(list(X.columns), 'bloom_intensity_features.pkl')
    
    print("Model training complete!")
    
    return model, feature_importance

if __name__ == "__main__":
    model, importance = train_bloom_intensity_regressor('bloom_processed_data.csv')
