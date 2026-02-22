import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";


// Slices existants
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";

// Nouveaux slices
import reviewReducer from "./slices/reviewSlice";
import warrantyReducer from "./slices/warrantySlice";
import rmaReducer from "./slices/rmaSlice";
import wishlistReducer from "./slices/wishListSlice";
import categoryReducer from "./slices/categorySlice";
import articleReducer from "./slices/articleSlice";
import uiReducer from "./slices/uiSlice";

// Combiner tous les reducers
const rootReducer = combineReducers({
  // Slices existants
  auth: authReducer,
  products: productReducer,
  cart: cartReducer,
  orders: orderReducer,
  
  // Nouveaux slices
  reviews: reviewReducer,
  warranties: warrantyReducer,
  rma: rmaReducer,
  wishlist: wishlistReducer,
  categories: categoryReducer,
  articles: articleReducer,
  ui: uiReducer
});

// Configuration de la persistance
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "wishlist", "auth"], // Persiste le panier, wishlist et auth
  blacklist: ["ui"] // Ne pas persister l'UI (notifications, modals)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configuration du store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      serializableCheck: {
        // Ignorer les actions de redux-persist
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
          'ui/addNotification'
        ],
        ignoredPaths: ['ui.notifications']
      } 
    }),
  devTools: process.env.NODE_ENV !== "production"
});

export const persistor = persistStore(store);
export default store;