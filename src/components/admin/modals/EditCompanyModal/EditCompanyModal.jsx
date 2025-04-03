import { useState } from 'react';
import './EditCompanyModal.css';

const EditCompanyModal = ({ company, onClose, onUpdate }) => {
    const [displayName, setDisplayName] = useState(company.displayName);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onUpdate(company.ID, displayName);
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Failed to update company. Please try again.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Edit Company</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="companyId">Company ID</label>
                            <input
                                type="text"
                                id="companyId"
                                value={company.ID}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="modal-buttons">
                            <button type="button" style={{backgroundColor: 'var(--error-color)'}} onClick={onClose}>Cancel</button>
                            <button type="submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCompanyModal; 