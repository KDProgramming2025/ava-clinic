
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { HelmetProvider } from 'react-helmet-async';
  import { BrowserRouter } from 'react-router-dom';

  const configuredBase = (import.meta.env.VITE_PUBLIC_BASE ?? '').trim();
  const browserBase = (() => {
    if (configuredBase) {
      return configuredBase;
    }

    if (typeof window === 'undefined') {
      return '/';
    }

    const knownPrefixes = ['/laravel'];
    const match = knownPrefixes.find(prefix => {
      return window.location.pathname === prefix || window.location.pathname.startsWith(prefix + '/');
    });

    return match ?? '/';
  })();

  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <BrowserRouter basename={browserBase}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  );
  