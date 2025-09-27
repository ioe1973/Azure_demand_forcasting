from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional, List
from datetime import datetime, timedelta

app = FastAPI(title="Azure Demand Forecasting API")

# Add CORS middleware to allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://probable-space-enigma-7vv79p7p4vr5cp4gr-5173.app.github.dev"  # Your Codespaces frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the merged, cleaned data at startup
DATA_PATH = "data/processed/cleaned_merged.csv"
df = pd.read_csv(DATA_PATH, parse_dates=['date'])

@app.get("/api/usage-trends")
def usage_trends(
    regions: Optional[List[str]] = Query(None),
    resource_type: Optional[str] = Query(None),
    time_range: Optional[str] = Query("1Y")
):
    # Start with clean data
    filtered_df = df.dropna(subset=['region', 'usage_cpu'])
    filtered_df = filtered_df[filtered_df['region'].str.strip() != '']
    
    # Apply region filter
    if regions and len(regions) > 0 and 'all' not in regions:
        # Map frontend values to backend values
        region_mapping = {
            'east-us': 'East US',
            'west-us': 'West US', 
            'central-us': 'Central US',
            'north-europe': 'North Europe',
            'southeast-asia': 'Southeast Asia'
        }
        backend_regions = [region_mapping.get(r, r) for r in regions]
        filtered_df = filtered_df[filtered_df['region'].isin(backend_regions)]
    
    # Apply resource type filter
    if resource_type and resource_type != 'all':
        # Map frontend values to backend values if needed
        if resource_type == 'cpu':
            # For CPU filter, we can just use all data since we're showing CPU usage
            pass
        else:
            filtered_df = filtered_df[filtered_df['resource_type'].str.lower() == resource_type.lower()]
    
    # Apply time range filter
    if time_range and time_range != 'all':
        end_date = filtered_df['date'].max()
        if time_range == '1M':
            start_date = end_date - timedelta(days=30)
        elif time_range == '3M':
            start_date = end_date - timedelta(days=90)
        elif time_range == '6M':
            start_date = end_date - timedelta(days=180)
        else:  # 1Y
            start_date = end_date - timedelta(days=365)
        
        filtered_df = filtered_df[filtered_df['date'] >= start_date]
    
    # Group and aggregate
    trends = (
        filtered_df.groupby(['date', 'region'])['usage_cpu']
        .mean()
        .reset_index()
        .sort_values(['date', 'region'])
    )
    return trends.to_dict(orient='records')

@app.get("/api/top-regions")
def top_regions(
    resource_type: Optional[str] = Query(None),
    time_range: Optional[str] = Query("1Y")
):
    filtered_df = df.dropna(subset=['region', 'usage_cpu'])
    filtered_df = filtered_df[filtered_df['region'].str.strip() != '']
    
    # Apply filters similar to usage_trends
    if resource_type and resource_type != 'all':
        if resource_type != 'cpu':
            filtered_df = filtered_df[filtered_df['resource_type'].str.lower() == resource_type.lower()]
    
    # Apply time range filter
    if time_range and time_range != 'all':
        end_date = filtered_df['date'].max()
        if time_range == '1M':
            start_date = end_date - timedelta(days=30)
        elif time_range == '3M':
            start_date = end_date - timedelta(days=90)
        elif time_range == '6M':
            start_date = end_date - timedelta(days=180)
        else:
            start_date = end_date - timedelta(days=365)
        
        filtered_df = filtered_df[filtered_df['date'] >= start_date]
    
    region_sums = (
        filtered_df.groupby('region')['usage_cpu']
        .sum()
        .sort_values(ascending=False)
        .head(5)
        .reset_index()
        .rename(columns={'usage_cpu': 'total_cpu_usage'})
    )
    return region_sums.to_dict(orient='records')

@app.get("/api/storage-by-type")
def storage_by_type(
    regions: Optional[List[str]] = Query(None),
    time_range: Optional[str] = Query("1Y")
):
    filtered_df = df.dropna(subset=['resource_type', 'usage_storage'])
    filtered_df = filtered_df[filtered_df['resource_type'].str.strip() != '']
    
    # Apply region filter  
    if regions and len(regions) > 0 and 'all' not in regions:
        region_mapping = {
            'east-us': 'East US',
            'west-us': 'West US',
            'central-us': 'Central US', 
            'north-europe': 'North Europe',
            'southeast-asia': 'Southeast Asia'
        }
        backend_regions = [region_mapping.get(r, r) for r in regions]
        filtered_df = filtered_df[filtered_df['region'].isin(backend_regions)]
    
    # Apply time range filter
    if time_range and time_range != 'all':
        end_date = filtered_df['date'].max()
        if time_range == '1M':
            start_date = end_date - timedelta(days=30)
        elif time_range == '3M':
            start_date = end_date - timedelta(days=90)
        elif time_range == '6M':
            start_date = end_date - timedelta(days=180)
        else:
            start_date = end_date - timedelta(days=365)
        
        filtered_df = filtered_df[filtered_df['date'] >= start_date]
    
    storage_by_type = (
        filtered_df.groupby('resource_type')['usage_storage']
        .sum()
        .reset_index()
        .rename(columns={'usage_storage': 'total_storage'})
    )
    return storage_by_type.to_dict(orient='records')

@app.get("/api/daily-averages")
def daily_averages(
    regions: Optional[List[str]] = Query(None),
    time_range: Optional[str] = Query("1Y")
):
    filtered_df = df.dropna(subset=['region', 'usage_cpu', 'usage_storage', 'users_active'])
    filtered_df = filtered_df[filtered_df['region'].str.strip() != '']
    
    # Apply region filter
    if regions and len(regions) > 0 and 'all' not in regions:
        region_mapping = {
            'east-us': 'East US',
            'west-us': 'West US',
            'central-us': 'Central US',
            'north-europe': 'North Europe', 
            'southeast-asia': 'Southeast Asia'
        }
        backend_regions = [region_mapping.get(r, r) for r in regions]
        filtered_df = filtered_df[filtered_df['region'].isin(backend_regions)]
    
    # Apply time range filter
    if time_range and time_range != 'all':
        end_date = filtered_df['date'].max()
        if time_range == '1M':
            start_date = end_date - timedelta(days=30)
        elif time_range == '3M':
            start_date = end_date - timedelta(days=90)
        elif time_range == '6M':
            start_date = end_date - timedelta(days=180)
        else:
            start_date = end_date - timedelta(days=365)
        
        filtered_df = filtered_df[filtered_df['date'] >= start_date]
    
    daily_avg = filtered_df.groupby(['date', 'region']).agg({
        'usage_cpu': 'mean',
        'usage_storage': 'mean',
        'users_active': 'mean'
    }).reset_index()
    return daily_avg.to_dict(orient='records')

@app.get("/api/raw-data")
def raw_data(
    regions: Optional[List[str]] = Query(None),
    resource_type: Optional[str] = Query(None),
    time_range: Optional[str] = Query("1Y")
):
    filtered_df = df.copy()
    
    # Apply region filter
    if regions and len(regions) > 0 and 'all' not in regions:
        region_mapping = {
            'east-us': 'East US',
            'west-us': 'West US',
            'central-us': 'Central US',
            'north-europe': 'North Europe',
            'southeast-asia': 'Southeast Asia'
        }
        backend_regions = [region_mapping.get(r, r) for r in regions]
        filtered_df = filtered_df[filtered_df['region'].isin(backend_regions)]
    
    # Apply resource type filter
    if resource_type and resource_type != 'all':
        if resource_type != 'cpu':
            filtered_df = filtered_df[filtered_df['resource_type'].str.lower() == resource_type.lower()]
    
    # Apply time range filter
    if time_range and time_range != 'all':
        end_date = filtered_df['date'].max()
        if time_range == '1M':
            start_date = end_date - timedelta(days=30)
        elif time_range == '3M':
            start_date = end_date - timedelta(days=90)
        elif time_range == '6M':
            start_date = end_date - timedelta(days=180)
        else:
            start_date = end_date - timedelta(days=365)
        
        filtered_df = filtered_df[filtered_df['date'] >= start_date]
    
    return filtered_df.to_dict(orient='records')

# Optional: Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Azure Demand Forecasting API!"}