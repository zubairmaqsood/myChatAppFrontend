import { createBrowserRouter,RouterProvider } from 'react-router' 
import { useEffect,useState } from 'react'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from "./pages/Auth/Login"
import Signup from "./pages/Auth/Signup"
import ProtectedRoute from './component/Auth/ProtectedRoute'
import { socket } from "./Sockets/socket";
import {
  ADD_USER_EVENT,
  ONLINE_USERS_EVENT,
  NEW_ONLINE_EVENT,
  RECIEVE_MESSAGE_EVENT,
  NEW_OFFLINE_EVENT,
  FRIEND_UPDATE_PROFILE
} from "./constants/socketConstants";
import { useDispatch,useSelector } from 'react-redux'
import {setOnlineUsers,addOnlineUser,removeOnlineUser,handleIncomingMessage,updateChatUserInfo} from "./Redux/slices/chatSlice";

import { setUser } from './Redux/slices/authSlice'
import { getProfile } from './services/userService'
function App() {

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // for curretnly Loggedin user to send in socket so every know this user is online
  const loggedInUserId = useSelector((state) => state.auth.user?._id);
  const dispatch = useDispatch()

  useEffect(() => {
    const checkUserAuth = async () => {
      const token = localStorage.getItem("token");
      
      // when at first we open this app
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Silently fetch the profile using the token attached by your interceptor
        const response = await getProfile(); 
        dispatch(setUser(response));
      } catch (err) {
        // If token is expired or invalid, clear it
        console.error("Error occured",err);
        localStorage.removeItem("token");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUserAuth();
  }, [dispatch]);

   useEffect(() => {
    if (!loggedInUserId) return;

    socket.connect(); // connect with server

    // 1. Wrap your emit in a function
    const registerUser = () => {
        socket.emit(ADD_USER_EVENT, loggedInUserId);
    };

    // 2. Fire it exactly when the connection is established!
    socket.on("connect", registerUser);

    // 3. React Strict Mode fallback: if already connected, fire immediately
    if (socket.connected) {
      registerUser();
    }
    socket.on(ONLINE_USERS_EVENT, (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on(NEW_ONLINE_EVENT, (userId) => {
      dispatch(addOnlineUser(userId));
    });

    socket.on(RECIEVE_MESSAGE_EVENT, async(data) => {
      dispatch(handleIncomingMessage(data));
    });

    // to show if other user have updated its profile data
    socket.on(FRIEND_UPDATE_PROFILE, (userData) => {
      dispatch(updateChatUserInfo(userData));
    });

    // Listen for a user going OFFLINE (Backend sent SELF_OFFLINE_EVENT)
    socket.on(NEW_OFFLINE_EVENT, (userId) => {
      // This removes the user's ID from the Redux array, instantly turning their green dot gray!
      dispatch(removeOnlineUser(userId));
    });

    return () => {
        socket.off("connect", registerUser);
        socket.off(ONLINE_USERS_EVENT);
        socket.off(NEW_ONLINE_EVENT);
        socket.off(RECIEVE_MESSAGE_EVENT);
        socket.off(NEW_OFFLINE_EVENT);
        socket.off(FRIEND_UPDATE_PROFILE);
      };
  }, [loggedInUserId, dispatch]);

  // Prevent the app from flashing the Login screen while verifying the token
  if (isCheckingAuth) {
    return (  
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }
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
