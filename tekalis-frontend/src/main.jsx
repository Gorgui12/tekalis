import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store, persistor } from "./store"; // <-- Ajout du persistor
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PersistGate } from "redux-persist/integration/react"; // <-- Ajout

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    </PersistGate>
  </Provider>
);
