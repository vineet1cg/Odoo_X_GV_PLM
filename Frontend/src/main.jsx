import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeApp, isNative } from './capacitor/nativeServices'

const bootstrap = async () => {
  if (isNative) {
    await initializeApp();
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

bootstrap();
