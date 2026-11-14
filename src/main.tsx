import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Self-hosted fonts (no external font CDN requests at runtime)
import '@fontsource-variable/inter';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/400-italic.css';
import '@fontsource/amiri/700.css';
import '@fontsource/amiri/700-italic.css';

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
