import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Assicurati che sia importato
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Assicurati che BrowserRouter avvolga App */} 
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
