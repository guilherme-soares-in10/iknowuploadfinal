import { useState, useEffect } from 'react';
import { CognitoIdentityProviderClient, ListUsersCommand, AdminCreateUserCommand, AdminAddUserToGroupCommand, AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { fetchAuthSession } from 'aws-amplify/auth';
import './EditCompanyModal.css';
import Button from '../../../common/Button/Button';
import '../../../common/Button/Button.css';

const EditCompanyModal = ({ company, onClose, onUpdate }) => {
    const [displayName, setDisplayName] = useState(company.displayName);
    const [categories, setCategories] = useState(company.categories || []);
    const [newCategory, setNewCategory] = useState({ text: '', category: '' });
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'users'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    // Initialize Cognito client with credentials
    const getCognitoClient = async () => {
        const { credentials } = await fetchAuthSession();
        return new CognitoIdentityProviderClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken
            }
        });
    };

    // Fetch users when the users tab is active
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const cognitoClient = await getCognitoClient();
            
            // List all users and filter on client side
            const command = new ListUsersCommand({
                UserPoolId: 'us-east-1_ajpjAeVga',
                Limit: 60
            });

            console.log('Fetching users...');
            const response = await cognitoClient.send(command);
            console.log('Cognito response:', response);
            
            if (response.Users) {
                console.log('Current company object:', company);
                console.log('Company ID:', company.ID);
                // Filter users on the client side
                const filteredUsers = response.Users.filter(user => {
                    const companyIdAttr = user.Attributes?.find(attr => attr.Name === 'custom:companyID');
                    console.log('User:', user.Username, 'Attributes:', user.Attributes);
                    console.log('Company ID attribute:', companyIdAttr);
                    console.log('Comparing:', companyIdAttr?.Value, 'with', company.ID);
                    return companyIdAttr?.Value === company.ID;
                });
                console.log('Filtered users:', filteredUsers);
                setUsers(filteredUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Falha ao buscar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.username)) {
            alert('Por favor, insira um endereço de e-mail válido');
            return;
        }

        try {
            setLoading(true);
            const cognitoClient = await getCognitoClient();

            // Create the user
            const createUserCommand = new AdminCreateUserCommand({
                UserPoolId: 'us-east-1_ajpjAeVga',
                Username: newUser.username,
                UserAttributes: [
                    {
                        Name: 'email',
                        Value: newUser.username
                    },
                    {
                        Name: 'custom:companyID',
                        Value: company.ID
                    }
                ]
            });

            try {
                const createUserResponse = await cognitoClient.send(createUserCommand);
                console.log('User created:', createUserResponse);

                // Add user to company group
                const addToGroupCommand = new AdminAddUserToGroupCommand({
                    UserPoolId: 'us-east-1_ajpjAeVga',
                    Username: newUser.username,
                    GroupName: 'company'
                });

                await cognitoClient.send(addToGroupCommand);
                console.log('User added to company group');

                // Refresh users list
                await fetchUsers();

                // Reset form
                setNewUser({
                    username: '',
                    password: '',
                    confirmPassword: ''
                });

                alert('Usuário criado com sucesso');
            } catch (error) {
                if (error.name === 'UsernameExistsException') {
                    alert('Este e-mail já está em uso. Por favor, use outro endereço de e-mail.');
                } else {
                    throw error; // Re-throw other errors to be caught by the outer catch
                }
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Falha ao criar usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Check if display name is empty or contains only spaces
            if (displayName.trim() === '') {
                alert('Nome da empresa não pode ser vazio');
                return;
            }
            if (displayName.length > 30) {
                alert('Nome da empresa deve ser menor que 30 caracteres');
                return;
            }
            if (!/^[a-zA-Z0-9\sáàâãéèêíïóôõöúüçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇ]+$/.test(displayName)) {
                alert('Nome da empresa deve conter apenas letras, números e espaços');
                return;
            }
            if (displayName.startsWith(' ') || displayName.endsWith(' ')) {
                alert('Nome da empresa não pode começar ou terminar com espaço');
                return;
            }


            console.log('Submitting with categories:', categories);
            await onUpdate(company.ID, displayName, categories);
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Falha ao atualizar a empresa. Por favor, tente novamente.');
        }
    };

    const formatCategoryId = (category) => {
        // Remove accents and special characters, convert to lowercase, and replace spaces with hyphens
        return category
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove any remaining special characters
            .toLowerCase()
            .replace(/\s+/g, '-');
    };

    const handleAddCategory = () => {
        // Check if field is empty or contains only spaces
        if (!newCategory.text.trim()) {
            alert('Categoria de Arquivo não pode ser vazia');
            return;
        }

        // Check if the length of category text exceeds 30 characters
        if (newCategory.text.length > 30) {
            alert('Categoria de Arquivo deve ser menor que 30 caracteres');
            return;
        }
        
        if (!/^[a-zA-Z0-9\sáàâãéèêíïóôõöúüçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇ]+$/.test(newCategory.text)) {
            alert('Categoria de Arquivo deve conter apenas letras, números e espaços');
            return;
        }

        if (newCategory.text.startsWith(' ') || newCategory.text.endsWith(' ')) {
            alert('Categoria de Arquivo não pode começar ou terminar com espaço');
            return;
        }

        if (newCategory.text) {
            const formattedCategory = {
                text: newCategory.text,
                category: formatCategoryId(newCategory.text)
            };
            setCategories([...categories, formattedCategory]);
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

    const handleRemoveUser = async (username) => {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) {
            return;
        }

        try {
            setLoading(true);
            const cognitoClient = await getCognitoClient();

            const deleteUserCommand = new AdminDeleteUserCommand({
                UserPoolId: 'us-east-1_ajpjAeVga',
                Username: username
            });

            await cognitoClient.send(deleteUserCommand);
            console.log('User deleted successfully');

            // Refresh users list
            await fetchUsers();
            alert('Usuário excluído com sucesso');
        } catch (error) {
            console.error('Error removing user:', error);
            alert('Falha ao excluir usuário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Editar Empresa</h2>
                    </div>
                    <img className='closeButton' src="images/deleteIcon.svg" alt="Close" onClick={onClose}></img>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group-container">
                            <div className="form-group">
                                <label htmlFor="companyId">ID da Empresa</label>
                                <input
                                    type="text"
                                    id="companyId"
                                    value={company.ID}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayName">Nome da Empresa</label>
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
                            <div className="tab-buttons">
                                <button 
                                    type="button"
                                    className={activeTab === 'categories' ? 'active' : ''}
                                    onClick={() => setActiveTab('categories')}
                                >
                                    Categorias
                                </button>
                                <button 
                                    type="button"
                                    className={activeTab === 'users' ? 'active' : ''}
                                    onClick={() => setActiveTab('users')}
                                >
                                    Usuários
                                </button>
                            </div>
                            
                            {activeTab === 'categories' ? (
                                <>
                                    <div className="add-category-form">
                                        <input
                                            type="text"
                                            placeholder="Categoria de Arquivo"
                                            value={newCategory.text}
                                            onChange={(e) => setNewCategory({ ...newCategory, text: e.target.value })}
                                        />
                                        <button type="button" onClick={handleAddCategory}>Adicionar Categoria</button>
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
                                                    text="Excluir" 
                                                    onClick={(e) => handleRemoveClick(e, index)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="users-list">
                                    <div className="add-user-form">
                                        <input
                                            type="email"
                                            placeholder="E-mail do Usuário"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        />
                                        <button onClick={handleAddUser}>Adicionar Usuário</button>
                                    </div>
                                    {loading ? (
                                        <p>Carregando usuários...</p>
                                    ) : users.length > 0 ? (
                                        <div className="users-grid">
                                            {users.map((user) => (
                                                <div key={user.Username} className="user-item">
                                                    <div className="user-item-content">
                                                        <span>{user.Username}</span>
                                                    </div>
                                                    <Button 
                                                        className='cancelButton'
                                                        text="Excluir" 
                                                        onClick={() => handleRemoveUser(user.Username)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Nenhum usuário encontrado para esta empresa</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-buttons">
                            <button type="button" className='cancelButton' onClick={onClose}>Cancelar</button>
                            <button type="submit">Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCompanyModal; 