import requests
import pandas as pd
import os
import json
from datetime import datetime, timedelta

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

# Function to fetch MODIS NDVI/EVI from LP DAAC subset API
def fetch_modis_ndvi(lat, lon, start_date, end_date):
    """
    Fetch NDVI and EVI for a point from MODIS MOD13Q1.
    start_date, end_date: 'YYYY-MM-DD'
    Returns DataFrame with date, NDVI, EVI
    """
    url = "https://lpdaacsvc.cr.usgs.gov/services/modisSubset"
    params = {
        "product": "MOD13Q1",
        "version": "6",
        "latitude": lat,
        "longitude": lon,
        "band": "NDVI,EVI",
        "startDate": start_date,
        "endDate": end_date,
        "kmAboveBelow": "0",
        "kmLeftRight": "0",
        "output": "json"
    }
    headers = {"Authorization": f"Bearer {EARTHDATA_TOKEN}"}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        records = []
        for d in data['subset']:
            records.append({
                "date": d["calendar_date"],
                "NDVI": d.get("NDVI"),
                "EVI": d.get("EVI")
            })
        df = pd.DataFrame(records)
        df['date'] = pd.to_datetime(df['date'])
        return df
    else:
        raise Exception(f"Failed to fetch MODIS NDVI: {response.status_code} - {response.text}")

# Function to fetch SMAP soil moisture from GES DISC
def fetch_smap_soil_moisture(bbox, start_date, end_date):
    """
    Fetch SMAP L3 soil moisture for a bounding box.
    bbox: "min_lat,min_lon,max_lat,max_lon"
    Returns file path to NetCDF
    """
    url = "https://disc.gsfc.nasa.gov/daac-bin/OTF/HTTP_services.cgi"
    params = {
        "DATASET_ID": "SMAP_L3_SM_P_E",
        "BBOX": bbox,
        "TIME": f"{start_date}/{end_date}",
        "FORMAT": "netCDF"
    }
    headers = {"Authorization": f"Bearer {EARTHDATA_TOKEN}"}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        filename = "smap_soil_moisture.nc"
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"Saved SMAP data to {filename}")
        return filename
    else:
        raise Exception(f"Failed to fetch SMAP: {response.status_code} - {response.text}")

# Function to fetch GLDAS climate data from GES DISC
def fetch_gldas_climate(bbox, start_date, end_date):
    """
    Fetch GLDAS NOAH025 3H climate data.
    """
    url = "https://disc.gsfc.nasa.gov/daac-bin/OTF/HTTP_services.cgi"
    params = {
        "DATASET_ID": "GLDAS_NOAH025_3H",
        "BBOX": bbox,
        "TIME": f"{start_date}/{end_date}",
        "FORMAT": "netCDF"
    }
    headers = {"Authorization": f"Bearer {EARTHDATA_TOKEN}"}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        filename = "gldas_climate.nc"
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"Saved GLDAS data to {filename}")
        return filename
    else:
        raise Exception(f"Failed to fetch GLDAS: {response.status_code} - {response.text}")

# Example usage
if __name__ == "__main__":
    # Fetch NDVI for a point
    lat, lon = 30.0, 31.2  # Cairo example
    start = "2018-01-01"
    end = "2024-12-31"
    ndvi_df = fetch_modis_ndvi(lat, lon, start, end)
    ndvi_df.to_csv("modis_ndvi_evi_2018_2024.csv", index=False)
    print("NDVI data saved to modis_ndvi_evi_2018_2024.csv")

    # Fetch SMAP for a bbox
    bbox = "25,25,35,35"  # North Africa region
    smap_file = fetch_smap_soil_moisture(bbox, start, end)
    print(f"SMAP data saved to {smap_file}")

    # Fetch GLDAS
    gldas_file = fetch_gldas_climate(bbox, start, end)
    print(f"GLDAS data saved to {gldas_file}")
