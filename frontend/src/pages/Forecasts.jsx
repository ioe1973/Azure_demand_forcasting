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
  getStorageByType,
  getDailyAverages,
  getRawData
} from '../services/apiService';
import '../pages/Pages.css';

const Forecasts = () => {
  const [filters, setFilters] = useState({
    timeRange: '1M',
    region: 'all',
    resourceType: 'cpu'
  });

  // Use real API data for forecasting page
  const {
    data: forecastData,
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

  // Calculate forecast days based on time range
  const getForecastDays = (timeRange) => {
    switch (timeRange) {
      case '1M': return 7;
      case '3M': return 14;
      case '6M': return 21;
      case '1Y':
      default: return 30;
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h3>🔮 Demand Forecasts (Real Data)</h3>
        <p>AI-powered predictions for future resource demands based on historical CSV data</p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
      />

      <div className="content-grid">
        <div className="content-card">
          <h4>{getForecastDays(filters.timeRange)}-Day Demand Forecast (Real Data)</h4>
          {forecastLoading ? (
            <LoadingSpinner message="Generating forecast from CSV data..." />
          ) : forecastError ? (
            <p style={{ color: 'red' }}>Error: {forecastError}</p>
          ) : forecastData ? (
            <CPUTrendsChart
              data={forecastData}
              title={`${getForecastDays(filters.timeRange)}-Day CPU Usage Forecast`}
            />
          ) : (
            <p>No forecast data available</p>
          )}
          {forecastData && (
            <p style={{ marginTop: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
              🔮 Forecast based on historical patterns from CSV data
            </p>
          )}
        </div>

        <div className="content-card">
          <h4>Capacity Planning (Real Data)</h4>
          {capacityLoading ? (
            <LoadingSpinner message="Analyzing capacity from CSV data..." />
          ) : capacityError ? (
            <p style={{ color: 'red' }}>Error: {capacityError}</p>
          ) : capacityData ? (
            <StorageChart
              data={capacityData}
              title="Storage Capacity vs Predicted Demand"
            />
          ) : (
            <p>No capacity data available</p>
          )}
          <div style={{ marginTop: '0.75rem', color: '#495057' }}>
            <h5>📊 Capacity Recommendations:</h5>
            <ul>
              <li>• Based on {forecastTableData ? forecastTableData.length : 0} historical records</li>
              <li>• Consider scaling resources during peak usage periods</li>
              <li>• Monitor storage growth patterns for optimal allocation</li>
            </ul>
          </div>
        </div>

        <div className="content-card">
          <h4>Daily Variation Analysis (Real Data)</h4>
          {weeklyLoading ? (
            <LoadingSpinner message="Analyzing daily patterns..." />
          ) : weeklyError ? (
            <p style={{ color: 'red' }}>Error: {weeklyError}</p>
          ) : weeklyData ? (
            <DemandChart
              data={weeklyData}
              title="Daily Usage Variation from CSV"
            />
          ) : (
            <p>No daily variation data available</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h4>📋 Forecast Summary Table (Real Data)</h4>
        {tableLoading ? (
          <LoadingSpinner message="Loading forecast summary..." />
        ) : tableError ? (
          <p style={{ color: 'red' }}>Error loading table: {tableError}</p>
        ) : (
          <DataTable
            data={forecastTableData ? forecastTableData.slice(0, 20) : []}
            title={`7-Day Forecast Summary (${forecastTableData ? forecastTableData.length : 0} total records)`}
          />
        )}
      </div>
    </div>
  );
};

export default Forecasts;