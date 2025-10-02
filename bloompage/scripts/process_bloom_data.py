"""
Data processing script for NASA bloom detection data
Processes raw satellite data and prepares it for AI models
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def normalize_ndvi(ndvi_series):
    """Normalize NDVI values to 0-1 range"""
    return (ndvi_series + 1) / 2

def calculate_rolling_average(series, window=5):
    """Calculate rolling average for time series"""
    return series.rolling(window=window, center=True, min_periods=1).mean()

def calculate_slope(series):
    """Calculate rate of change (slope) for time series"""
    return series.diff()

def detect_anomalies(series):
    """Detect anomalies using z-score method"""
    mean = series.mean()
    std = series.std()
    return (series - mean) / std

def classify_bloom_stage(row):
    """Classify bloom stage based on NDVI and slope"""
    ndvi = row['ndvi']
    slope = row['ndvi_slope']
    
    if ndvi < 0.3:
        return 'Pre-bloom'
    elif ndvi >= 0.3 and ndvi < 0.5 and slope > 0:
        return 'Onset'
    elif ndvi >= 0.5 and ndvi < 0.7:
        return 'Peak'
    elif slope < 0 and ndvi > 0.3:
        return 'Decline'
    else:
        return 'Post-bloom'

def calculate_bloom_intensity(row):
    """Calculate bloom intensity from NDVI and EVI"""
    avg = (row['ndvi'] + row['evi']) / 2
    
    if avg < 0.4:
        return 'Mild'
    elif avg < 0.6:
        return 'Moderate'
    else:
        return 'Peak'

def process_bloom_dataset(input_file, output_file):
    """
    Main processing function
    
    Args:
        input_file: Path to raw CSV data
        output_file: Path to save processed data
    """
    print(f"Loading data from {input_file}...")
    df = pd.read_csv(input_file)
    
    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Sort by region and date
    df = df.sort_values(['region', 'date'])
    
    print("Processing features...")
    
    # Group by region for time-series calculations
    processed_dfs = []
    
    for region, group in df.groupby('region'):
        print(f"  Processing region: {region}")
        
        # Calculate rolling averages
        group['ndvi_rolling_avg'] = calculate_rolling_average(group['ndvi'])
        group['evi_rolling_avg'] = calculate_rolling_average(group['evi'])
        
        # Calculate slopes
        group['ndvi_slope'] = calculate_slope(group['ndvi'])
        group['evi_slope'] = calculate_slope(group['evi'])
        
        # Detect anomalies
        group['temperature_anomaly'] = detect_anomalies(group['temperature'])
        group['precipitation_anomaly'] = detect_anomalies(group['precipitation'])
        
        processed_dfs.append(group)
    
    # Combine all regions
    df_processed = pd.concat(processed_dfs, ignore_index=True)
    
    # Fill NaN values from slope calculations
    df_processed['ndvi_slope'] = df_processed['ndvi_slope'].fillna(0)
    df_processed['evi_slope'] = df_processed['evi_slope'].fillna(0)
    
    # Classify bloom stages and intensity
    print("Classifying bloom stages...")
    df_processed['bloom_stage'] = df_processed.apply(classify_bloom_stage, axis=1)
    df_processed['bloom_intensity'] = df_processed.apply(calculate_bloom_intensity, axis=1)
    
    # Save processed data
    print(f"Saving processed data to {output_file}...")
    df_processed.to_csv(output_file, index=False)
    
    # Print statistics
    print("\nProcessing complete!")
    print(f"Total records: {len(df_processed)}")
    print(f"Date range: {df_processed['date'].min()} to {df_processed['date'].max()}")
    print(f"Regions: {df_processed['region'].nunique()}")
    print("\nBloom stage distribution:")
    print(df_processed['bloom_stage'].value_counts())
    print("\nBloom intensity distribution:")
    print(df_processed['bloom_intensity'].value_counts())

if __name__ == "__main__":
    # Example usage
    input_file = "bloom_raw_data.csv"
    output_file = "bloom_processed_data.csv"
    
    process_bloom_dataset(input_file, output_file)
    
    print("\nData processing pipeline complete!")
