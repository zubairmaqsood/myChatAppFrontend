import { useRef, useState } from "react";
import "./Profile.css"
import { useDispatch, useSelector } from "react-redux";
import { setProfilePic,setUser } from "../../Redux/slices/authSlice";
import { uploadProfilePic,removeProfilePicApi } from "../../services/userService";
import { UPDATE_PROFILE } from "../../constants/socketConstants";
import { socket } from "../../Sockets/socket";

function Profile({ onClose }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ show: false, type: "alert", message: "", action: null });

  const closeModal = () => setModalConfig({ show: false, type: "alert", message: "", action: null });
  const showAlert = (message) => setModalConfig({ show: true, type: "alert", message, action: null });
  const showConfirm = (message, action) => setModalConfig({ show: true, type: "confirm", message, action });

  // for editing name
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");

  const [showPassword, setShowPassword] = useState(false);

  // for editing password
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");


  const handleTextUpdate = async (type) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      
      if (type === "name") {
          if (!nameInput.trim() || nameInput === user.name) return setIsEditingName(false);
          formData.append("name", nameInput);
      }
      if (type === "password") {
          if (!passwordInput.trim()) return setIsEditingPassword(false);
          formData.append("password", passwordInput);
      }

      // We reuse the exact same API because your backend handles both!
      const response = await uploadProfilePic(formData);
      
      // Update our local Redux state
      dispatch(setUser(response.user)); 
      
      // TELL THE SERVER WE UPDATED SO EVERYONE ELSE SEES IT!
      socket.emit(UPDATE_PROFILE, response.user);  

      // Close the inputs
      setShowPassword(false);
      setIsEditingName(false);
      setIsEditingPassword(false);
      setPasswordInput(""); 
      
    } catch (err) {
      console.error(`Failed to update ${type}`, err);
      alert(`Failed to update ${type}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  // to handle changing of profile pic
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file); // "profilePic" must match your backend Multer field name!

    try {
      setIsUploading(true);
      const response = await uploadProfilePic(formData);
      
      // Update Redux so the image instantly changes everywhere in the app!
      dispatch(setProfilePic(response.user.profilePic)); 
      socket.emit(UPDATE_PROFILE, response.user);
    } catch (err) {
      console.error("Failed to upload image", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // to handle deletion of profile pic
  const handleRemoveImage = async (e) => {
    e.stopPropagation(); // CRITICAL: Stops the file uploader from opening when you click trash!
    
    showConfirm("Are you sure you want to remove your profile photo?", executeRemoveImage);
  };

  const executeRemoveImage = async () => {
    closeModal();
    try {
      setIsUploading(true);
      const response = await removeProfilePicApi();
      dispatch(setProfilePic(null)); 
      socket.emit(UPDATE_PROFILE, response.user);
    } catch (err) {
      console.error("Failed to remove image", err);
      showAlert("Failed to remove image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-light overflow-y-auto">
      {/* WhatsApp-style Header */}
      <div className="d-flex align-items-center p-3 text-white headerSection">
        <button className="btn btn-link text-white p-0 border-0 me-4 mt-auto" onClick={onClose}>
          <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <h5 className="m-0 mt-auto pb-1">Profile</h5>
      </div>

      {/* Profile Picture Section */}
      <div className="d-flex justify-content-center py-5 bg-light">
        <div className="position-relative profilePicContainer mb-3" onClick={() => fileInputRef.current.click()}>
          
          <img
            src={user?.profilePic ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profilePics/${user.profilePic}` : "/default.webp"}
            alt="profile"
            className={`rounded-circle object-fit-cover w-100 h-100 shadow ${isUploading ? "opacity-50" : ""}`}
            onError={(e) => (e.target.src = "/default.webp")}
          />

          {/* Hover / Camera Icon Overlay */}
          <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex flex-column justify-content-center align-items-center text-white imgIconContainer"
               onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
               onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
          >
            <i className="bi bi-camera-fill fs-2 mb-2"></i>
            <span className="text-center px-3 iconText">Change Profile Photo</span>
          </div>

          {/*TRASH BUTTON! (Only shows if user have a picture) */}
          {user?.profilePic && (
             <button 
                 className="btn btn-danger position-absolute rounded-circle shadow d-flex justify-content-center align-items-center removePicBtn"
                 onClick={handleRemoveImage}
                 title="Remove Photo"
             >
                 <i className="bi bi-trash-fill fs-5"></i>
             </button>
          )}

          {/* Loading Spinner overlay */}
          {isUploading && (
             <div className="position-absolute top-50 start-50 translate-middle">
                 <div className="spinner-border text-primary" role="status"></div>
             </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="d-none"
            onChange={handleImageChange}
          />
        </div>
      </div>

     {/* Name Section */}
      <div className="bg-white p-3 shadow-sm mb-3">
        <small className="text-success nameText">Your name</small>
        
        {isEditingName ? (
            <div className="d-flex align-items-center mt-2 border-bottom border-success pb-1">
                <input 
                    type="text" 
                    className="form-control border-0 shadow-none px-0" 
                    value={nameInput} 
                    onChange={(e) => setNameInput(e.target.value)}
                    autoFocus
                />
                <i className="bi bi-x fs-4 text-muted ms-2 cursor-pointer" onClick={() => { setIsEditingName(false); setNameInput(user.name); }}></i>
                <i className="bi bi-check2 fs-4 text-success ms-3 cursor-pointer" onClick={() => handleTextUpdate("name")}></i>
            </div>
        ) : (
            <div className="d-flex justify-content-between align-items-center mt-2">
                <h5 className="m-0">{user?.name}</h5>
                <i className="bi bi-pencil fs-5 text-muted cursor-pointer" onClick={() => setIsEditingName(true)}></i>
            </div>
        )}
        <small className="text-muted mt-2 d-block">
          This is not your username or pin. This name will be visible to Others.
        </small>
      </div>

      {/* Password Section */}
      <div className="bg-white p-3 shadow-sm mb-2">
        <small className="text-success nameText" style={{ fontWeight: "bold" }}>Security</small>
        
        {isEditingPassword ? (
            <div className="d-flex align-items-center mt-2 border-bottom border-success pb-1">
                <input 
                    type={showPassword ? "text" : "password"}
                    className="form-control border-0 shadow-none px-0" 
                    placeholder="Enter new password"
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)}
                    autoFocus
                />
                <i 
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} fs-5 text-muted ms-2 cursor-pointer`} 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                ></i>
                <i className="bi bi-x fs-4 text-muted ms-2 cursor-pointer" onClick={() => { setIsEditingPassword(false); setPasswordInput(""); }}></i>
                <i className="bi bi-check2 fs-4 text-success ms-3 cursor-pointer" onClick={() => handleTextUpdate("password")}></i>
            </div>
        ) : (
            <div className="d-flex justify-content-between align-items-center mt-2">
                <h6 className="m-0 text-muted">Change Password</h6>
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => setIsEditingPassword(true)}>
                    Update
                </button>
            </div>
        )}
      </div>

      {/* Custom Bootstrap Modal Overlay */}
      {modalConfig.show && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="bg-white rounded-3 shadow p-4 confirmModal">
            <h6 className="mb-3">{modalConfig.type === "confirm" ? "Confirm Action" : "Notice"}</h6>
            <p className="text-muted mb-4">{modalConfig.message}</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light" onClick={closeModal}>
                {modalConfig.type === "confirm" ? "Cancel" : "OK"}
              </button>
              {modalConfig.type === "confirm" && (
                <button className="btn btn-danger" onClick={modalConfig.action}>
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;