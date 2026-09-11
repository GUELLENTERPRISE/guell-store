
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { FoodCartProvider } from './context/FoodCartContext.tsx';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <FoodCartProvider>
          <App />
        </FoodCartProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
