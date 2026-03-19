import { createSlice } from "@reduxjs/toolkit";

const MAX_CACHED_CHATS = 10 // for storing chats data in cache at a time

export const messageSlice = createSlice({
    name:"message",
    initialState:{
        chatCache:{}, // Dictionary format: { "user_123": [...messages], "user_456": [...messages] }
        recentChatIds : [] //to track the ids which is least recently used for LRU algo e.g [oldId,...,newId]
    },
    reducers:{
        // for initial load of messages
        setMessages : (state,action)=>{
            const {selectedUserId,response} = action.payload
            state.chatCache[selectedUserId] = response

            // ---- LRU ALGO -----

            // 1. Find if the chat currently is in the queue means already talk to user in last ten times
            const index = state.recentChatIds.findIndex(id => id === selectedUserId);

            // 2. If it's already in the queue, cleanly slice it out of its old spot
            if (index !== -1) {
                state.recentChatIds.splice(index, 1); 
            }
            // 3. Put it at the very end of the array (Mark as Most Recent)
            state.recentChatIds.push(selectedUserId);

            if (state.recentChatIds.length > MAX_CACHED_CHATS) {
                const oldestChatId = state.recentChatIds.shift(); // Grab the first ID
                delete state.chatCache[oldestChatId]; // Delete its massive array from RAM
            }
       },
        // when new message comes
       addMessage : (state,action)=>{
            const { chatId, message } = action.payload;
            
            // ONLY push the message if we have ALREADY fetched their history!
            // Do NOT create an empty array.
            if (state.chatCache[chatId]) {
                state.chatCache[chatId].push(message);
            }
        },

        // for deletion of whole chat
        removeMessages: (state,action)=>{
            delete state.chatCache[action.payload]
        }
    }
})

export const { setMessages, addMessage,removeMessages } = messageSlice.actions;
export default messageSlice.reducer