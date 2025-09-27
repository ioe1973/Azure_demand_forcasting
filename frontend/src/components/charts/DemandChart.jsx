import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DemandChart = ({ data, title = "Demand Variation" }) => {
  // Safety check for null/undefined data
  if (!data || !data.labels || !data.datasets) {
    return (
      <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', textAlign: 'center' }}>
          📊 No demand data available<br />
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
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Demand (%)'
        }
      }
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default DemandChart;