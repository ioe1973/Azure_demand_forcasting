# Architecture Overview

## Frontend
- Vite + React application with three sections (Usage Trends, Forecasts, Reports).
- Routing via `react-router-dom`.
- UI composed of `Header`, `Sidebar`, `MainContent`, and page-level components.
- Charts built with `react-chartjs-2` and registered Chart.js modules.

## Data Layer
- `src/services/api.js` exposes async functions returning data for charts and tables.
- Currently returns mock data from `src/data/mockData.js` with simulated latency.
- Replace implementations with real `fetch` calls to `${import.meta.env.VITE_API_URL}` when backend is available.

## State
- Local state in pages for filters (timeRange, region, resourceType).
- `useApi` hook centralizes `loading`, `error`, and `data` states for async calls and exposes `refetch`.

## Styling
- Component-scoped CSS files: `Header.css`, `Sidebar.css`, `MainContent.css`, etc.
- Responsive grid layout for cards and charts.

## Replace Mock with Real Data
1) Backend endpoint returns JSON (recommended).
2) Update `api.js` functions to:
```js
export const getCPUUsageTrends = async (timeRange, regions=[]) => {
  const url = new URL(`${import.meta.env.VITE_API_URL}/cpu-usage`);
  url.searchParams.set('timeRange', timeRange);
  if (regions.length) url.searchParams.set('regions', regions.join(','));
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch CPU usage data');
  const data = await res.json();
  return { success: true, data, metadata: { timeRange, regions, lastUpdated: new Date().toISOString() } };
};
```
3) Verify charts still receive `labels` and `datasets` as expected by Chart.js.

## Security & Env
- Vite env vars must be prefixed with `VITE_`.
- Never commit real secrets — use `.env.local` in development.
