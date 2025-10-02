"""
Generate sample bloom data for testing
Creates synthetic NASA satellite data for demonstration
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_bloom_data(
    start_date='2018-01-01',
    end_date='2024-12-31',
    regions=['Nile Delta', 'Ethiopian Highlands', 'Kenya Rift Valley', 'Nigerian Savanna', 'South African Highveld'],
    output_file='bloom_raw_data.csv'
):
    """
    Generate synthetic bloom data for testing
    
    Args:
        start_date: Start date for data generation
        end_date: End date for data generation
        regions: List of regions to generate data for
        output_file: Output CSV file path
    """
    print("Generating sample bloom data...")
    
    data = []
    
    # Generate weekly data for each region
    current_date = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    
    region_coords = {
        'Nile Delta': (30.0, 31.2),
        'Ethiopian Highlands': (9.0, 38.7),
        'Kenya Rift Valley': (-0.5, 36.0),
        'Nigerian Savanna': (9.0, 8.0),
        'South African Highveld': (-26.2, 28.0),
    }
    
    while current_date <= end:
        for region in regions:
            lat, lon = region_coords[region]
            
            # Simulate seasonal patterns
            day_of_year = current_date.timetuple().tm_yday
            
            # NDVI follows seasonal pattern (higher in spring/summer)
            ndvi_base = 0.5 + 0.3 * np.sin(2 * np.pi * (day_of_year - 80) / 365)
            ndvi = max(0, min(1, ndvi_base + np.random.normal(0, 0.1)))
            
            # EVI similar to NDVI but slightly different
            evi = max(0, min(1, ndvi * 0.9 + np.random.normal(0, 0.05)))
            
            # Soil moisture varies with season
            soil_moisture = 0.3 + 0.2 * np.sin(2 * np.pi * (day_of_year - 100) / 365)
            soil_moisture = max(0.1, min(0.6, soil_moisture + np.random.normal(0, 0.05)))
            
            # Temperature varies with season
            temp_base = 15 + 15 * np.sin(2 * np.pi * (day_of_year - 80) / 365)
            temperature = temp_base + np.random.normal(0, 3)
            
            # Precipitation is more random
            precipitation = max(0, np.random.exponential(20))
            
            data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'lat': lat + np.random.normal(0, 0.5),
                'lon': lon + np.random.normal(0, 0.5),
                'ndvi': round(ndvi, 4),
                'evi': round(evi, 4),
                'soilMoisture': round(soil_moisture, 4),
                'temperature': round(temperature, 2),
                'precipitation': round(precipitation, 2),
                'region': region
            })
        
        # Move to next week
        current_date += timedelta(days=7)
    
    # Create DataFrame and save
    df = pd.DataFrame(data)
    df.to_csv(output_file, index=False)
    
    print(f"Generated {len(df)} records")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Regions: {', '.join(regions)}")
    print(f"Saved to: {output_file}")
    
    return df

if __name__ == "__main__":
    df = generate_sample_bloom_data()
    print("\nSample data generation complete!")
    print("\nFirst few rows:")
    print(df.head())
    print("\nStatistics:")
    print(df.describe())
