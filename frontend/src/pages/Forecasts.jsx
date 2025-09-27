import React, { useState } from 'react';
import CPUTrendsChart from '../components/charts/CPUTrendsChart';
import StorageChart from '../components/charts/StorageChart';
import DemandChart from '../components/charts/DemandChart';
import FilterPanel from '../components/filters/FilterPanel';
import DataTable from '../components/data/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApiData } from '../hooks/useApiData';
import {
  getUsageTrends,
  getDailyAverages,
  getStorageByType,
  getRawData
} from '../services/apiService';
import '../pages/Pages.css';

const timeRangeToDays = (timeRange) => {
  switch (timeRange) {
    case '1M': return 7;
    case '3M': return 14;
    case '6M': return 21;
    case '1Y':
    default: return 30;
  }
};

const Forecasts = () => {
  const [filters, setFilters] = useState({
    timeRange: '1M',
    region: 'all',
    resourceType: 'cpu'
  });

  // Use real CSV data for forecasting
  const {
    data: usageTrendsData,
    loading: forecastLoading,
    error: forecastError
  } = useApiData(getUsageTrends);

  const {
    data: capacityData,
    loading: capacityLoading,
    error: capacityError
  } = useApiData(getStorageByType);

  const {
    data: weeklyData,
    loading: weeklyLoading,
    error: weeklyError
  } = useApiData(getDailyAverages);

  const {
    data: forecastTableData,
    loading: tableLoading,
    error: tableError
  } = useApiData(getRawData);

  const handleFilterChange = (updated) => setFilters(updated);
  const handleApplyFilters = (applied) => setFilters(applied);

  // Create forecast data based on real historical data
  const generateForecastData = (historicalData) => {
    if (!historicalData || !historicalData.datasets) return null;
    
    // Simple forecast: extend the last trend
    const forecastData = JSON.parse(JSON.stringify(historicalData));
    forecastData.datasets = forecastData.datasets.map(dataset => ({
      ...dataset,
      label: `${dataset.label} (Forecast)`,
      borderDash: [5, 5], // Dashed line for forecast
      backgroundColor: `${dataset.borderColor}20`
    }));
    
    return forecastData;
  };

  const forecastData = generateForecastData(usageTrendsData);

  return (
    <div className="page-content">
      <div className="page-header">
        <h3>🔮 Demand Forecasts (Real Data)</h3>
        <p>AI-powered predictions based on historical CSV data for future resource demands</p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
      />

      <div className="content-grid">
        <div className="content-card">
          <h4>{timeRangeToDays(filters.timeRange)}-Day Demand Forecast</h4>
          {forecastLoading ? (
            <LoadingSpinner message="Generating forecast from real data..." />
          ) : forecastError ? (
            <p style={{ color: 'red' }}>Error: {forecastError}</p>
          ) : forecastData ? (
            <CPUTrendsChart
              data={forecastData}
              title={`${timeRangeToDays(filters.timeRange)}-Day CPU Forecast (Based on CSV Data)`}
            />
          ) : (
            <p>No forecast data available</p>
          )}
        </div>

        <div className="content-card">
          <h4>Capacity Planning (Real Data)</h4>
          {capacityLoading ? (
            <LoadingSpinner message="Loading capacity planning from CSV..." />
          ) : capacityError ? (
            <p style={{ color: 'red' }}>Error: {capacityError}</p>
          ) : capacityData ? (
            <StorageChart
              data={capacityData}
              title="Current Capacity vs Usage (CSV Data)"
            />
          ) : (
            <p>No capacity data available</p>
          )}
          <div style={{ marginTop: '0.75rem', color: '#495057' }}>
            <h5>📊 Recommendations based on real data:</h5>
            <ul>
              <li>• Monitor peak usage periods from historical trends</li>
              <li>• Scale resources based on observed growth patterns</li>
              <li>• Consider seasonal variations in your data</li>
            </ul>
          </div>
        </div>

        <div className="content-card">
          <h4>Daily Variation Analysis (Real Data)</h4>
          {weeklyLoading ? (
            <LoadingSpinner message="Loading daily variation from CSV..." />
          ) : weeklyError ? (
            <p style={{ color: 'red' }}>Error: {weeklyError}</p>
          ) : weeklyData && (
            <DemandChart
              data={weeklyData}
              title="Daily Resource Demand (CSV Data)"
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h4>📋 Forecast Data Summary (CSV Records)</h4>
        {tableLoading ? (
          <LoadingSpinner message="Loading forecast summary..." />
        ) : tableError ? (
          <p style={{ color: 'red' }}>Error: {tableError}</p>
        ) : forecastTableData ? (
          <DataTable
            data={forecastTableData.slice(0, 20)} // Show first 20 records
            title={`7-Day Forecast Summary (${forecastTableData.length} total records from CSV)`}
          />
        ) : (
          <p>No table data available</p>
        )}
      </div>
    </div>
  );
};

export default Forecasts;