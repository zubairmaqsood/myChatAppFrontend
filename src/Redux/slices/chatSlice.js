import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
    name:"chat",
    initialState:{
        chats:[], // chats in sidebar
        selectedUserId:null, // id of user which is currently selected to talk
        onlineUsers:[] // for green dots on users
    },
    reducers:{
        // for initial load of chats when app loads
        setChats: (state, action) => {
            state.chats = action.payload; // Overwrites everything
        },

        // for new chat to add if talking to a new person
        addChat : (state,action)=>{
            state.chats.unshift(action.payload)
        },

        // for initial load of online users
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload; // Overwrites everything
        },

        // for selected user whose chat is currently open
        setSelectedUser: (state, action) => {
            state.selectedUserId = action.payload;
        },

        // --- FOR REAL-TIME SOCKET EVENTS ---
        
        // 1. When a user logs in (Socket event: "user-connected")
        addOnlineUser: (state, action) => {
            if (!state.onlineUsers.includes(action.payload)) {
            state.onlineUsers.push(action.payload); 
            }
        },

        // 2. When a user logs out (Socket event: "user-disconnected")
        removeOnlineUser: (state, action) => {
            const index = state.onlineUsers.findIndex(userId => userId === action.payload);
  
            if (index !== -1) {
                state.onlineUsers.splice(index, 1); // Instantly removes that 1 item!
            }
        },

        // 3. When a new message arrives and you need to update the sidebar preview text
        updateChatPreview: (state, action) => {
            const { chatId, lastMessage, lastMessageTime } = action.payload;
            
            // Find the exact chat in the sidebar array
            const existingChat = state.chats.find(chat => chat._id === chatId);
            
            if (existingChat) {
            // Immer lets us mutate these specific properties directly!
            // React will ONLY re-render this specific chat item in the Sidebar.
            existingChat.lastMessage = lastMessage;
            existingChat.lastMessageTime = lastMessageTime;
            }
        }
    }
})

export const {setChats,setOnlineUsers,setSelectedUser,addOnlineUser,removeOnlineUser,updateChatPreview} = chatSlice.actions
export default chatSlice.reducer