import requests
import pandas as pd
import os
import json

# Load Earthdata token from environment variable
EARTHDATA_TOKEN = os.getenv('EARTHDATA_TOKEN')
if not EARTHDATA_TOKEN:
    raise ValueError("EARTHDATA_TOKEN environment variable is not set. Please set it securely.")

# Function to fetch climate data from NASA POWER API
def fetch_climate_data(lat, lon, start, end):
    base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "start": start,
        "end": end,
        "latitude": lat,
        "longitude": lon,
        "parameters": "T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN",
        "community": "AG",
        "format": "JSON"
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        df = pd.DataFrame(data['properties']['parameter'])
        df.index = pd.to_datetime(df.index)
        return df
    else:
        raise Exception("Failed to fetch climate data")

# Function to fetch NDVI/bloom data from NASA Harmony using token
def fetch_ndvi_harmony(collection='C1748066515-LPCLOUD', variable='NDVI', minlat=29.8, minlon=31.0, maxlat=30.3, maxlon=31.6, start='2024-03-01', end='2024-03-31', format='json'):
    """
    Fetch NDVI data from NASA Harmony API using Earthdata token.
    Returns JSON metadata or GeoTIFF URL based on format.
    """
    harmony_url = f"https://harmony.earthdata.nasa.gov/{collection}/ogc-api-coverages/1.0.0/{variable}/coverage/rangeset"
    params = {
        'subset': [
            f'lat({minlat}:{maxlat})',
            f'lon({minlon}:{maxlon})',
            f'time("{start}","{end}")'
        ],
        'format': format
    }
    headers = {'Authorization': f'Bearer {EARTHDATA_TOKEN}'}
    response = requests.get(harmony_url, params=params, headers=headers)
    if response.status_code == 200:
        if format == 'json':
            return response.json()
        else:
            # For GeoTIFF, return the URL or stream the data
            return response.content  # Or save to file
    else:
        raise Exception(f"Failed to fetch NDVI from Harmony: {response.status_code} - {response.text}")

# Function to fetch bloom events metadata from CMR using token
def fetch_bloom_events_cmr(short_name='MOD13Q1', start_date='2024-01-01T00:00:00Z', end_date='2024-12-31T23:59:59Z', bbox='-180,-90,180,90'):
    """
    Fetch granule metadata for bloom-related data from CMR using Earthdata token.
    """
    cmr_url = "https://cmr.earthdata.nasa.gov/search/granules.json"
    params = {
        'short_name': short_name,
        'temporal': f'{start_date},{end_date}',
        'bounding_box': bbox,
        'page_size': 100  # Adjust as needed
    }
    headers = {'Authorization': f'Bearer {EARTHDATA_TOKEN}'}
    response = requests.get(cmr_url, params=params, headers=headers)
    if response.status_code == 200:
        data = response.json()
        # Process to extract bloom events (e.g., based on NDVI thresholds)
        # For simplicity, return list of granules with metadata
        return data['feed']['entry']
    else:
        raise Exception(f"Failed to fetch from CMR: {response.status_code} - {response.text}")

# Function to fetch NDVI from MODIS via Google Earth Engine (requires authentication)
def fetch_ndvi_gee(lat, lon, start_date, end_date):
    # Note: Requires ee.Initialize() with user credentials
    try:
        ee.Initialize()
        point = ee.Geometry.Point([lon, lat])
        modis = ee.ImageCollection('MODIS/006/MOD13Q1').select('NDVI')
        ndvi_series = modis.filterBounds(point).filterDate(start_date, end_date)
        # This is simplified; actual extraction requires more processing
        # For full implementation, see original example
        print("NDVI fetch via GEE requires full implementation.")
        return None
    except Exception as e:
        print(f"GEE NDVI fetch failed: {e}")
        return None

# Example usage
if __name__ == "__main__":
    # Fetch climate for Central Valley
    lat, lon = 38.5, -121.5
    start, end = "20200101", "20201231"
    climate_df = fetch_climate_data(lat, lon, start, end)
    climate_df.to_csv("climate_data.csv")
    print("Climate data saved to climate_data.csv")
