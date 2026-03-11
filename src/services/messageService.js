import api from "./api"

const getMessages = async (userId) => {
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

export default getMessages