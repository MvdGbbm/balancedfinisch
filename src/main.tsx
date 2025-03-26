
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './context/AppContext.tsx';

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <AppProvider>
      <App />
    </AppProvider>
  );
} else {
  console.error("Root element not found");
}
