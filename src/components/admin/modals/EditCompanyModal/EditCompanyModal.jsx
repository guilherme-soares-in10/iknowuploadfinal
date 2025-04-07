import { useState } from 'react';
import './EditCompanyModal.css';
import Button from '../../../common/Button/Button';
import '../../../common/Button/Button.css';

const EditCompanyModal = ({ company, onClose, onUpdate }) => {
    const [displayName, setDisplayName] = useState(company.displayName);
    const [categories, setCategories] = useState(company.categories || []);
    const [newCategory, setNewCategory] = useState({ text: '', category: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Submitting with categories:', categories);
            await onUpdate(company.ID, displayName, categories);
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Failed to update company. Please try again.');
        }
    };

    const handleAddCategory = () => {
        if (newCategory.text && newCategory.category) {
            setCategories([...categories, newCategory]);
            setNewCategory({ text: '', category: '' });
        }
    };

    const handleRemoveCategory = (index) => {
        const updatedCategories = categories.filter((_, i) => i !== index);
        setCategories(updatedCategories);
    };

    const handleRemoveClick = (e, index) => {
        e.stopPropagation(); // Prevent event bubbling
        handleRemoveCategory(index);
    };

    return (
        <div className="modal-overlay"> 
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Edit Company</h2>
                    </div>
                    <img className='closeButton' src="public/images/deleteIcon.svg" alt="Close" onClick={onClose}></img>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                       <div className="form-group-container">
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
                        </div>
                        <div className="form-group">
                            <h3>Categories</h3>
                            <div className="add-category-form">
                                <input
                                    type="text"
                                    placeholder="Category Text"
                                    value={newCategory.text}
                                    onChange={(e) => setNewCategory({ ...newCategory, text: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Category ID"
                                    value={newCategory.category}
                                    onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                                />
                                <button type="button" onClick={handleAddCategory}>Add Category</button>
                            </div>
                            <div className="categories-list">
                                {categories.map((category, index) => (
                                    <div key={index} className="category-item">
                                        <div className="category-item-content">
                                            <span>{category.text}</span>
                                            <span className="category-id">({category.category})</span>
                                        </div>
                                        <Button 
                                            className='cancelButton'
                                            text="Remove" 
                                            onClick={(e) => handleRemoveClick(e, index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button type="button" className='cancelButton' onClick={onClose}>Cancel</button>
                            <button type="submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCompanyModal; 