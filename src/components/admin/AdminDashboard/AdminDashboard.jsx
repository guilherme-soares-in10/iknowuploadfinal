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
    const [loading, setLoading] = useState(false);

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

    const generateCompanyId = (displayName) => {
        // Remove accents and special characters, convert to lowercase, and replace spaces with hyphens
        return displayName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove any remaining special characters
            .toLowerCase()
            .replace(/\s+/g, '-');
    };

    const handleAddCompany = async (e) => {
        e.preventDefault();
        if (newCompany.displayName.trim() === '') {
            alert('Nome da empresa não pode ser vazio');
            return;
        }
        if (newCompany.displayName.length > 30) {
            alert('Nome da empresa deve ser menor que 30 caracteres');
            return;
        }
        if (!/^[a-zA-Z0-9\sáàâãéèêíïóôõöúüçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇ]+$/.test(newCompany.displayName)) {
            alert('Nome da empresa deve conter apenas letras, números e espaços');
            return;
        }
        if (newCompany.displayName.startsWith(' ') || newCompany.displayName.endsWith(' ')) {
            alert('Nome da empresa não pode começar ou terminar com espaço');
            return;
        }
        try {
            setLoading(true);
            const companyId = generateCompanyId(newCompany.displayName);
            await updateDynamoData(companyId, newCompany.displayName, []);
            setNewCompany({ displayName: '' });
            alert('Empresa adicionada com sucesso');
        } catch (error) {
            console.error('Error adding company:', error);
            alert('Falha ao adicionar empresa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="adminDashboardContainer"> 
          <h1>Painel de Controle</h1>
          <div className="add-company-form">
            <input
                type="text"
                placeholder="Nome da Empresa"
                value={newCompany.displayName}
                onChange={(e) => setNewCompany({ ...newCompany, displayName: e.target.value })}
            />
            <Button text="Adicionar Empresa" onClick={handleAddCompany} />
          </div>

          <h2>Empresas</h2>
          <div className="company-management-container">
            <div className="dynamodb-data">
              <div className="data-container">
                {dynamoData.length > 0 ? (
                  dynamoData.map((company, index) => (
                    <div key={index} className="data-item">
                      <div className='data-item-container'>
                        <h3>{company.displayName}</h3>
                        <div className="button-container">
                          <Button className='cancelButton'   text='Excluir' onClick={() => handleDeleteClick(company)}></Button>
                          <Button text='Editar' onClick={() => handleEditClick(company)}></Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum dado carregado ainda</p>
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