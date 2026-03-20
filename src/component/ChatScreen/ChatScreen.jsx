import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {getMessages,sendMessage, deleteMessages } from "../../services/messageService";
import {setMessages,addMessage,removeMessages} from "../../Redux/slices/messageSlice";
import {setSelectedUser, updateChatPreview,removeChat} from "../../Redux/slices/chatSlice";
import { socket } from "../../Sockets/socket";
import { SEND_MESSAGE_EVENT } from "../../constants/socketConstants";
import "./ChatScreen.css";

function ChatScreen({setSearchInput}) {
  const textareaRef = useRef(null);
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const prevMsgCount = useRef(0);
  
  // -------- Use States --------
  
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadScrollCount, setUnreadScrollCount] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNoPicMsg, setShowNoPicMsg] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ------- Use Selectors -------

  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const chatMessages = useSelector((state) => state.message.chatCache[selectedUser?.id]);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const isOnline = onlineUsers.includes(selectedUser.id);
  const dispatch = useDispatch();

  // ------ Use Effects ------

  useEffect(() => {
    if (!selectedUser.id) return; // at initial load when first component renders then it will return

    //   ---- Cache Check ----
    if (chatMessages) return; //cache hit if messages of currently selected user is in cache of redux. No api call return.

    // cache miss in redux if no message exist for selected user means if user is new to chat or deleted earlier
    fetchMessages();
  }, [selectedUser?.id, chatMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading,selectedUser?.id]);

  useEffect(() => {
    const scrollToBottom = () => {
      // Adding a small setTimeout ensures the DOM has actually painted 
      // the new message to the screen before we try to scroll to it!
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    };
    scrollToBottom();
  }, [isLoading, selectedUser?.id]);

  // The SMART Auto-Scroll Logic
  useEffect(() => {
    if (!chatMessages) return;

    const isNewMessageAdded = chatMessages.length > prevMsgCount.current;
    const lastMsg = chatMessages[chatMessages.length - 1];

    if (isNewMessageAdded && lastMsg) {
        setSearchInput("");
        if (lastMsg.fromSelf || isAtBottom) {
            // SCENARIO A: We sent it, or we are already at the bottom. Force scroll!
            setTimeout(() => {
                messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
        } else {
            // SCENARIO B: We are reading old messages! Don't scroll, just increment badge.
            setUnreadScrollCount(prev => prev + 1);
        }
    }

    // Always update our ref so we know for next time
    prevMsgCount.current = chatMessages.length;
  }, [chatMessages, isAtBottom]);

  // 4. Reset states when switching users
  useEffect(() => {
      setUnreadScrollCount(0);
      setIsAtBottom(true);
  }, [selectedUser?.id])


  // ------  Functions -------

 const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMessages(selectedUser?.id);
      dispatch(setMessages({ selectedUserId: selectedUser?.id, response }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  //  Scroll Listener
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    
    // If we are within 100px of the bottom, we consider it "at the bottom"
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isBottom);

    // If the user manually scrolls back to the bottom, clear the local badge!
    if (isBottom) setUnreadScrollCount(0);
  };

  //This function makes the box grow dynamically as you type
  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto"; // Reset height momentarily
    textarea.style.height = `${textarea.scrollHeight}px`; // Expand to fit new text
  };

  const handleMessageSend = async (e) => {
    if (e) {
      e.preventDefault();
    }
    const text = textareaRef.current.value.trim();
    if (!text) return;
    textareaRef.current.value = "";
    textareaRef.current.style.height = "auto";
    textareaRef.current.focus();

    try {
      const response = await sendMessage({ to: selectedUser.id, text });
      socket.emit(SEND_MESSAGE_EVENT, {
        _id: response.message._id,
        to: selectedUser.id,
        text,
        time: response.message.createdAt,
      });

      dispatch(
        addMessage({
          chatId: selectedUser.id,
          message: {
            _id: response.message._id,
            fromSelf: true,
            message: text,
            time: response.message.createdAt,
          },
        }),
      );
      dispatch(
        updateChatPreview({
          chatId: selectedUser.id,
          lastMessage: text,
          lastMessageTime: response.message.createdAt,
          ...(chatMessages && chatMessages.length === 0 && { 
              name: selectedUser.name, 
              profilePic: selectedUser.profilePic 
          })
        }),
      );

      setSearchInput("")
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend();
    }
  };

  // for formatting date to show on messages
  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // to delete all messages of current user with selected user
  const handleDeleteChat = async () => {
    setShowDeleteModal(true);
  };

  const executeDeleteChat = async () => {
    setShowDeleteModal(false);
    try {
      setIsDeleting(true);
      await deleteMessages(selectedUser.id);
      dispatch(removeMessages(selectedUser.id));
      dispatch(removeChat(selectedUser.id));
    } catch (error) {
      console.error("Failed to delete chat", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
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
            onClick={() => fetchMessages()}
          >
            Try Again
          </button>
        </div>
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
                selectedUser?.profilePic
                  ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profilePics/${selectedUser.profilePic}`
                  : "/default.webp"
              }
              alt="userpic"
              className="rounded-circle object-fit-cover profilePic"
              style={{cursor: selectedUser?.profilePic ? "pointer" : "default"}}
              //i need to check whether profile pic is uploaded or not if not then don't show preview
              onClick={() => {
                if (selectedUser?.profilePic) {
                  setIsPreviewOpen(true);
                } else {
                  // Show the tiny span, then hide it after 2 seconds!
                  setShowNoPicMsg(true);
                  setTimeout(() => setShowNoPicMsg(false), 2000);
                }
              }}
              onError={(e) => (e.target.src = "/default.webp")}
            />
            {isOnline && (
              <span className="position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle"></span>
            )}

            {showNoPicMsg && (
                <span 
                    className="position-absolute bg-dark text-white rounded shadow-sm px-2 py-1 profilePicErr"
                >
                    No profile photo
                </span>
            )}
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
              <button
                className="dropdown-item text-danger"
                onClick={handleDeleteChat}
                disabled={isDeleting}
              >
                <i className="bi bi-trash3 me-2"></i>
                {isDeleting ? "Deleting..." : "Delete Chat"}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. Chat Messages Area ) */}
      <div className="flex-grow-1 position-relative d-flex flex-column overflow-hidden bg-white">
        
        <div ref={chatContainerRef} 
          onScroll={handleScroll}
          className="flex-grow-1 overflow-auto pt-3 px-3 bg-white d-flex flex-column gap-4">

          <div className="flex-grow-1"></div>
          
          {chatMessages &&
            chatMessages.map((message) => {
              const displayTime = formatTime(message.time);
              return (
                <div
                  key={message._id}
                  
                  className={`d-flex ${message.fromSelf ? "justify-content-end pe-5" : "justify-content-start ps-2"} mb-3 message-slide`}
                >
                  <div
                    className={`${message.fromSelf ? "chat-send" : "chat-recieved"} message d-flex flex-column px-3 py-2`}
                  >
                    <span className="text-break">{message.message}</span>
                    <span className="align-self-end text-muted mt-1 messageDate">
                      {displayTime}
                    </span>
                  </div>
                </div>
              );
            })}

          <div ref={messageEndRef}></div>
        
        </div>

        {!isAtBottom && (
              <button 
                  onClick={() => {
                      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
                      setUnreadScrollCount(0);
                  }}
                  className="btn btn-light rounded-circle shadow position-absolute d-flex justify-content-center align-items-center scrollBtn"
              >
                  <i className="bi bi-chevron-down fs-5 text-muted"></i>
                  
                  {/* The little green badge on the button */}
                  {unreadScrollCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success countBadge">
                          {unreadScrollCount}
                      </span>
                  )}
              </button>
        )}
      </div>

      {/* 3. Input Area */}
      <div className="p-3 bg-light border-top">
        <form
          className="d-flex align-items-end bg-white border rounded-4 px-3 py-2"
          onSubmit={handleMessageSend}
        >
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
            src={`${import.meta.env.VITE_BACKEND_URL}/uploads/profilePics/${selectedUser.profilePic}`}
            alt="dp-large"
            className="rounded-circle shadow-lg dpPreview"
            // Prevent clicking the image from closing the overlay (optional, but good practice)
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Custom Delete Chat Modal */}
      {showDeleteModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="bg-white rounded-3 shadow p-4 text-center deleteModal">
            <div className="text-danger mb-3">
              <i className="bi bi-exclamation-triangle fs-1"></i>
            </div>
            <h5 className="mb-2">Delete Chat?</h5>
            <p className="text-muted mb-4">Are you sure you want to delete this entire conversation? This cannot be undone.</p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-light px-4" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger px-4" onClick={executeDeleteChat}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ChatScreen;
