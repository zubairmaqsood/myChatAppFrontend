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
            if (state.user) {
                state.user.profilePic = action.payload;
            }

        }
    }
})

export const {setUser,logout,setProfilePic} = authSlice.actions
export default authSlice.reducer