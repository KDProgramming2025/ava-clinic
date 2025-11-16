
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { HelmetProvider } from 'react-helmet-async';
  import { BrowserRouter } from 'react-router-dom';
  import { SeoDefaultsProvider } from './components/SeoDefaultsProvider';

  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <SeoDefaultsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SeoDefaultsProvider>
    </HelmetProvider>
  );
  