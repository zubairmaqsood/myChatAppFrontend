import "./Sidebar.css"
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { socket } from "../../Sockets/socket";
import { setSelectedUser,clearUnreadCount } from "../../Redux/slices/chatSlice";
import Profile from "../Profile/Profile";


function Sidebar({ isLoading, searchInput, setSearchInput,searchedUsers,isSearching }) {

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const chats = useSelector((state)=>state.chat.chats)
  const selectedUserId = useSelector((state)=>state.chat.selectedUser?.id)
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const dispatch = useDispatch()  

  const navigate = useNavigate()

  // to logout user
  const handleLogout = ()=>{
    localStorage.removeItem("token")
    dispatch({type:"LOGOUT"})
    socket.disconnect() //closes connection with backend

    navigate("/login")
  }

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // for chats which we have already talked to
  const filteredChats = chats 
    ? chats.filter((chat) => chat.name.toLowerCase().includes(searchInput.toLowerCase()))
    : [];

  // Filter the "Other Users" to REMOVE people who are already in your chats list!
  // This prevents the exact same person from showing up in both sections.
  const otherUsers = (searchInput&&searchedUsers)
    ? searchedUsers.filter((user) => !chats.some((chat) => chat._id === user._id))
    : [];

  return (
    <div className="position-relative h-100 overflow-hidden bg-white">

      {/* to show profile component */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100 z-3" 
        style={{ 
            transform: isProfileOpen ? "translateX(0)" : "translateX(-100%)", 
            transition: "transform 0.3s ease-in-out",
            backgroundColor: "#f0f2f5"
        }}
      >
          <Profile onClose={() => setIsProfileOpen(false)} />
      </div>
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-3 pt-1">
          <h4 className="m-0">My Chat App</h4>
          <div className="dropdown">
            <button
              className="btn btn-light border-0"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots-vertical fs-5"></i>
            </button>

            <ul className="dropdown-menu shadow">
              <li>
                <button className="dropdown-item" onClick={() => setIsProfileOpen(true)}>
                  <i className='"bi bi-person me-2'></i>
                  Profile
                </button>
              </li>

              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* search bar */}
        <div className="p-3 border-bottom">
          <div className="input-group">
            {/* The Search Icon */}
            <span
              className="input-group-text bg-light border-end-0 "
              id="search-addon"
            >
              <i className="bi bi-search"></i>
            </span>

            {/* The Input Field */}
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-control bg-light border-start-0 shadow-none"
              placeholder="Search or start new chat"
              aria-label="Search chats"
              aria-describedby="search-addon"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="d-flex flex-column p-3 gap-4">
          {/* When data is fetching then show loader */}
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) :(
            <>
              {/* --- SECTION 1: RECENT CHATS --- */}
              {filteredChats.length > 0 && (
                <div>
                  <h6 className="text-muted mb-3 chatTitles">RECENT CHATS</h6>
                  {filteredChats.map((chat) => {
                    const isOnline = onlineUsers.includes(chat._id);
                    const displayTime = formatTime(chat.lastMessageTime);
                    
                    return (
                      <div
                        key={chat._id}
                        className={`d-flex align-items-center chat-item mb-3 ${selectedUserId === chat._id ? "active-chat" : ""}`}
                        onClick={() => { 
                          dispatch(setSelectedUser({ id: chat._id, name: chat.name, profilePic: chat.profilePic,unreadCount: chat.unreadCount })) 
                          dispatch(clearUnreadCount(chat._id))
                        }}
                      >
                        <div className="position-relative me-3">
                          <img src={chat.profilePic ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profilePics/${chat.profilePic}` : "/default.webp"} alt="dp" className="rounded-circle object-fit-cover profilePic" onError={(e) => (e.target.src = "/default.webp")} />
                          {isOnline && <span className="position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle"></span>}
                        </div>
                        <div className="d-flex flex-grow-1 justify-content-between overflow-hidden">

                          <div className="d-flex flex-column overflow-hidden pe-2">
                            <h6 className="m-0 text-truncate pe-2">{chat.name}</h6>
                            <p className="m-0 text-muted text-truncate">{chat.lastMessage}</p>
                          </div>

                          <div className="d-flex flex-column align-items-end ms-2">
                            <small className="text-muted text-nowrap">{displayTime}</small>
                            {chat.unreadCount > 0 && (
                              <span className="badge bg-success rounded-circle mt-1">
                                  {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- SECTION 2: OTHER USERS --- */}
              {/* Show this section if we are actively searching OR if we found other users */}
              {searchInput && (isSearching || otherUsers.length > 0) && (
                <div className="mt-2">
                  <h6 className="text-muted mb-3 chatTitles">OTHER USERS</h6>
                  
                  {isSearching ? (
                    // SPINNER: Replaces the user list perfectly under the heading!
                    <div className="d-flex justify-content-center py-2">
                      <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                    </div>
                  ) : (
                    // USERS: Render when searching is done
                    otherUsers.map((user) => {
                      const isOnline = onlineUsers.includes(user._id);
                      return (
                        <div
                          key={user._id}
                          className={`d-flex align-items-center chat-item mb-3 ${selectedUserId === user._id ? "active-chat" : ""}`}
                          onClick={() => dispatch(setSelectedUser({ id: user._id, name: user.name, profilePic: user.profilePic,unreadCount: user.unreadCount }))}
                        >
                          <div className="position-relative me-3">
                            <img src={user.profilePic ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profilePics/${user.profilePic}` : "/default.webp"} alt="dp" className="rounded-circle object-fit-cover profilePic" onError={(e) => (e.target.src = "/default.webp")} />
                            {isOnline && <span className="position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle"></span>}
                          </div>
                          <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                            <h6 className="m-0 text-truncate pe-2">{user.name}</h6>
                            <p className="m-0 text-muted text-truncate otherUserChatPreview">Tap to start chatting</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}  

              {/* If absolutely nothing matches in both arrays */}
              {filteredChats.length === 0 && otherUsers.length === 0 && searchInput && !isSearching && (
                <div className="text-center text-muted mt-5">
                  <p>No users found matching "{searchInput}"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
