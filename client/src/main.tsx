import React from 'react';
import ReactDOM from 'react-dom/client';
import SafeApp from './SafeApp';
import './index.css';

// Güvenli ve karmaşık olmayan main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <SafeApp />
);
