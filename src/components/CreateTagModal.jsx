import React, { useState } from 'react';
import './CreateTagModal.css';

export const TAG_COLORS = [
  '#5B5417',
  '#20648F',
  '#1A4C3F',
  '#3F4784',
  '#9D431C',
  '#8E2526',
  '#6D426E',
];

const CreateTagModal = ({ isOpen, onClose, onSave }) => {
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    if (onSave) {
      onSave({
        name: tagName.trim(),
        color: selectedColor,
      });
    }
    setTagName('');
    setSelectedColor(TAG_COLORS[0]);
    onClose();
  };

  const isSaveDisabled = !tagName.trim();

  return (
    <div className="create-tag-modal-overlay" onClick={onClose}>
      <div className="create-tag-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="create-tag-header">
          <h2 className="create-tag-title">Create Tag</h2>
          <button
            type="button"
            className="create-tag-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          {/* Tag Name Input */}
          <div className="create-tag-field">
            <label className="create-tag-label" htmlFor="create-tag-input">
              Tag Name
            </label>
            <input
              id="create-tag-input"
              type="text"
              className="create-tag-input"
              placeholder="Enter Tag Name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div className="create-tag-field">
            <label className="create-tag-label">
              Color
            </label>
            <div className="create-tag-colors-row">
              {TAG_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    className={`create-tag-color-swatch ${isSelected ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Color ${color}`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="create-tag-actions">
            <button
              type="button"
              className="create-tag-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`create-tag-btn-save ${isSaveDisabled ? 'disabled' : ''}`}
              disabled={isSaveDisabled}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTagModal;
