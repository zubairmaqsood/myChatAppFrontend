import api from "./api";

const getChats = async()=>{
    try{
        const response = await api.get("messages/chats")
        return response.data
    }catch(err){
        const errorMessage =  err?.response.data.message || "Something went wrong";
        
        throw new Error(errorMessage);
    }
}

export default getChats