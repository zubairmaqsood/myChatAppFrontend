import api from "./api";

const getChats = async()=>{
    try{
        const response = await api.get("messages/chats")
        return response.data
    }catch(err){
        return err?.response.data
    }
}

export default getChats