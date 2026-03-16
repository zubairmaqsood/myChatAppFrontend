import api from "./api"

export const getMessages = async (userId) => {
    try {
        const response = await api.get(`/messages/${userId}`);
        return response.data; // Success path
    } catch (err) {
        // Extract the specific message from the backend
        const errorMessage = err.response?.data?.message || "Something went wrong";
        // RE-THROW the error so ChatScreen hits its 'catch' block
        throw new Error(errorMessage); 
    }
};


export const sendMessage = async(data)=>{
    try {
        const response = await api.post(`/messages/send`,data);
        return response.data; // Success path
    } catch (err) {
        // Extract the specific message from the backend
        const errorMessage = err.response?.data?.message || "Something went wrong";
        // RE-THROW the error so ChatScreen hits its 'catch' block
        throw new Error(errorMessage); 
    }
}


export const deleteMessages = async (userId) => {
    try {
        const response = await api.delete(`/messages/delete/${userId}`);
        return response.data;
    } catch (error) {
        // Extract the specific message from the backend
        const errorMessage = error.response?.data?.message || "Something went wrong";
        // RE-THROW the error so ChatScreen hits its 'catch' block
        throw new Error(errorMessage);
    }
};