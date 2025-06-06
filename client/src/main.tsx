import React from 'react';
import ReactDOM from 'react-dom/client';
import SafeApp from './SafeApp';
import './index.css';

// Uygulamayı başlat
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element bulunamadı');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SafeApp />
  </React.StrictMode>
);
