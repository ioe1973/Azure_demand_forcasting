// API service for Azure Demand Forecasting Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to handle API requests
const fetchFromAPI = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Improved transform function with better null handling
const transformToChartData = (rawData, config) => {
  const { labelField, dataField, groupByField } = config;
  
  // Handle null or empty data
  if (!rawData || rawData.length === 0) {
    return { 
      labels: ['No Data'], 
      datasets: [{
        label: 'No Data Available',
        data: [0],
        backgroundColor: '#cccccc',
        borderColor: '#999999'
      }]
    };
  }

  if (groupByField) {
    // Group data by specified field (e.g., region)
    const grouped = rawData.reduce((acc, item) => {
      const group = item[groupByField];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});

    // Get unique labels (e.g., dates)
    const labels = [...new Set(rawData.map(item => {
      const label = item[labelField];
      if (labelField === 'date' && label) {
        return new Date(label).toLocaleDateString();
      }
      return label || 'Unknown';
    }))].sort();

    // Create datasets for each group
    const colors = ['#0078d4', '#107c10', '#d83b01', '#5c2d91', '#008272'];
    const datasets = Object.keys(grouped).map((group, index) => {
      const color = colors[index % colors.length];
      
      const data = labels.map(label => {
        const matchingItem = grouped[group].find(item => {
          const itemLabel = labelField === 'date' && item[labelField] 
            ? new Date(item[labelField]).toLocaleDateString()
            : item[labelField];
          return itemLabel === label;
        });
        return matchingItem ? parseFloat(matchingItem[dataField]) || 0 : 0;
      });

      return {
        label: group,
        data: data,
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.4,
        fill: false
      };
    });

    return { labels, datasets };
  } else {
    // Simple chart data (for pie charts, bar charts)
    const labels = rawData.map(item => item[labelField] || 'Unknown');
    const data = rawData.map(item => parseFloat(item[dataField]) || 0);
    
    return {
      labels: labels,
      datasets: [{
        label: 'Usage',
        data: data,
        backgroundColor: [
          '#0078d4', '#107c10', '#d83b01', '#5c2d91', '#008272',
          '#6264a7', '#8764b8', '#744da9', '#b146c2', '#881798'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }
};

// API service functions with better error handling
export const apiService = {
  // Fetch usage trends data
  async getUsageTrends() {
    try {
      const rawData = await fetchFromAPI('/usage-trends');
      return transformToChartData(rawData, {
        labelField: 'date',
        dataField: 'usage_cpu',
        groupByField: 'region'
      });
    } catch (error) {
      return { labels: ['No Data'], datasets: [{ label: 'No Data Available', data: [0], backgroundColor: '#cccccc', borderColor: '#999999' }] };
    }
  },

  // Fetch top regions data
  async getTopRegions() {
    try {
      const rawData = await fetchFromAPI('/top-regions');
      return transformToChartData(rawData, {
        labelField: 'region',
        dataField: 'total_cpu_usage'
      });
    } catch (error) {
      return { labels: ['No Data'], datasets: [{ label: 'No Data Available', data: [0], backgroundColor: '#cccccc', borderColor: '#999999' }] };
    }
  },

  // Fetch storage by type data
  async getStorageByType() {
    try {
      const rawData = await fetchFromAPI('/storage-by-type');
      return transformToChartData(rawData, {
        labelField: 'resource_type',
        dataField: 'total_storage'
      });
    } catch (error) {
      return { labels: ['No Data'], datasets: [{ label: 'No Data Available', data: [0], backgroundColor: '#cccccc', borderColor: '#999999' }] };
    }
  },

  // Fetch daily averages
  async getDailyAverages() {
    try {
      const rawData = await fetchFromAPI('/daily-averages');
      return transformToChartData(rawData, {
        labelField: 'date',
        dataField: 'usage_cpu',
        groupByField: 'region'
      });
    } catch (error) {
      return { labels: ['No Data'], datasets: [{ label: 'No Data Available', data: [0], backgroundColor: '#cccccc', borderColor: '#999999' }] };
    }
  },

  // Fetch raw data for tables
  async getRawData() {
    try {
      return await fetchFromAPI('/raw-data');
    } catch (error) {
      return [];
    }
  },

  // Cost analysis data
  async getCostAnalysis() {
    try {
      const rawData = await fetchFromAPI('/cost-analysis');
      return transformToChartData(rawData, {
        labelField: 'resource_type',
        dataField: 'estimated_cost'
      });
    } catch (error) {
      return { labels: ['No Data'], datasets: [{ label: 'No Data Available', data: [0], backgroundColor: '#cccccc', borderColor: '#999999' }] };
    }
  },

  // Performance metrics
  async getPerformanceMetrics() {
    try {
      const rawData = await fetchFromAPI('/performance-metrics'); 
      return transformToChartData(rawData, {
        labelField: 'region',
        dataField: 'usage_cpu',
        groupByField: 'resource_type'
      });
    } catch (error) {
      return { labels: ['No Data'], datasets: [{ label: 'No Data Available', data: [0], backgroundColor: '#cccccc', borderColor: '#999999' }] };
    }
  }
};

// Export individual functions
export const {
  getUsageTrends,
  getTopRegions,
  getStorageByType,
  getDailyAverages,
  getRawData,
  getCostAnalysis,
  getPerformanceMetrics
} = apiService;

export default apiService;