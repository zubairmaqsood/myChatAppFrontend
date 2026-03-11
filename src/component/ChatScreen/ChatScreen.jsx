import { useRef,useEffect,useState } from "react";
import { useSelector ,useDispatch} from "react-redux";
import getMessages from "../../services/messageService";
import { setMessages } from "../../Redux/slices/messageSlice";
import { setSelectedUser } from "../../Redux/slices/chatSlice";
import "./ChatScreen.css"

function ChatScreen() {

    const textareaRef = useRef(null);
    const messageEndRef = useRef(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    
    const selectedUser = useSelector((state)=>state.chat.selectedUser)
    const chatMessages = useSelector((state)=> state.message.chatCache[selectedUser?.id]) 
    const dispatch = useDispatch()

    useEffect(() => {
      if(!selectedUser.id) return // at initial load when first component renders then it will return 

    //   ---- Cache Check ----
      if(chatMessages) return //cache hit if messages of currently selected user is in cache of redux. No api call return.
    
      // cache miss in redux if no message exist for selected user means if user is new to chat or deleted earlier  
      fetchMessages()
    }, [selectedUser?.id,chatMessages])
    
    
    const fetchMessages = async()=>{
        try{
            setIsLoading(true)
            setError(null)
            const response = await getMessages(selectedUser?.id)
            dispatch(setMessages({selectedUserId: selectedUser?.id,response}))
        }catch(err){
            console.error(err)
            setError(err.message)
        }
        finally{
            setIsLoading(false)
        }
    }

    useEffect(() => {
      if(textareaRef.current){
        textareaRef.current.focus()
      }
    }, [isLoading])


    useEffect(() => {
        const scrollToBottom = ()=>{
            messageEndRef.current?.scrollIntoView({behavior:"smooth"})
        }
        scrollToBottom()
    }, [isLoading])
    
    
    // 2. This function makes the box grow dynamically as you type
    const handleInput = (e) => {
        const textarea = e.target;
        textarea.style.height = "auto"; // Reset height momentarily
        textarea.style.height = `${textarea.scrollHeight}px`; // Expand to fit new text
    };

    const handleMessageSend = (e)=>{
        if(e){
            e.preventDefault()
        }
        const message = textareaRef.current.value.trim()
        if(!message) return
        textareaRef.current.value = ""
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus()
    }

    const handleKeyDown = (e)=>{
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault()
            handleMessageSend()
        }
    }

    if (isLoading) {
        return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-mut ed">Fetching conversation...</p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4">
            <div className="alert alert-danger text-center w-75" role="alert">
            <h4 className="alert-heading">Oops!</h4>
            <p>{error}</p>
            <hr />
            <button 
                className="btn btn-outline-danger btn-sm" 
                onClick={()=>fetchMessages()}
            >
                Try Again
            </button>
            </div>
        </div>
        );
    }

 
    // 4. Empty Chat State (New User)
    if (chatMessages && chatMessages.length === 0) { 
        return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
            <i className="bi bi-chat-dots fs-1"></i>
            <p className="mt-2">No messages yet. Say hello!</p>
        </div>
        );
    }

    return (
        <div className="d-flex flex-column h-100">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between px-3 pt-1 bg-light sticky-top">
                <div className={"d-flex align-items-center"}>

                    <button 
                    className="btn btn-light border-0 d-md-none me-2 p-1" 
                    onClick={() => dispatch(setSelectedUser(null))}
                >
                    <i className="bi bi-arrow-left fs-5"></i>
                </button>

                {/* Image Section */}
                <div className="position-relative me-3">
                    <img
                        src={
                            selectedUser?.profilePic ?
                            `http://localhost:3000/uploads/${selectedUser.profilePic}` :
                             "/default.webp"
                            }
                        alt="userpic"
                        className="rounded-circle object-fit-cover profilePic"
                        //i need to check whether profile pic is uploaded or not if not then don't show preview
                        onClick={()=>setIsPreviewOpen(true)}
                        onError={(e) => (e.target.src = "/default.webp")}
                    />
                    <span className="position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle"></span>
                </div>

                {/* Name of user */}
                <h6 className="m-0">{selectedUser.name}</h6>
                
                </div>
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
                    <button className="dropdown-item text-danger">
                        <i className="bi bi-trash3 me-2"></i>
                        Delete Chat
                    </button>
                    </li>
                </ul>
                </div>
            </div>

            {/* 2. Chat Messages Area ) */}
            <div className="flex-grow-1 overflow-auto pt-3 bg-white d-flex flex-column gap-4">
                {chatMessages&&(
                    chatMessages.map(message=>(
                            
                        <div key={message._id} className={`d-flex ${message.fromSelf?"justify-content-end pe-2":"justify-content-start ps-2"} mb-3 message-slide`}>
                            <div className={`${message.fromSelf?"chat-send":"chat-recieved"} message`}>
                                {message.message}
                            </div>
                        </div>
                    ))
                )}
                
                <div ref={messageEndRef}></div>
                 
            </div>

            

            {/* 3. Input Area */}
            <div className="p-3 bg-light border-top">
            
                <form className="d-flex align-items-end bg-white border rounded-4 px-3 py-2" onSubmit={handleMessageSend}>
                    
                    <textarea
                    ref={textareaRef}
                    className="form-control border-0 shadow-none bg-transparent p-0 textArea"
                    placeholder="Type a message..."
                    rows={1}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    ></textarea>
                    
                    {/* Send Button */}
                    <button 
                    type="submit" 
                    className="btn btn-link text-success p-0 ms-2 text-decoration-none mb-1"
                    >
                    <i className="bi bi-send-fill fs-5"></i>
                    </button>
                    
                </form>
            </div>

            {/* For preview of user's profile pic */}
            {isPreviewOpen && (
                    <div 
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center dpPreviewContainer"
                        onClick={() => setIsPreviewOpen(false)} // Closes when clicking anywhere
                    >
                        {/* The large preview image */}
                        <img 
                        src="city-night-drive-stockcake.jpg" 
                        alt="dp-large" 
                        className="rounded-circle shadow-lg dpPreview"
                        // Prevent clicking the image from closing the overlay (optional, but good practice)
                        onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
            )}
        </div>

    );
}

export default ChatScreen;
