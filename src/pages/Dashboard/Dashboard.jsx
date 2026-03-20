import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { setChats,setSelectedUser } from "../../Redux/slices/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import getChats from "../../services/chatService";
import { searchUsers } from "../../services/userService";
import ChatScreen from "../../component/ChatScreen/ChatScreen";
import Sidebar from "../../component/Sidebar/Sidebar";

function Dashboard() {
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // id for currently selected user to chat
  const selectedUserId = useSelector((state) => state.chat.selectedUser?.id);
  const [searchedUsers, setSearchedUsers] = useState([]);

  const dispatch = useDispatch();

  const debouncedSearch = useDebounce(searchInput, 500);
  // 1. Add this state at the top
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // 2. Add this variable to prevent UI flashing during the 500ms delay!
  const isSearching = isSearchLoading || (searchInput !== debouncedSearch);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getChats();
        dispatch(setChats(response));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, []);

  // This useEffect ONLY runs when the user STOPS typing for 500ms
  useEffect(() => { 
    const fetchSearchedUsers = async()=>{
      if (debouncedSearch) {
        try {
          setIsSearchLoading(true)
          const response = await searchUsers(debouncedSearch)
          setSearchedUsers(response.users); 
        } catch (err) {
          console.error("Failed to search users", err);
        }finally {
          setIsSearchLoading(false); // <-- Stop loading
        }
      }else {
        // If search is empty, clear the "Other Users" list
        setSearchedUsers([]);
      }
    }

    fetchSearchedUsers()
  }, [debouncedSearch]);

  // --- HARDWARE BACK BUTTON INTERCEPTOR ---
  useEffect(() => {
    if (!selectedUserId) return;

    // 1. When a chat opens, push a "fake" page into the phone's history
    window.history.pushState({ isChatOpen: true }, "");

    // 2. Listen for the user pressing the physical back button
    const handlePopState = () => {
      // Instead of leaving the website, just clear the chat!
      dispatch(setSelectedUser(null));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedUserId, dispatch]);


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
    <div className="container-fluid h-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div
          className={`col-md-4 bg-light h-100 overflow-auto border-end p-0 ${selectedUserId ? "d-none d-md-block" : "d-block"}`}
        >
          <Sidebar
            isLoading={isLoading}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchedUsers={searchedUsers}
            isSearching={isSearching}
          />
        </div>

        {/* Chat Area */}
        <div
          className={`col-md-8 h-100 border-end p-0 ${selectedUserId ? "d-block" : "d-none d-md-block"}`}
        >
          {selectedUserId ? (
            <ChatScreen setSearchInput={setSearchInput}/>
          ) : (
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
