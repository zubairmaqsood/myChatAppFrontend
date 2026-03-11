import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null
    },
    reducers:{
        //initially set user after login or signup
        setUser:(state,action)=>{
            state.user = action.payload
        },

        // when user logout so remove its data
        logout:(state)=>{
            state.user = null
        },

        // setting profile pic 
        setProfilePic:(state,action)=>{
            
        }
    }
})

export const {setUser,logout} = authSlice.actions
export default authSlice.reducer