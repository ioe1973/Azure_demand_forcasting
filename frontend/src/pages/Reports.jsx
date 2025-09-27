import React, { useState } from 'react';
import StorageChart from '../components/charts/StorageChart';
import PieChart from '../components/charts/PieChart';
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

const Reports = () => {
  const [filters, setFilters] = useState({
    timeRange: '1M',
    region: 'all',
    resourceType: 'all'
  });

  // Use real API data for reports
  const {
    data: costData,
    loading: costLoading,
    error: costError
  } = useApiData(getStorageByType);

  const {
    data: performanceData,
    loading: perfLoading,
    error: perfError
  } = useApiData(getUsageTrends);

  const {
    data: trendData,
    loading: trendLoading,
    error: trendError
  } = useApiData(getDailyAverages);

  const {
    data: optimizationTableData,
    loading: tableLoading,
    error: tableError
  } = useApiData(getRawData);

  const handleFilterChange = (updated) => setFilters(updated);
  const handleApplyFilters = (applied) => setFilters(applied);

  // Calculate cost summary from real data
  const getCostSummary = () => {
    if (!optimizationTableData || optimizationTableData.length === 0) return null;
    
    const totalRecords = optimizationTableData.length;
    const avgCPU = optimizationTableData.reduce((sum, record) => sum + (record.usage_cpu || 0), 0) / totalRecords;
    const avgStorage = optimizationTableData.reduce((sum, record) => sum + (record.usage_storage || 0), 0) / totalRecords;
    
    return {
      totalRecords,
      avgCPU: avgCPU.toFixed(2),
      avgStorage: avgStorage.toFixed(2),
      topRegion: optimizationTableData[0]?.region || 'N/A'
    };
  };

  const costSummary = getCostSummary();

  return (
    <div className="page-content">
      <div className="page-header">
        <h3>📋 Reports & Analytics (Real Data)</h3>
        <p>Comprehensive reports and data analysis from your CSV data for capacity optimization</p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
      />

      <div className="content-grid">
        <div className="content-card">
          <h4>Resource Cost Breakdown (Real Data)</h4>
          {costLoading ? (
            <LoadingSpinner message="Analyzing costs from CSV data..." />
          ) : costError ? (
            <p style={{ color: 'red' }}>Error: {costError}</p>
          ) : costData ? (
            <StorageChart
              data={costData}
              title="Resource Cost Analysis from CSV"
            />
          ) : (
            <p>No cost data available</p>
          )}
          {costSummary && (
            <div style={{ marginTop: '0.75rem', color: '#495057' }}>
              <p><strong>Total Records Analyzed:</strong> {costSummary.totalRecords}</p>
              <p><strong>Average CPU Usage:</strong> {costSummary.avgCPU}%</p>
              <p><strong>Average Storage Usage:</strong> {costSummary.avgStorage} GB</p>
              <p><strong>Top Region:</strong> {costSummary.topRegion}</p>
            </div>
          )}
        </div>

        <div className="content-card">
          <h4>Service Cost Distribution (Real Data)</h4>
          {costLoading ? (
            <LoadingSpinner message="Loading distribution..." />
          ) : costError ? (
            <p style={{ color: 'red' }}>Error: {costError}</p>
          ) : costData ? (
            <PieChart
              data={costData}
              title="Cost Distribution by Resource Type"
            />
          ) : (
            <p>No distribution data available</p>
          )}
        </div>

        <div className="content-card">
          <h4>Performance Trends (Real Data)</h4>
          {trendLoading ? (
            <LoadingSpinner message="Loading performance trends..." />
          ) : trendError ? (
            <p style={{ color: 'red' }}>Error: {trendError}</p>
          ) : trendData ? (
            <DemandChart
              data={trendData}
              title="Daily Performance Metrics from CSV"
            />
          ) : (
            <p>No performance trends available</p>
          )}
          {perfLoading ? (
            <LoadingSpinner message="Building performance report..." />
          ) : perfError ? (
            <p style={{ color: 'red' }}>Performance Error: {perfError}</p>
          ) : costSummary ? (
            <ul style={{ marginTop: '0.75rem', color: '#495057' }}>
              <li><strong>Performance Score:</strong> {((costSummary.avgCPU / 100) * 85).toFixed(1)}%</li>
              <li><strong>Efficiency:</strong> {costSummary.avgCPU > 70 ? 'High' : 'Moderate'}</li>
              <li><strong>Recommendations:</strong></li>
              <li>• Optimize resource allocation based on usage patterns</li>
              <li>• Consider load balancing across regions</li>
              <li>• Monitor storage growth trends</li>
            </ul>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h4>📊 Optimization Opportunities (Real Data)</h4>
        {tableLoading ? (
          <LoadingSpinner message="Analyzing optimization opportunities..." />
        ) : tableError ? (
          <p style={{ color: 'red' }}>Error loading optimization data: {tableError}</p>
        ) : (
          <DataTable
            data={optimizationTableData ? optimizationTableData.slice(0, 30) : []}
            title={`Optimization Analysis (${optimizationTableData ? optimizationTableData.length : 0} records analyzed)`}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;