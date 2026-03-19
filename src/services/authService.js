import api from "./api";

export const login = async(data)=>{
    try{
        const response = await api.post("/users/login",data)
        return response.data
    }catch (err) {
        // Extract the specific message from the backend
        const errorMessage = err.response?.data?.message || "Something went wrong";
        throw new Error(errorMessage); 
    }
}

export const signup = async(data)=>{
    try{
        const response = await api.post("/users/signup",data)
        return response.data
    }catch (err) {
        // Extract the specific message from the backend
        const errorMessage = err.response?.data?.message || "Something went wrong";
        throw new Error(errorMessage); 
    }
}