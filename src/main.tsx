import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrandingProvider } from './context/BrandingContext.tsx';
import { VehicleShowcaseProvider } from './context/VehicleShowcaseContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandingProvider>
      <VehicleShowcaseProvider>
        <App />
      </VehicleShowcaseProvider>
    </BrandingProvider>
  </StrictMode>,
);

