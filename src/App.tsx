import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AppProvider } from './hooks/useAppContext';
import BusinessInsights from './pages/BusinessInsights';
import ChurnPrediction from './pages/ChurnPrediction';
import CustomerAnalytics from './pages/CustomerAnalytics';
import ModelPerformance from './pages/ModelPerformance';
import Overview from './pages/Overview';
import Segmentation from './pages/Segmentation';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/analytics" element={<CustomerAnalytics />} />
            <Route path="/segmentation" element={<Segmentation />} />
            <Route path="/prediction" element={<ChurnPrediction />} />
            <Route path="/models" element={<ModelPerformance />} />
            <Route path="/insights" element={<BusinessInsights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}
