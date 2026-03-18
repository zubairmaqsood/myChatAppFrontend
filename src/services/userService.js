import api from "./api";

// this is for currently logged in user in case its data is swiped from redux after refresh
export const getProfile =async ()=>{
    try{
        const response = await api.get("/users/getProfile")
        return response.data
    }catch(err){
        const errMessage = err?.response.data.message
        throw new Error(errMessage)
    }
}

// This is for fetching ANY specific user by their ID
export const getUserById = async (userId) => {
    try {
        // Notice the dynamic ID in the URL!
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (err) {
        // Optional chaining is great here just in case the backend completely fails
        const errMessage = err?.response?.data?.message || "Failed to fetch user profile";
        throw new Error(errMessage);
    }
}

// this is to search for user searched by search bar 
export const searchUsers = async (keyword) => {
  try {
    const response = await api.get(`/users/search?keyword=${keyword}`);
    return response.data; 
  } catch (error) {
    // Optional chaining is great here just in case the backend completely fails
    const errMessage = error?.response?.data?.message || "Failed to fetch users";
    throw new Error(errMessage);
  }
};


export const uploadProfilePic= async (formData) => {
    try {
        // Remember: The backend route must use Multer to handle the file!
        const response = await api.patch("/users/updateProfile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data; // Should return the new filename
    } catch (error) {
        // Optional chaining is great here just in case the backend completely fails
        const errMessage = error?.response?.data?.message || "Failed to fetch upload dp";
        throw new Error(errMessage);
    }
};

// for removing profile pic 
export const removeProfilePicApi = async () => {
    try {
        // We just send the flag as a standard JSON body!
        const response = await api.patch("/users/updateProfile", { removeProfilePic: true });
        return response.data;
    } catch (error) {
        const errMessage = error?.response?.data?.message || "Failed to remove dp";
        throw new Error(errMessage);
    }
};