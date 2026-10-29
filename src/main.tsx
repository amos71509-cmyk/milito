import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrandingProvider } from './context/BrandingContext.tsx';
import { VehicleShowcaseProvider } from './context/VehicleShowcaseContext.tsx';
import { DiscoveryCardsProvider } from './context/DiscoveryCardsContext.tsx';
import { CustomerAuthProvider } from './context/CustomerAuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomerAuthProvider>
      <BrandingProvider>
        <VehicleShowcaseProvider>
          <DiscoveryCardsProvider>
            <App />
          </DiscoveryCardsProvider>
        </VehicleShowcaseProvider>
      </BrandingProvider>
    </CustomerAuthProvider>
  </StrictMode>,
);

