import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";

// Shared depuis packages/shared
import { store, persistor } from "../../../packages/shared/redux/store";
import ErrorBoundary from "../../../packages/shared/ErrorBoundary";
import { ToastProvider } from "../../../packages/shared/context/ToastContext";
import { ThemeProvider } from "../../../packages/shared/context/ThemeContext";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <ToastProvider>
            <ThemeProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ThemeProvider>
          </ToastProvider>
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);