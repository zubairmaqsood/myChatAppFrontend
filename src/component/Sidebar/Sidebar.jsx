import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { setSelectedUser } from "../../Redux/slices/chatSlice";


function Sidebar({ isLoading, searchInput, setSearchInput }) {

  const chats = useSelector((state)=>state.chat.chats)
  const selectedUserId = useSelector((state)=>state.chat.selectedUser?.id)
  const dispatch = useDispatch()  

  const navigate = useNavigate()

  // to logout user
  const handleLogout = ()=>{
    localStorage.removeItem("token")
    dispatch({type:"LOGOUT"})
    navigate("/login")
  }

  return (
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
              <button className="dropdown-item">
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
        ) : chats ? ( //when api call is done and see if any chat appear
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`d-flex align-items-center chat-item ${selectedUserId === chat._id ? "active-chat" : ""}`}
              onClick={() => dispatch(setSelectedUser({
                id: chat._id,
                name: chat.name,
                profilePic: chat.profilePic
            }))}
            >
              {/* Image Section */}
              <div className="position-relative me-3">
                <img
                  src={
                    chat.profilePic
                      ? `http://localhost:3000/uploads/${chat.profilePic}`
                      : "/default.webp"
                  }
                  alt="profilePic"
                  className="rounded-circle object-fit-cover profilePic"
                  onError={(e) => (e.target.src = "/default.webp")}
                />
                <span className="position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle"></span>
              </div>

              {/* Content Section */}
              <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className="m-0">{chat.name}</h6>
                  <small className="text-muted">{chat.lastMessageTime}</small>
                </div>
                <p className="m-0 text-muted">{chat.lastMessage}</p>
              </div>
            </div>
          ))
        ) : (
          // if no chat is found
          <div className="text-center text-muted mt-5">
            <i className="bi bi-chat-dots fs-1 mb-2"></i>
            <p>No chats found. Search for a user to start messaging!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
