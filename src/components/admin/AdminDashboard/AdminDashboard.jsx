import { useState } from 'react';
import Button from "../../common/Button/Button";
import EditCompanyModal from "../modals/EditCompanyModal/EditCompanyModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal/DeleteConfirmationModal";
import "./AdminDashboard.css";

const AdminDashboard = ({dynamoData, deleteDynamoData, sendDynamoData, updateDynamoData}) => {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newCompany, setNewCompany] = useState({ id: '', displayName: '' });

    const handleEditClick = (company) => {
        setSelectedCompany(company);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (company) => {
        setSelectedCompany(company);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedCompany(null);
    };

    const handleUpdate = async (id, displayName, categories) => {
        try {
            await updateDynamoData(id, displayName, categories);
            setIsEditModalOpen(false);
            setSelectedCompany(null);
        } catch (error) {
            console.error('Error updating company:', error);
        }
    };

    const handleDeleteConfirm = async (id) => {
        try {
            await deleteDynamoData(id);
            setIsDeleteModalOpen(false);
            setSelectedCompany(null);
        } catch (error) {
            console.error('Error deleting company:', error);
        }
    };

    const handleAddCompany = () => {
      // Check if either field is empty or contains only spaces
      if (!newCompany.id.trim() || !newCompany.displayName.trim()) {
          alert('Please fill in both Company ID and Display Name');
          return;
      }
    
      // Alphanumeric with hyphen, lowercase only regex (letters, numbers, hyphen)
      const alphanumericWithHyphenLowercaseRegex = /^[a-z0-9-]+$/;
  
      // Check if the id contain only lowercase alphanumeric characters or hyphens
      if (!alphanumericWithHyphenLowercaseRegex.test(newCompany.id)) {
        alert('Company ID must only contain lowercase alphanumeric characters or hyphens.');
        return;
    }

    // Check if the length of company ID or display name exceeds 30 characters
    if (newCompany.id.length > 30 || newCompany.displayName.length > 30) {
      alert('Company ID and Display Name must be 30 characters or fewer.');
      return;
  }

      // If validation passes, send the data with lowercase inputs
      sendDynamoData(newCompany.id, newCompany.displayName);
      
      // Reset the inputs
      setNewCompany({ id: '', displayName: '' });
  };

    return (
        <div className="adminDashboardContainer"> 
          <h1>Admin Dashboard</h1>
          <div className="add-company-form">
            <input
                type="text"
                placeholder="Display Name"
                value={newCompany.displayName}
                onChange={(e) => setNewCompany({ ...newCompany, displayName: e.target.value })}
                required
            />
            <input
                type="text"
                placeholder="Company ID"
                value={newCompany.id}
                onChange={(e) => setNewCompany({ ...newCompany, id: e.target.value })}
                required
            />
            <button onClick={handleAddCompany}>Add Company</button>
          </div>

          <h2>Companies</h2>
          <div className="company-management-container">
            <div className="dynamodb-data">
              <div className="data-container">
                {dynamoData.length > 0 ? (
                  dynamoData.map((company, index) => (
                    <div key={index} className="data-item">
                      <div className='data-item-container'>
                        <h3>{company.displayName}</h3>
                        <div className="button-container">
                          <Button className='cancelButton'   text='Remove' onClick={() => handleDeleteClick(company)}></Button>
                          <Button text='Edit' onClick={() => handleEditClick(company)}></Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No data loaded yet</p>
                )}
              </div>
            </div>
          </div>

          {isEditModalOpen && (
            <EditCompanyModal 
              company={selectedCompany} 
              onClose={handleCloseModal}
              onUpdate={handleUpdate}
            />
          )}

          {isDeleteModalOpen && (
            <DeleteConfirmationModal
              company={selectedCompany}
              onClose={handleCloseModal}
              onConfirm={handleDeleteConfirm}
            />
          )}
        </div>
    )
}

export default AdminDashboard;