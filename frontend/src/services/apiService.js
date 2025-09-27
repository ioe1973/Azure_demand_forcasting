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
// Improved transform function for your specific CSV data
const transformToChartData = (rawData, config) => {
  const { labelField, dataField, groupByField } = config;
  
  if (!rawData || rawData.length === 0) {
    return { labels: [], datasets: [] };
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
      // Format dates nicely if it's a date field
      if (labelField === 'date' && label) {
        return new Date(label).toLocaleDateString();
      }
      return label;
    }))].sort();

    // Create datasets for each group
    const colors = ['#0078d4', '#107c10', '#d83b01', '#5c2d91', '#008272'];
    const datasets = Object.keys(grouped).map((group, index) => {
      const color = colors[index % colors.length];
      
      // Create data array matching the labels
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
    const labels = rawData.map(item => item[labelField]);
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

// API service functions
export const apiService = {
  // Fetch usage trends data
  async getUsageTrends() {
    const rawData = await fetchFromAPI('/usage-trends');
    return transformToChartData(rawData, {
      labelField: 'date',
      dataField: 'usage_cpu', // Make sure this matches your CSV column
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
      labelField: 'resource_type', // Use the correct field name
      dataField: 'total_storage'   // Use the correct field name
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