import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RootGate } from './store/RootGate';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootGate>
      <App />
    </RootGate>
  </React.StrictMode>
);
