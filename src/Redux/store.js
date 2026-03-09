import { configureStore } from "@reduxjs/toolkit";
import authReducers from "./slices/authSlice"
import chatReducers from "./slices/chatSlice"
import messageReducer from "./slices/messageSlice"

export const store = configureStore({
    reducer:{
        auth:authReducers,
        chat:chatReducers,
        message:messageReducer
    }
})