import { useState } from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ company, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (confirmationText === company.displayName) {
            onConfirm(company.ID);
            alert('Empresa excluída com sucesso');
        } else {
            setError('Por favor, digite o nome exato da empresa para confirmar a exclusão');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Confirmar Exclusão</h2>
                    </div>
                    <img className='closeButton' src="images/deleteIcon.svg" alt="Close" onClick={onClose}></img>
                </div>
                <div className="modal-body">
                    <p>Tem certeza que deseja excluir a empresa "{company.displayName}"?</p>
                    <p>Esta ação não pode ser revertida.</p>
                    <div className="confirmation-input">
                        <p>Por favor, digite <strong>{company.displayName}</strong> para confirmar a exclusão:</p>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => {
                                setConfirmationText(e.target.value);
                                setError('');
                            }}
                            placeholder="Digite o nome da empresa aqui"
                        />
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    <div className="modal-buttons">
                        <button type="button" onClick={onClose}>Cancelar</button>
                        <button 
                            type="button" 
                            style={{backgroundColor: 'var(--error-color)'}} 
                            onClick={handleConfirm}
                            disabled={confirmationText !== company.displayName}
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 