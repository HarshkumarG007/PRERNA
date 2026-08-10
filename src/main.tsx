import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import { I18nProvider } from "./engine/localization/i18n";
import { ToastProvider } from "./components/common/Toast";
import { GlobalErrorBoundary } from "./components/common/GlobalErrorBoundary";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalErrorBoundary>
        <I18nProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </I18nProvider>
      </GlobalErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
