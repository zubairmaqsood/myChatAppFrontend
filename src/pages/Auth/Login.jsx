import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import "./Auth.css"
import api from '../../services/api';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      // Calls your Express backend
      const response = await api.post('/users/login', data);
      
      // Save the JWT token to localStorage so the user stays logged in
      localStorage.setItem("token", response.data.token);
      
      // Redirect to your Chat Dashboard
      navigate('/'); 
    } catch (err) {
      setApiError(err.response?.data?.message );
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Welcome Back</h3>

        {apiError && <div className="alert alert-danger p-2 text-center">{apiError}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input 
              type="email" 
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register("email", { required: "Email is required" })} 
            />
            {errors.email && <small className="text-danger">{errors.email.message}</small>}
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className='passwordContainer'>
            <input 
              type={showPassword?"text":"password"}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register("password", { required: "Password is required" })} 
            />
            <span className='passwordIcon' onClick={()=>setShowPassword(show=>!show)}><i className="bi bi-eye"></i></span>
            </div>
            {errors.password && <small className="text-danger">{errors.password.message}</small>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <div className="text-center mt-3">
          <small>Don't have an account? <Link to="/signup">Sign up</Link></small>
        </div>
      </div>
    </div>
  );
}

export default Login;