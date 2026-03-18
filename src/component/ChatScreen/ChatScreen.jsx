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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const chatMessages = useSelector(
    (state) => state.message.chatCache[selectedUser?.id],
  );
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const isOnline = onlineUsers.includes(selectedUser.id);
  const dispatch = useDispatch();

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
  }, [isLoading]);

  useEffect(() => {
    const scrollToBottom = () => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [isLoading]);

  // 2. This function makes the box grow dynamically as you type
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
    // Built-in browser confirmation box
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entire conversation? This cannot be undone.",
    );

    if (!confirmDelete) return;
    console.log(selectedUser.id)
    try {
      setIsDeleting(true);

      // 1. Wipe the database
      await deleteMessages(selectedUser.id)

      dispatch(removeMessages(selectedUser.id))
      // 2. Instantly update Redux (removes sidebar item & closes chat screen)
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
                  ? `http://localhost:3000/uploads/profilePics/${selectedUser.profilePic}`
                  : "/default.webp"
              }
              alt="userpic"
              className="rounded-circle object-fit-cover profilePic"
              //i need to check whether profile pic is uploaded or not if not then don't show preview
              onClick={() => setIsPreviewOpen(true)}
              onError={(e) => (e.target.src = "/default.webp")}
            />
            {isOnline && (
              <span className="position-absolute bottom-0 end-0 p-2 bg-secondary bg-success border border-2 border-white rounded-circle"></span>
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
      <div className="flex-grow-1 overflow-auto pt-3 bg-white d-flex flex-column gap-4">
        {chatMessages &&
          chatMessages.map((message) => {
            const displayTime = formatTime(message.time);
            return (
              <div
                key={message._id}
                className={`d-flex ${message.fromSelf ? "justify-content-end pe-2" : "justify-content-start ps-2"} mb-3 message-slide`}
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
            src={`http://localhost:3000/uploads/profilePics/${selectedUser.profilePic}`}
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
