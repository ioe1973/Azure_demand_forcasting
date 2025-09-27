from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="Azure Demand Forecasting API")

# Add CORS middleware to allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server port
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

# Optional: Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Azure Demand Forecasting API!"}