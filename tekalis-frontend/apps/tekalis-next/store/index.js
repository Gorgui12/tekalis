/**
 * store/index.js - Redux store pour Next.js App Router
 */
"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer     from "./slices/authSlice";
import cartReducer     from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import productReducer  from "./slices/productSlice";
import uiReducer       from "./slices/uiSlice";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'wishlist'],
};

const rootReducer = combineReducers({
  auth:     authReducer,
  cart:     cartReducer,
  wishlist: wishlistReducer,
  products: productReducer,
  ui:       uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (get) => get({ serializableCheck: false }),
  });
  
  if (typeof window !== 'undefined') {
    store.__persistor = persistStore(store);
  }
  
  return store;
};

export const store = makeStore();