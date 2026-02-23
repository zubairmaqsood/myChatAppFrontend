import { createBrowserRouter,RouterProvider } from 'react-router' 
import Dashboard from './component/Dashboard'
function App() {

  const router = createBrowserRouter([
    {
      path:'/',
      element:<Dashboard/>
    }
  ])
  return (
   <RouterProvider router={router} />
  )
}

export default App
