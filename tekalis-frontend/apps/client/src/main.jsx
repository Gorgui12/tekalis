import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";

// Shared depuis packages/shared (ou adapter le chemin selon ta config)
import { store, persistor } from "../../../packages/shared/redux/store";
import ErrorBoundary from "../../../packages/shared/ErrorBoundary";
import {ThemeProvider} from "../../../packages/shared/context/ThemeContext";
import { ToastProvider } from "../../../packages/shared/context/ToastContext";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <ThemeProvider>
              
                <App />
             
            </ThemeProvider>
          </ToastProvider>
        </ErrorBoundary>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
