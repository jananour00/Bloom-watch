import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

# Function to train Random Forest for bloom prediction
def train_random_forest_model(data_file='bulk_ndvi_data.csv', model_file='models/bloom_model.joblib'):
    """
    Train Random Forest model for bloom prediction using NDVI data.
    """
    try:
        df = pd.read_csv(data_file)
        # Features: NDVI, lat, lon, month
        df['month'] = pd.to_datetime(df['date']).dt.month
        features = ['NDVI', 'lat', 'lon', 'month']
        target = 'bloom_probability'  # Assuming we have this

        if 'bloom_probability' not in df.columns:
            # Create synthetic target
            df['bloom_probability'] = (df['NDVI'] > 0.3).astype(int)

        X = df[features]
        y = df['bloom_probability']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        print(f"Random Forest - MSE: {mse:.4f}, R2: {r2:.4f}")

        # Save model
        os.makedirs(os.path.dirname(model_file), exist_ok=True)
        joblib.dump(model, model_file)
        print(f"Model saved to {model_file}")

        return model, mse, r2
    except Exception as e:
        print(f"Error training Random Forest: {e}")
        return None, None, None

# Function to train LSTM for time series forecasting
def train_lstm_model(data_file='NDVI_TimeSeries_CentralValley (2).csv', model_file='models/forecasting_lstm.joblib'):
    """
    Train LSTM model for NDVI time series forecasting.
    """
    try:
        df = pd.read_csv(data_file)
        df['date'] = pd.to_datetime(df[['year', 'month']].assign(day=1))
        df = df.sort_values('date')

        # Use NDVI as target
        data = df['NDVI'].values.reshape(-1, 1)

        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)

        # Create sequences
        seq_length = 30
        X, y = [], []
        for i in range(len(scaled_data) - seq_length):
            X.append(scaled_data[i:i+seq_length])
            y.append(scaled_data[i+seq_length])

        X = np.array(X)
        y = np.array(y)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Build LSTM model
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(seq_length, 1)),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(1)
        ])

        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.1, verbose=1)

        # Evaluate
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        print(f"LSTM - MSE: {mse:.4f}")

        # Save model and scaler
        os.makedirs(os.path.dirname(model_file), exist_ok=True)
        model.save(model_file.replace('.joblib', '.h5'))
        joblib.dump(scaler, model_file.replace('.joblib', '_scaler.joblib'))
        print(f"LSTM model saved to {model_file.replace('.joblib', '.h5')}")

        return model, scaler, mse
    except Exception as e:
        print(f"Error training LSTM: {e}")
        return None, None, None

# Function to train clustering model for bloom patterns
def train_clustering_model(data_file='bulk_ndvi_data.csv', model_file='models/bloom_clustering.joblib'):
    """
    Train clustering model for bloom patterns.
    """
    try:
        from sklearn.cluster import KMeans

        df = pd.read_csv(data_file)
        features = ['NDVI', 'lat', 'lon']

        X = df[features].dropna()

        kmeans = KMeans(n_clusters=3, random_state=42)
        kmeans.fit(X)

        # Save model
        os.makedirs(os.path.dirname(model_file), exist_ok=True)
        joblib.dump(kmeans, model_file)
        print(f"Clustering model saved to {model_file}")

        return kmeans
    except Exception as e:
        print(f"Error training clustering: {e}")
        return None

# Main training function
if __name__ == "__main__":
    print("Starting model training...")

    # Train Random Forest
    rf_model, rf_mse, rf_r2 = train_random_forest_model()

    # Train LSTM
    lstm_model, scaler, lstm_mse = train_lstm_model()

    # Train Clustering
    cluster_model = train_clustering_model()

    print("Model training completed!")
