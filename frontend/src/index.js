import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CallContextProvider } from './callContext'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <CallContextProvider>
      <Routes>
        <Route path='/' element={< App />} />
      </Routes>
    </CallContextProvider>
  </BrowserRouter>
);

