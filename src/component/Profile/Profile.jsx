import { useRef, useState } from "react";
import "./Profile.css"
import { useDispatch, useSelector } from "react-redux";
import { setProfilePic } from "../../Redux/slices/authSlice";
import { uploadProfilePic } from "../../services/userService";

function Profile({ onClose }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file); // "profilePic" must match your backend Multer field name!

    try {
      setIsUploading(true);
      const response = await uploadProfilePic(formData);
      
      // Update Redux so the image instantly changes everywhere in the app!
      dispatch(setProfilePic(response.profilePic)); 
    } catch (err) {
      console.error("Failed to upload image", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-light">
      {/* WhatsApp-style Header */}
      <div className="d-flex align-items-center p-3 text-white headerSection">
        <button className="btn btn-link text-white p-0 border-0 me-4 mt-auto" onClick={onClose}>
          <i className="bi bi-arrow-left fs-4"></i>
        </button>
        <h5 className="m-0 mt-auto pb-1">Profile</h5>
      </div>

      {/* Profile Picture Section */}
      <div className="d-flex justify-content-center py-5 bg-light">
        <div className="position-relative profilePicContainer" onClick={() => fileInputRef.current.click()}>
          
          <img
            src={user?.profilePic ? `http://localhost:3000/uploads/${user.profilePic}` : "/default.webp"}
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
      <div className="bg-white p-3 shadow-sm mb-2">
        <small className="text-success nameText">Your name</small>
        <div className="d-flex justify-content-between align-items-center mt-2">
            <h5 className="m-0">{user?.name}</h5>
            <i className="bi bi-pencil text-muted cursor-pointer"></i>
        </div>
        <small className="text-muted mt-2 d-block">
          This is not your username or pin. This name will be visible to others.
        </small>
      </div>

    </div>
  );
}

export default Profile;