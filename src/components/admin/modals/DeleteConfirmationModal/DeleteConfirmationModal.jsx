import { useState } from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ company, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (confirmationText === company.displayName) {
            onConfirm(company.ID);
        } else {
            setError('Please type the exact company name to confirm deletion');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Confirm Deletion</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to delete the company "{company.displayName}"?</p>
                    <p>This action cannot be undone.</p>
                    <div className="confirmation-input">
                        <p>Please type <strong>{company.displayName}</strong> to confirm deletion:</p>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => {
                                setConfirmationText(e.target.value);
                                setError('');
                            }}
                            placeholder="Type company name here"
                        />
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button 
                            type="button" 
                            style={{backgroundColor: 'var(--error-color)'}} 
                            onClick={handleConfirm}
                            disabled={confirmationText !== company.displayName}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 