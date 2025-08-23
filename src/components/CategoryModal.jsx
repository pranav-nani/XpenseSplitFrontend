import React from "react";
import "../styles/CategoryModal.css"; 

const CategoryModal = ({ category, onConfirm, onCancel, onChange }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Suggested Category</h2>
        <p className="modal-text">This expense is categorized as:</p>

        <input
          type="text"
          value={category}
          onChange={(e) => onChange(e.target.value)}
          className="modal-input"
        />

        <div className="modal-buttons">
          <button onClick={onCancel} className="modal-button cancel">
            Cancel
          </button>
          <button onClick={() => onConfirm(category)} className="modal-button confirm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
