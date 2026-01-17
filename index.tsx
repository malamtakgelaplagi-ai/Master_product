
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Shim for process.env to prevent ReferenceError in browser/Vercel environments
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: '' // This will be injected by the environment if available
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
