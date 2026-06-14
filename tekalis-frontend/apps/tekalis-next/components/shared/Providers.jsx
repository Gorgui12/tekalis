"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import ThemeProvider from "./ThemeProvider";
import ToastProvider from "./ToastProvider";

export default function Providers({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}