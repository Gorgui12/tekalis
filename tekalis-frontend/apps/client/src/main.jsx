import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Shared depuis packages/shared (ou adapter le chemin selon ta config)
import { store, persistor } from "../../../packages/shared/redux/store";
import ErrorBoundary from "../../../packages/shared/ErrorBoundary";
import {ThemeProvider} from "../../../packages/shared/context/ThemeContext";
import { ToastProvider } from "../../../packages/shared/context/ToastContext";

import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");


// Supporte à la fois prerendering (hydration) et rendu normal
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, <App />);
} else {
  ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <ThemeProvider>
              
                <HelmetProvider>
                     <App />
                </HelmetProvider>
             
            </ThemeProvider>
          </ToastProvider>
        </ErrorBoundary>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
  );
}
