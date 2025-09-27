// API service for Azure Demand Forecasting Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to build query parameters
const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.region && filters.region !== 'all') {
    params.append('regions', filters.region);
  }
  
  if (filters.resourceType && filters.resourceType !== 'all') {
    params.append('resource_type', filters.resourceType);
  }
  
  if (filters.timeRange) {
    params.append('time_range', filters.timeRange);
  }
  
  return params.toString();
};

// Helper function to handle API requests with filters
const fetchFromAPI = async (endpoint, filters = {}) => {
  try {
    const queryParams = buildQueryParams(filters);
    const url = queryParams ? `${API_BASE_URL}${endpoint}?${queryParams}` : `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Improved transform function that handles undefined values
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
    // Filter out records with undefined/null grouping field values
    const validData = rawData.filter(item => 
      item[groupByField] && 
      item[groupByField] !== null && 
      item[groupByField] !== undefined &&
      item[groupByField].toString().trim() !== ''
    );

    if (validData.length === 0) {
      return {
        labels: ['No Valid Data'],
        datasets: [{
          label: 'No Valid Data',
          data: [0],
          backgroundColor: '#cccccc',
          borderColor: '#999999'
        }]
      };
    }

    // Group data by specified field (e.g., region) - only valid data
    const grouped = validData.reduce((acc, item) => {
      const group = item[groupByField].toString().trim();
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});

    // Get unique labels (e.g., dates) from valid data only
    const labels = [...new Set(validData.map(item => {
      const label = item[labelField];
      if (labelField === 'date' && label) {
        try {
          return new Date(label).toLocaleDateString();
        } catch (e) {
          return label.toString();
        }
      }
      return label ? label.toString() : 'Unknown';
    }))].sort();

    // Create datasets for each group
    const colors = ['#0078d4', '#107c10', '#d83b01', '#5c2d91', '#008272'];
    const datasets = Object.keys(grouped).map((group, index) => {
      const color = colors[index % colors.length];
      
      const data = labels.map(label => {
        const matchingItem = grouped[group].find(item => {
          let itemLabel;
          if (labelField === 'date' && item[labelField]) {
            try {
              itemLabel = new Date(item[labelField]).toLocaleDateString();
            } catch (e) {
              itemLabel = item[labelField].toString();
            }
          } else {
            itemLabel = item[labelField] ? item[labelField].toString() : 'Unknown';
          }
          return itemLabel === label;
        });
        return matchingItem ? parseFloat(matchingItem[dataField]) || 0 : 0;
      });

      return {
        label: group, // This should now never be undefined
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
    // Filter out undefined/null values
    const validData = rawData.filter(item => 
      item[labelField] && 
      item[labelField] !== null && 
      item[labelField] !== undefined &&
      item[dataField] !== null &&
      item[dataField] !== undefined
    );

    const labels = validData.map(item => item[labelField].toString().trim());
    const data = validData.map(item => parseFloat(item[dataField]) || 0);
    
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

// API service functions with filter support
export const apiService = {
  // Fetch usage trends data
  async getUsageTrends(filters = {}) {
    try {
      const rawData = await fetchFromAPI('/usage-trends', filters);
      return transformToChartData(rawData, {
        labelField: 'date',
        dataField: 'usage_cpu',
        groupByField: 'region'
      });
    } catch (error) {
      return { labels: [], datasets: [] };
    }
  },

  // Fetch top regions data
  async getTopRegions(filters = {}) {
    try {
      const rawData = await fetchFromAPI('/top-regions', filters);
      return transformToChartData(rawData, {
        labelField: 'region',
        dataField: 'total_cpu_usage'
      });
    } catch (error) {
      return { labels: [], datasets: [] };
    }
  },

  // Fetch storage by type data
  async getStorageByType(filters = {}) {
    try {
      const rawData = await fetchFromAPI('/storage-by-type', filters);
      return transformToChartData(rawData, {
        labelField: 'resource_type',
        dataField: 'total_storage'
      });
    } catch (error) {
      return { labels: [], datasets: [] };
    }
  },

  // Fetch daily averages
  async getDailyAverages(filters = {}) {
    try {
      const rawData = await fetchFromAPI('/daily-averages', filters);
      return transformToChartData(rawData, {
        labelField: 'date',
        dataField: 'usage_cpu',
        groupByField: 'region'
      });
    } catch (error) {
      return { labels: [], datasets: [] };
    }
  },

  // Fetch raw data for tables
  async getRawData(filters = {}) {
    try {
      return await fetchFromAPI('/raw-data', filters);
    } catch (error) {
      return [];
    }
  }
};

// Export individual functions
export const {
  getUsageTrends,
  getTopRegions,
  getStorageByType,
  getDailyAverages,
  getRawData
} = apiService;

export default apiService;