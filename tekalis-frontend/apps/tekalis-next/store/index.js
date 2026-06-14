/**
 * store/index.js - Redux store pour Next.js App Router
 */
"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer     from "./slices/authSlice";
import cartReducer     from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import productReducer  from "./slices/productSlice";
import uiReducer       from "./slices/uiSlice";

const rootReducer = combineReducers({
  auth:     authReducer,
  cart:     cartReducer,
  wishlist: wishlistReducer,
  products: productReducer,
  ui:       uiReducer,
});

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (get) => get({ serializableCheck: false }),
  });

export const store = makeStore();