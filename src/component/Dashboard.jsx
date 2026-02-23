import { useState } from 'react'
import './Dashboard.css'
import ChatScreen from './ChatScreen'

function Dashboard() {
    const [selectedUser, setselectedUser] = useState(null)
  return (
    <div className='container-fluid vh-100'>
        <div className='row'>

            {/* Sidebar */}
            <div className={`col-md-4 bg-light vh-100 overflow-auto border-end p-0 ${selectedUser ? 'd-none d-md-block' : 'd-block'}`}>

                {/* Header */}
                <div className='d-flex align-items-center justify-content-between px-3 pt-1'>
                    <h4 className="m-0">My Chat App</h4>
                    <div className='dropdown'>
                        <button
                        className="btn btn-light border-0" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        >
                            <i className="bi bi-three-dots-vertical fs-5"></i>
                        </button>

                        <ul className='dropdown-menu shadow'>
                            <li>
                                <button className='dropdown-item'>
                                    <i className='"bi bi-person me-2'></i>
                                    Profile
                                </button>
                            </li>


                            <li>
                                <button className='dropdown-item text-danger'>
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* search bar */}
                <div className='p-3 border-bottom'>
                    <div className="input-group">
                       {/* The Search Icon */}
                        <span className="input-group-text bg-light border-end-0 " id="search-addon">
                            <i className="bi bi-search"></i>
                        </span>
                        
                        {/* The Input Field */}
                        <input 
                        type="search" 
                        className="form-control bg-light border-start-0 shadow-none" 
                        placeholder="Search or start new chat" 
                        aria-label="Search chats" 
                        aria-describedby="search-addon"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="d-flex flex-column p-3 gap-4">
                    <div className={`d-flex align-items-center chat-item ${selectedUser === "pretty java" ? "active-chat" : ""}`} onClick={()=>setselectedUser("pretty java")}>
                        {/* Image Section */}
                        <div className='position-relative me-3'>
                            <img src="city-night-drive-stockcake.jpg" alt="userpic" className='rounded-circle object-fit-cover profilePic'/>
                            <span className='position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle'></span>
                        </div>

                        {/* Content Section */}
                        <div className='d-flex flex-column flex-grow-1'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h6 className='m-0'>John Doe</h6>
                                <small className='text-muted'>2:30 PM</small>
                            </div>
                            <p className='m-0 text-muted'>Hey, how are you?</p>
                        </div>
                    </div>
                    <div className={`d-flex align align-items-center chat-item ${selectedUser === "hello" ? "active-chat" : ""}`} onClick={()=>setselectedUser("hello")}>
                        {/* Image Section */}
                        <div className='me-3'>
                            <img src="city-night-drive-stockcake.jpg" alt="userpic" className='rounded-circle object-fit-cover profilePic'/>
                        </div>

                        {/* Content Section */}
                        <div className='d-flex flex-column flex-grow-1'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h6 className='m-0'>John Doe</h6>
                                <small className='text-muted'>2:30 PM</small>
                            </div>
                            <p className='m-0 text-muted'>Hey, how are you?</p>
                        </div>
                    
                    </div>

                    <div className={`d-flex align align-items-center chat-item ${selectedUser === "jkdfjk" ? "active-chat" : ""}`} onClick={()=>setselectedUser("jkdfjk")}>
                        {/* Image Section */}
                        <div className='me-3'>
                            <img src="city-night-drive-stockcake.jpg" alt="userpic" className='rounded-circle object-fit-cover profilePic'/>
                        </div>

                        {/* Content Section */}
                        <div className='d-flex flex-column flex-grow-1'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <h6 className='m-0'>John Doe</h6>
                                <small className='text-muted'>2:30 PM</small>
                            </div>
                            <p className='m-0 text-muted'>Hey, how are you?</p>
                        </div>
                    </div>
                </div>
                
            </div>

            {/* Chat Area */}
            <div className={`col-md-8 vh-100 border-end p-0 ${selectedUser ? 'd-block' : 'd-none d-md-block'}`}>
                <ChatScreen selectedUser = {selectedUser} setSelectedUser={setselectedUser}/>
            </div>
        </div>
    </div>
  )
}

export default Dashboard
