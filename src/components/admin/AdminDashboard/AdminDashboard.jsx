import { useState } from 'react';
import Button from "../../common/Button/Buton";
import EditCompanyModal from "../modals/EditCompanyModal/EditCompanyModal";
import "./AdminDashboard.css";

const AdminDashboard = ({dynamoData, deleteDynamoData, sendDynamoData, updateDynamoData}) => {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEditClick = (company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCompany(null);
    };

    const handleUpdate = async (id, displayName, categories) => {
        try {
            await updateDynamoData(id, displayName, categories);
            setIsModalOpen(false);
            setSelectedCompany(null);
        } catch (error) {
            console.error('Error updating company:', error);
        }
    };

    return (
        <div className="adminDashboardContainer"> 
          <h1>Admin Dashboard</h1>
          <form>
            <label>Company ID :</label>
            <input type="text" id="fName" placeholder="e.g., escala"></input>
            <label>Display Name :</label>
            <input type="text" id="lName" placeholder="e.g., Escala"></input>
            <button type="button" onClick={()=>sendDynamoData(document.getElementById('fName').value,document.getElementById('lName').value)}>Add Company</button>
          </form>

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
                          <Button text='Remove' backgroundColor='var(--error-color)' onClick={() => deleteDynamoData(company.ID)}></Button>
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

          {isModalOpen && (
            <EditCompanyModal 
              company={selectedCompany} 
              onClose={handleCloseModal}
              onUpdate={handleUpdate}
            />
          )}
        </div>
    )
}

export default AdminDashboard;