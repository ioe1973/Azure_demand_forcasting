import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

// Custom hook for fetching API data
export const useApiData = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Hook for multiple API calls
export const useMultipleApiData = (apiCalls) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const promises = Object.entries(apiCalls).map(async ([key, apiFunction]) => {
          const result = await apiFunction();
          return [key, result];
        });

        const results = await Promise.all(promises);
        const dataObject = Object.fromEntries(results);
        setData(dataObject);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching multiple data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { data, loading, error };
};

export default useApiData;