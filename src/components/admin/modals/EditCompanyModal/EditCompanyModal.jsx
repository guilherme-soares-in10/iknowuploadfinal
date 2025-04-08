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
                UserPoolId: 'us-east-1_8O2O3UkkF',
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
            alert('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        
        // Basic password confirmation validation
        if (newUser.password !== newUser.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Username and Password validation
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(newUser.username)) {
            alert('Username must contain only letters and numbers');
            return;
        }

        if (newUser.username.length > 30) {
            alert('Username must be 30 characters or fewer');
            return;
        }

        if (!alphanumericRegex.test(newUser.password)) {
            alert('Password must contain only letters and numbers');
            return;
        }

        if (newUser.password.length > 30) {
            alert('Password must be 30 characters or fewer');
            return;
        }

        try {
            setLoading(true);
            const cognitoClient = await getCognitoClient();

            // Create the user
            const createUserCommand = new AdminCreateUserCommand({
                UserPoolId: 'us-east-1_8O2O3UkkF',
                Username: newUser.username,
                TemporaryPassword: newUser.password,
                UserAttributes: [
                    {
                        Name: 'custom:companyID',
                        Value: company.ID
                    }
                ],
                MessageAction: 'SUPPRESS' // Don't send email
            });

            try {
                const createUserResponse = await cognitoClient.send(createUserCommand);
                console.log('User created:', createUserResponse);

                // Add user to company group
                const addToGroupCommand = new AdminAddUserToGroupCommand({
                    UserPoolId: 'us-east-1_8O2O3UkkF',
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

                alert('User created successfully');
            } catch (error) {
                if (error.name === 'UsernameExistsException') {
                    alert('Username already exists. Please choose a different username.');
                } else {
                    throw error; // Re-throw other errors to be caught by the outer catch
                }
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Check if display name is empty or contains only spaces
            if (!displayName.trim()) {
                alert('Please fill in the Display Name');
                return;
            }

            // Check if display name exceeds 30 characters
            if (displayName.length > 30) {
                alert('Display Name must be 30 characters or fewer.');
                return;
            }

            console.log('Submitting with categories:', categories);
            await onUpdate(company.ID, displayName, categories);
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Failed to update company. Please try again.');
        }
    };

    const handleAddCategory = () => {
        // Check if either field is empty or contains only spaces
        if (!newCategory.text.trim() || !newCategory.category.trim()) {
            alert('Please fill in both Category Text and Category ID');
            return;
        }

        // Alphanumeric with hyphen, lowercase only regex (letters, numbers, hyphen)
        const alphanumericWithHyphenLowercaseRegex = /^[a-z0-9-]+$/;

        // Check if the category ID contain only lowercase alphanumeric characters or hyphens
        if (!alphanumericWithHyphenLowercaseRegex.test(newCategory.category)) {
            alert('Category ID must only contain lowercase alphanumeric characters or hyphens.');
            return;
        }

        // Check if the length of category text or category ID exceeds 30 characters
        if (newCategory.text.length > 30 || newCategory.category.length > 30) {
            alert('Category Text and Category ID must be 30 characters or fewer.');
            return;
        }

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

    const handleRemoveUser = async (username) => {
        if (!window.confirm(`Are you sure you want to remove user ${username}?`)) {
            return;
        }

        try {
            setLoading(true);
            const cognitoClient = await getCognitoClient();

            const deleteUserCommand = new AdminDeleteUserCommand({
                UserPoolId: 'us-east-1_8O2O3UkkF',
                Username: username
            });

            await cognitoClient.send(deleteUserCommand);
            console.log('User deleted successfully');

            // Refresh users list
            await fetchUsers();
            alert('User removed successfully');
        } catch (error) {
            console.error('Error removing user:', error);
            alert('Failed to remove user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Edit Company</h2>
                    </div>
                    <img className='closeButton' src="images/deleteIcon.svg" alt="Close" onClick={onClose}></img>
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
                            <div className="tab-buttons">
                                <button 
                                    type="button"
                                    className={activeTab === 'categories' ? 'active' : ''}
                                    onClick={() => setActiveTab('categories')}
                                >
                                    Categories
                                </button>
                                <button 
                                    type="button"
                                    className={activeTab === 'users' ? 'active' : ''}
                                    onClick={() => setActiveTab('users')}
                                >
                                    Users
                                </button>
                            </div>
                            
                            {activeTab === 'categories' ? (
                                <>
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
                                </>
                            ) : (
                                <div className="users-list">
                                    <div className="add-user-form">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password confirmation"
                                            value={newUser.confirmPassword}
                                            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                        />
                                        <button onClick={handleAddUser}>Add user</button>
                                    </div>
                                    {loading ? (
                                        <p>Loading users...</p>
                                    ) : users.length > 0 ? (
                                        <div className="users-grid">
                                            {users.map((user) => (
                                                <div key={user.Username} className="user-item">
                                                    <div className="user-item-content">
                                                        <span>{user.Username}</span>
                                                        <span className="user-email">
                                                            {user.Attributes?.find(attr => attr.Name === 'email')?.Value}
                                                        </span>
                                                    </div>
                                                    <Button 
                                                        className='cancelButton'
                                                        text="Remove" 
                                                        onClick={() => handleRemoveUser(user.Username)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No users found for this company</p>
                                    )}
                                </div>
                            )}
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