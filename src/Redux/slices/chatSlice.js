import { createSlice } from "@reduxjs/toolkit";
import { getUserById } from "../../services/userService";
import { addMessage } from "./messageSlice";

export const chatSlice = createSlice({
    name:"chat",
    initialState:{
        chats:[], // chats in sidebar
        selectedUser:null, // id of user which is currently selected to talk
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

        // for selecting specific user's chat or close in mobile
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
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
            const { chatId, name,profilePic,lastMessage, lastMessageTime } = action.payload;
            
            // Find the exact chat in the sidebar array
            const index = state.chats.findIndex(chat => chat._id === chatId);
            
            if (index!==-1) {
                const [chat] = state.chats.splice(index,1)
            // Immer lets us mutate these specific properties directly!
            // React will ONLY re-render this specific chat item in the Sidebar.
                chat.lastMessage = lastMessage;
                chat.lastMessageTime = lastMessageTime;
                state.chats.unshift(chat)
            }else {
            // 2. BRAND NEW CHAT: Create it and put it at the top of the list!
            state.chats.unshift({
                _id: chatId,
                name: name,
                profilePic: profilePic,
                lastMessage: lastMessage,
                lastMessageTime: lastMessageTime
            });
        }
        },

        removeChat: (state, action) => {
            const chatId = action.payload;
            
             const index = state.chats.findIndex(chat => chat._id === chatId);
            
            if (index!==-1) {
                state.chats.splice(index,1)
                // 2. If you are currently looking at their chat, close the screen!
                if (state.selectedUser?.id === chatId) {
                    state.selectedUser = null;
                }
            }
    },
    }
})

export const {setChats,setOnlineUsers,setSelectedUser,addOnlineUser,removeOnlineUser,updateChatPreview,addChat,removeChat} = chatSlice.actions
export default chatSlice.reducer

export const handleIncomingMessage = (data) => async (dispatch, getState) => {
    // 1. Add the message to the chat screen
    dispatch(
        addMessage({
            chatId: data.from,
            message: {
                _id: data._id,
                fromSelf: false,
                message: data.text,
                time: data.time
            },
        })
    );

    // 2. getState() NEVER goes stale! It looks at the live Redux store.
    const state = getState();
    const existingChat = state.chat.chats.find(c => c._id === data.from);

    if (existingChat) {
        // SCENARIO A: You already know them. Just bump the preview!
        dispatch(updateChatPreview({
            chatId: data.from, 
            lastMessage: data.text, 
            lastMessageTime: data.time
        }));
    } else {
        // SCENARIO B: Brand new person! 
        try {
            const response = await getUserById(data.from);
            const newUserData = response.user; 

            dispatch(addChat({
                _id: newUserData._id,
                name: newUserData.name,
                profilePic: newUserData.profilePic,
                lastMessage: data.text,
                lastMessageTime: data.time
            }));
        } catch (error) {

            console.error("Failed to fetch new user data for sidebar", error);
        }
    }
};