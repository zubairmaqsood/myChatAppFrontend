import { configureStore,combineReducers } from "@reduxjs/toolkit";
import authReducers from "./slices/authSlice"
import chatReducers from "./slices/chatSlice"
import messageReducer from "./slices/messageSlice"

// 1. Combine all your slices normally
const appReducer = combineReducers({
  chat: chatReducers,
  auth: authReducers,
  message:messageReducer
});

// 2. Create a "Wrapper" Reducer to intercept the logout action otherwise normal actions take place
const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    // Setting state to undefined mathematically forces Redux to use the initialState for everything!
    state = undefined; 
  }
  return appReducer(state, action);
};

// 3. Pass the wrapper to the store
export const store = configureStore({
  reducer: rootReducer,
});