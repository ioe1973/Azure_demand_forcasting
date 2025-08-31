from fastapi import FastAPI, Response
import pandas as pd

app = FastAPI(title="Azure Demand Forecasting API")

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
    # Option 1: Return as JSON
    return df.to_dict(orient='records')
    # Option 2: To return as CSV:
    # csv_data = df.to_csv(index=False)
    # return Response(content=csv_data, media_type="text/csv")

# Optional: Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the Azure Demand Forecasting API!"}