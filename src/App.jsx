import { createBrowserRouter,RouterProvider } from 'react-router' 
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import ProtectedRoute from './component/Auth/ProtectedRoute'
function App() {

  const router = createBrowserRouter([
    {
      path:'/',
      element:<ProtectedRoute><Dashboard/></ProtectedRoute>
    },
    {
      path:"/login",
      element:<Login/>
    },
    {
      path:"/signup",
      element:<Signup/>
    }
  ])
  return (
   <RouterProvider router={router} />
  )
}

export default App
