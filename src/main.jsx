import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Unlock screen rotation for PWA on Android
if (screen.orientation && screen.orientation.unlock) {
  screen.orientation.unlock();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
