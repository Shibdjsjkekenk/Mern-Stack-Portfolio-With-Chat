// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes/index.jsx'; // your router config file
import { Provider } from 'react-redux';
import { store } from './store/store';
import "leaflet/dist/leaflet.css";


createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  // </StrictMode>
);
