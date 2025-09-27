import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title = "Distribution Chart" }) => {
  // Safety check for null/undefined data
  if (!data || !data.labels || !data.datasets) {
    return (
      <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', textAlign: 'center' }}>
          📊 No distribution data available<br />
          <small>Loading real CSV data...</small>
        </p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Pie options={options} data={data} />
    </div>
  );
};

export default PieChart;