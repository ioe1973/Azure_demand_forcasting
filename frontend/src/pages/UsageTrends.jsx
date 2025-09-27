import React, { useState, useCallback } from 'react';
import CPUTrendsChart from '../components/charts/CPUTrendsChart';
import StorageChart from '../components/charts/StorageChart';
import PieChart from '../components/charts/PieChart';
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

const UsageTrends = () => {
  const [filters, setFilters] = useState({
    timeRange: '1Y',
    region: 'all',
    resourceType: 'all'
  });

  // Create callback functions that include filters
  const getUsageTrendsWithFilters = useCallback(() => getUsageTrends(filters), [filters]);
  const getStorageByTypeWithFilters = useCallback(() => getStorageByType(filters), [filters]);
  const getDailyAveragesWithFilters = useCallback(() => getDailyAverages(filters), [filters]);
  const getRawDataWithFilters = useCallback(() => getRawData(filters), [filters]);

  // Fetch real data from CSV via your backend API with filters
  const {
    data: usageTrendsData,
    loading: trendsLoading,
    error: trendsError,
    refetch: refetchTrends
  } = useApiData(getUsageTrendsWithFilters, [filters]);

  const {
    data: storageData,
    loading: storageLoading,
    error: storageError,
    refetch: refetchStorage
  } = useApiData(getStorageByTypeWithFilters, [filters]);

  const {
    data: dailyData,
    loading: dailyLoading,
    error: dailyError,
    refetch: refetchDaily
  } = useApiData(getDailyAveragesWithFilters, [filters]);

  const {
    data: rawTableData,
    loading: tableLoading,
    error: tableError,
    refetch: refetchTable
  } = useApiData(getRawDataWithFilters, [filters]);

  const handleFilterChange = (updated) => {
    setFilters(updated);
  };

  const handleApplyFilters = (applied) => {
    setFilters(applied);
    // Trigger refetch of all data with new filters
    refetchTrends();
    refetchStorage();
    refetchDaily();
    refetchTable();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h3>📊 Usage Trends Dashboard - Real CSV Data</h3>
        <p>Monitor CPU, storage, and resource usage patterns from your Azure demand data</p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
      />

      <div className="content-grid">
        <div className="content-card">
          <h4>CPU Usage Trends (Real Data)</h4>
          {trendsLoading ? (
            <LoadingSpinner message="Loading filtered CPU usage data..." />
          ) : trendsError ? (
            <p style={{ color: 'red' }}>Error loading real data: {trendsError}</p>
          ) : (
            <CPUTrendsChart
              data={usageTrendsData}
              title="CPU Usage Trends from CSV Data"
            />
          )}
          {usageTrendsData && (
            <p style={{ marginTop: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
              📊 Filtered data: {filters.region !== 'all' ? filters.region : 'All regions'} | {filters.timeRange} | {filters.resourceType !== 'all' ? filters.resourceType : 'All resources'}
            </p>
          )}
        </div>

        <div className="content-card">
          <h4>Storage Usage by Type (Real Data)</h4>
          {storageLoading ? (
            <LoadingSpinner message="Loading filtered storage data..." />
          ) : storageError ? (
            <p style={{ color: 'red' }}>Error: {storageError}</p>
          ) : (
            <StorageChart
              data={storageData}
              title="Storage Usage from CSV Data"
            />
          )}
        </div>

        <div className="content-card">
          <h4>Daily Averages Distribution (Real Data)</h4>
          {dailyLoading ? (
            <LoadingSpinner message="Loading daily averages..." />
          ) : dailyError ? (
            <p style={{ color: 'red' }}>Error: {dailyError}</p>
          ) : (
            <PieChart
              data={storageData} // Reusing storage data for pie chart
              title="Resource Distribution from CSV"
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h4>📋 Raw CSV Data Table</h4>
        {tableLoading ? (
          <LoadingSpinner message="Loading filtered table data..." />
        ) : tableError ? (
          <p style={{ color: 'red' }}>Error loading table: {tableError}</p>
        ) : (
          <DataTable
            data={rawTableData ? rawTableData.slice(0, 50) : []} // Show first 50 rows
            title={`Raw Data from CSV (${rawTableData ? rawTableData.length : 0} total filtered records)`}
          />
        )}
      </div>
    </div>
  );
};

export default UsageTrends;