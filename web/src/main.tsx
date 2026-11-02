import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Порядок такой же, как у <link rel="stylesheet"> в index.html из Лабы 4.
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/react.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);