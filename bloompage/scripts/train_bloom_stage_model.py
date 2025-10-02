"""
Train Random Forest model for bloom stage classification
Uses NDVI, EVI, soil moisture, temperature, and precipitation
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
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
    y = df['bloom_stage']
    
    return X, y

def train_bloom_stage_classifier(data_file, model_output='bloom_stage_model.pkl'):
    """
    Train bloom stage classification model
    
    Args:
        data_file: Path to processed CSV data
        model_output: Path to save trained model
    """
    print("Loading processed data...")
    df = pd.read_csv(data_file)
    
    print(f"Total records: {len(df)}")
    print(f"Bloom stages: {df['bloom_stage'].unique()}")
    
    # Prepare features and labels
    X, y = prepare_features(df)
    
    print(f"\nFeatures: {list(X.columns)}")
    print(f"Feature shape: {X.shape}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train Random Forest model
    print("\nTraining Random Forest classifier...")
    model = RandomForestClassifier(
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
    
    print(f"Training accuracy: {train_score:.4f}")
    print(f"Test accuracy: {test_score:.4f}")
    
    # Predictions
    y_pred = model.predict(X_test)
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
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
    
    # Save feature names for later use
    joblib.dump(list(X.columns), 'bloom_stage_features.pkl')
    
    print("Model training complete!")
    
    return model, feature_importance

if __name__ == "__main__":
    model, importance = train_bloom_stage_classifier('bloom_processed_data.csv')
