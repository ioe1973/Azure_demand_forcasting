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

// Transform raw data into chart format
const transformToChartData = (rawData, config) => {
  const { labelField, dataField, groupByField } = config;
  
  if (groupByField) {
    // Group data by specified field (e.g., region)
    const grouped = rawData.reduce((acc, item) => {
      const group = item[groupByField];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});

    // Create datasets for each group
    const datasets = Object.keys(grouped).map((group, index) => {
      const colors = ['#0078d4', '#107c10', '#d83b01', '#5c2d91', '#008272'];
      const color = colors[index % colors.length];
      
      return {
        label: group,
        data: grouped[group].map(item => item[dataField]),
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.4
      };
    });

    return {
      labels: [...new Set(rawData.map(item => item[labelField]))],
      datasets
    };
  } else {
    // Simple chart data
    return {
      labels: rawData.map(item => item[labelField]),
      datasets: [{
        label: 'Usage',
        data: rawData.map(item => item[dataField]),
        backgroundColor: ['#0078d4', '#107c10', '#d83b01', '#5c2d91', '#008272'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }
};

// API service functions
export const apiService = {
  // Fetch usage trends data
  async getUsageTrends() {
    const rawData = await fetchFromAPI('/usage-trends');
    return transformToChartData(rawData, {
      labelField: 'date',
      dataField: 'cpu_usage',
      groupByField: 'region'
    });
  },

  // Fetch top regions data
  async getTopRegions() {
    const rawData = await fetchFromAPI('/top-regions');
    return transformToChartData(rawData, {
      labelField: 'region',
      dataField: 'total_usage'
    });
  },

  // Fetch storage by type data
  async getStorageByType() {
    const rawData = await fetchFromAPI('/storage-by-type');
    return transformToChartData(rawData, {
      labelField: 'storage_type',
      dataField: 'usage_tb'
    });
  },

  // Fetch daily averages
  async getDailyAverages() {
    const rawData = await fetchFromAPI('/daily-averages');
    return transformToChartData(rawData, {
      labelField: 'date',
      dataField: 'avg_cpu_usage',
      groupByField: 'region'
    });
  },

  // Fetch raw data for tables
  async getRawData() {
    return await fetchFromAPI('/raw-data');
  },

  // Generic function to fetch and transform any endpoint
  async getChartData(endpoint, config) {
    const rawData = await fetchFromAPI(endpoint);
    return transformToChartData(rawData, config);
  }
};

// Export individual functions for backwards compatibility
export const {
  getUsageTrends,
  getTopRegions,
  getStorageByType,
  getDailyAverages,
  getRawData,
  getChartData
} = apiService;

export default apiService;