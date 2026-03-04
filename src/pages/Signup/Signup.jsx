import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      // Calls your Express backend
      const response = await axios.post('/api/users/signup', data);
      
      console.log("Signup successful:", response.data);
      // Redirect to login after successful signup
      navigate('/login'); 
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong during signup.");
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Create Account</h3>
        
        {apiError && <div className="alert alert-danger p-2 text-center">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              {...register("name", { required: "Name is required" })} 
            />
            {errors.name && <small className="text-danger">{errors.name.message}</small>}
          </div>

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
            <input 
              type="password" 
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })} 
            />
            {errors.password && <small className="text-danger">{errors.password.message}</small>}
          </div>

          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>

        <div className="text-center mt-3">
          <small>Already have an account? <Link to="/login">Login</Link></small>
        </div>
      </div>
    </div>
  );
}

export default Signup;