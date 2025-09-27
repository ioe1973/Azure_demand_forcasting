import React from 'react';
import './MainContent.css';
import { useApiData } from '../hooks/useApiData';
import { getUsageTrends } from '../services/apiService';

const MainContent = ({ children }) => {
  const { data, loading, error } = useApiData(getUsageTrends);

  console.log('API Data:', data, 'Loading:', loading, 'Error:', error);

  return (
    <main className="main-content">
      <div className="content-body">
        {children}
      </div>
    </main>
  );
};

export default MainContent;