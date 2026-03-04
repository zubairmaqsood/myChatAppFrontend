import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children })=> {
  // Check if the user has a token saved from when they logged in
  const token = localStorage.getItem("token");

  // If no token, instantly kick them to login BEFORE rendering anything
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have a token, let them see the protected page!
  return children;
}

export default ProtectedRoute;