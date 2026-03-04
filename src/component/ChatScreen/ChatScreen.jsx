import { useRef,useEffect,useState } from "react";
import "./ChatScreen.css"

function ChatScreen({selectedUser,setSelectedUser}) {
    const textareaRef = useRef(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    useEffect(() => {
      if(textareaRef.current){
        textareaRef.current.focus()
      }
    }, [selectedUser])
    
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
        console.log(message)
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

    return (
        <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-3 pt-1 bg-light sticky-top">
            <div className={"d-flex align-items-center"}>

                <button 
                className="btn btn-light border-0 d-md-none me-2 p-1" 
                onClick={() => setSelectedUser(null)}
            >
                <i className="bi bi-arrow-left fs-5"></i>
            </button>

            {/* Image Section */}
            <div className="position-relative me-3">
                <img
                src="city-night-drive-stockcake.jpg"
                alt="userpic"
                className="rounded-circle object-fit-cover profilePic"
                //i need to check whether profile pic is uploaded or not if not then don't show preview
                onClick={()=>setIsPreviewOpen(true)}
                />
                <span className="position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle"></span>
            </div>

            {/* Name of user */}
            <h6 className="m-0">John Doe</h6>
            
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
            <div className="d-flex justify-content-end pe-2 mb-3 message-slide">
                <div className="message chat-send">
                    Hi Ken
                </div>
            </div>

            <div className="d-flex justify-content-start ps-2 mb-3 message-slide">
                <div className="message chat-recieved">
                    Hi zubair
                </div>
            </div>

            <div className="d-flex justify-content-start ps-2 mb-3 message-slide">
                <div className="message chat-recieved">
                    Hi zubair
                </div>
            </div>

            <div className="d-flex justify-content-end pe-2 mb-3 message-slide">
                <div className="message chat-send">
                    Hi Ken
                </div>
            </div>

            <div className="d-flex justify-content-start ps-2 mb-3 message-slide">
                <div className="message chat-recieved">
                    Hi zubair
                </div>
            </div>

            <div className="d-flex justify-content-start ps-2 mb-3 message-slide">
                <div className="message chat-recieved">
                    Hi zubair
                </div>
            </div>

            <div className="d-flex justify-content-end pe-2 mb-3 message-slide">
                <div className="message chat-send">
                    Hi Ken
                </div>
            </div>  

            <div className="d-flex justify-content-end pe-2 mb-3 message-slide">
                <div className="message chat-send">
                    Hi Ken
                </div>
            </div>

            <div className="d-flex justify-content-end pe-2 mb-3 message-slide">
                <div className="message chat-send">
                    Hi Ken
                </div>
            </div>

            <div className="d-flex justify-content-end pe-2 mb-3 message-slide">
                <div className="message chat-send">
                    Hi Ken
                </div>
            </div>

            <div className="d-flex justify-content-end pe-2 mb-3 message-slide">
                <div className="message chat-send">
                    Hi Ken
                </div>
            </div>
            
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
