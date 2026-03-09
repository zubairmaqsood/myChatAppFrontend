import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:3000",
   
})

// This interceptor will run eveytime request is sent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    // If a token exists, attach it to this specific request
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api