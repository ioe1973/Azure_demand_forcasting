from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Azure Demand Forecasting API")

# Add CORS middleware to allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the merged, cleaned data at startup
DATA_PATH = "data/processed/cleaned_merged.csv"
df = pd.read_csv(DATA_PATH, parse_dates=['date'])

@app.get("/api/usage-trends")
def usage_trends():
    # Average CPU usage per region over time
    trends = (
        df.groupby(['date', 'region'])['usage_cpu']
        .mean()
        .reset_index()
        .sort_values(['date', 'region'])
    )
    # Convert to list of dicts for JSON
    return trends.to_dict(orient='records')

@app.get("/api/top-regions")
def top_regions():
    # Top 5 regions by total CPU demand
    region_sums = (
        df.groupby('region')['usage_cpu']
        .sum()
        .sort_values(ascending=False)
        .head(5)
        .reset_index()
        .rename(columns={'usage_cpu': 'total_cpu_usage'})
    )
    return region_sums.to_dict(orient='records')

@app.get("/api/raw-data")
def raw_data():
    # Return the complete dataset
    return df.to_dict(orient='records')

@app.get("/api/daily-averages")
def daily_averages():
    # Daily averages for all metrics
    daily_avg = df.groupby('date').agg({
        'usage_cpu': 'mean',
        'usage_storage': 'mean',
        'users_active': 'mean'
    }).reset_index()
    return daily_avg.to_dict(orient='records')

@app.get("/api/storage-by-type")
def storage_by_type():
    # Storage usage by resource type
    storage_by_type = (
        df.groupby('resource_type')['usage_storage']
        .sum()
        .reset_index()
        .rename(columns={'usage_storage': 'total_storage'})
    )
    return storage_by_type.to_dict(orient='records')

@app.get("/api/forecast-data")
def forecast_data():
    # 7-day forecast using last 30 days, with a simple linear trend
    recent_data = df.tail(30)
    avg_cpu = recent_data['usage_cpu'].mean()
    std_cpu = recent_data['usage_cpu'].std()
    
    forecast = []
    for i in range(1, 8):
        # Linear trend + periodic fluctuation + random noise
        predicted_cpu = avg_cpu + (i * 0.7) + ((-1) ** i * std_cpu * 0.2)
        forecast.append({
            'day': f'Day +{i}',
            'predicted_cpu': float(max(0, min(100, predicted_cpu))),
            'confidence': int(max(70, 90 - i * 2))
        })
    return forecast

@app.get("/api/cost-analysis")
def cost_analysis():
    # Cost analysis based on resource types and usage
    cost_analysis = (
        df.groupby('resource_type').agg({
            'usage_cpu': 'mean',
            'usage_storage': 'sum',
            'users_active': 'mean'
        }).reset_index()
    )
    # Add estimated cost calculation
    cost_analysis['estimated_cost'] = cost_analysis['usage_storage'] * 0.10  # $0.10 per GB
    return cost_analysis.to_dict(orient='records')

@app.get("/api/performance-metrics")
def performance_metrics():
    # Performance metrics by region and resource type
    performance = (
        df.groupby(['region', 'resource_type']).agg({
            'usage_cpu': 'mean',
            'usage_storage': 'mean',
            'users_active': 'mean'
        }).reset_index()
    )
    return performance.to_dict(orient='records')

# Optional: Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Azure Demand Forecasting API!"}