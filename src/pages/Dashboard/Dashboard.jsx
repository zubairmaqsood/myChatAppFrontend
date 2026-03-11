import { useState, useEffect } from "react";
import "./Dashboard.css";
import { useDebounce } from "../../hooks/useDebounce";
import { useDispatch, useSelector } from "react-redux";
import { setChats } from "../../Redux/slices/chatSlice";
import getChats from "../../services/chatService";
import ChatScreen from "../../component/ChatScreen/ChatScreen";
import Sidebar from "../../component/Sidebar/Sidebar";

function Dashboard() {
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedUserId = useSelector((state)=>state.chat.selectedUser?.id) // id for currently selected user to chat
  const dispatch = useDispatch()

  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    const fetchChats = async () => {
      try{
        const response = await getChats();
        dispatch(setChats(response));
      }catch(err){
        console.error(err)
        setError(err.message)
      }
      finally{
        setIsLoading(false)
      }
    };
    fetchChats();
  }, []);

  // This useEffect ONLY runs when the user STOPS typing for 500ms
  useEffect(() => {
    if (debouncedSearch) {
      console.log("Making API call for:", debouncedSearch);
      // Run your actual filter or search logic here!
    }
  }, [debouncedSearch]);

  if (error) {
    return (
      <div className="vh-100 vw-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center p-5 bg-white shadow rounded">
          <h3 className="mt-3">Oops! Something went wrong.</h3>
          <p className="text-muted">{error}</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()} // Quick and easy retry
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-fluid vh-100">
      <div className="row">
        {/* Sidebar */}
        <div
          className={`col-md-4 bg-light vh-100 overflow-auto border-end p-0 ${selectedUserId ? "d-none d-md-block" : "d-block"}`}
        >
         <Sidebar
            isLoading={isLoading}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
         />
        </div>

        {/* Chat Area */}
          <div
            className={`col-md-8 vh-100 border-end p-0 ${selectedUserId ? "d-block" : "d-none d-md-block"}`}
          >
          {
            selectedUserId?(
            <ChatScreen/>
          ):(
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              <h4>Select a friend to start chatting</h4>
            </div>
          )}
          </div>
      </div>
    </div>
  );
}

export default Dashboard;
