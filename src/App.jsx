import { useState, useEffect } from 'react'
import Button from './components/common/Button/Button'
import './App.css'
import AdminDashboard from './components/admin/AdminDashboard/AdminDashboard'
import CompanyDashboard from './components/company/CompanyDashboard/CompanyDashboard'
import { Amplify } from 'aws-amplify'
import { withAuthenticator, ThemeProvider, createTheme } from '@aws-amplify/ui-react'
import { signOut } from '@aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css'
import Support from './components/support/Support'

// Configure I18n
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';

// Define custom translations
const customTranslations = {
  pt: {
    'Sign In': 'Entrar',
    'Sign Up': 'Cadastrar',
    'Sign Out': 'Sair',
    'Forgot your password?': 'Esqueceu sua senha?',
    'Reset Password': 'Redefinir senha',
    'Username': 'Nome de usuário',
    'Password': 'Senha',
    'Email': 'E-mail',
    'Phone Number': 'Número de telefone',
    'Confirm Password': 'Confirmar senha',
    'Create Account': 'Criar conta',
    'Have an account?': 'Já tem uma conta?',
    'No account?': 'Não tem uma conta?',
    'Sign in to your account': 'Entre na sua conta',
    'Create a new account': 'Crie uma nova conta',
    'Reset your password': 'Redefina sua senha',
    'Enter your username': 'Digite seu nome de usuário',
    'Enter your password': 'Digite sua senha',
    'Enter your email': 'Digite seu e-mail',
    'Enter your phone number': 'Digite seu número de telefone',
    'Enter your confirmation code': 'Digite seu código de confirmação',
    'Send code': 'Enviar código',
    'Confirm': 'Confirmar',
    'Back to Sign In': 'Voltar para Entrar',
    'Invalid username or password': 'Nome de usuário ou senha inválidos',
    'User does not exist': 'Usuário não existe',
    'User already exists': 'Usuário já existe',
    'Incorrect username or password': 'Nome de usuário ou senha incorretos',
    'Invalid password format': 'Formato de senha inválido',
    'Invalid email format': 'Formato de e-mail inválido',
    'Invalid phone number format': 'Formato de número de telefone inválido',
    'Passwords do not match': 'As senhas não coincidem',
    'Password must be at least 8 characters': 'A senha deve ter pelo menos 8 caracteres',
    'Password must contain at least one number': 'A senha deve conter pelo menos um número',
    'Password must contain at least one special character': 'A senha deve conter pelo menos um caractere especial',
    'Password must contain at least one uppercase letter': 'A senha deve conter pelo menos uma letra maiúscula',
    'Password must contain at least one lowercase letter': 'A senha deve conter pelo menos uma letra minúscula',
    'username is required to signIn': 'Nome de usuário é obrigatório para entrar',
    'password is required to signIn': 'Senha é obrigatória para entrar',
    'User does not exist.': 'Usuário não existe.',
    'Incorrect username or password.': 'Nome de usuário ou senha incorretos.',
    'Cannot reset password for the user as there is no registered/verified email or phone_number': 'Não é possível redefinir a senha para o usuário, pois não há um e-mail ou número de telefone registrado/verificado.',
    'Username cannot be empty': 'O nome de usuário não pode estar vazio.',
    'Username/client id combination not found.': 'Combinação de nome de usuário/ID do cliente não encontrada.',
    'Password must have at least 8 characters': 'A senha deve ter pelo menos 8 caracteres.',
    'Invalid verification code provided, please try again.': 'Código de verificação inválido, por favor, tente novamente.',
    'User password cannot be reset in the current state.': 'A senha do usuário não pode ser redefinida no estado atual.'
  }
};

// Configure I18n with both default and custom translations
I18n.putVocabularies(translations);
I18n.putVocabularies(customTranslations);
I18n.setLanguage('pt');

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_ajpjAeVga',
      userPoolClientId: '1f9p7egjkp7m8pgqsad85atjfu',
      region: 'us-east-1',
      identityPoolId: 'us-east-1:7f97e4a4-cb6c-485f-afc7-a8d1c2bd1b10'
    }
  },
  Storage: {
    S3: {
      bucket: 'iknow-upload-manual',
      region: 'us-east-1'
    }
  }
});

const theme = createTheme({
  name: 'in10-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          // Use your primary color and Amplify will generate the scale
          10: '#520f3010',
          20: '#520f3020',
          40: '#520f3040',
          60: '#520f3060',
          80: '#520f3080',
          90: '#520f3090',
          100: '#520f30', // Your primary color
        },
      },
      background: {
        primary: { value: '#ffffff' }, // White background
        secondary: { value: '#f8f9fa' }, // Light gray for secondary areas
      },
      font: {
        interactive: { value: '#520f30' }, // Your primary color for interactive text
      },
    },
    fonts: {
      default: {
        variable: { value: 'Inter, sans-serif' }, // Match your app font
        static: { value: 'Inter, sans-serif' },
      },
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: '{colors.brand.primary.100}' },
          _hover: {
            backgroundColor: { value: '{colors.brand.primary.90}' },
          },
        },
      },
      authenticator: {
        modal: {
          backgroundColor: { value: '{colors.background.primary}' },
          borderRadius: { value: '8px' },
          boxShadow: { value: '0 4px 20px rgba(0, 0, 0, 0.15)' },
        },
      },
    },
  },
  overrides: [
    {
      colorMode: 'light',
      tokens: {
        colors: {
          font: {
            primary: { value: '#520f30' },
            secondary: { value: '#6c757d' },
            tertiary: { value: '#495057' },
          },
        },
      },
    },
  ],
});

// Verify Amplify configuration
console.log('Amplify Configuration:', Amplify.getConfig());

function App() {
  const [dynamoData, setDynamoData] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [userCompany, setUserCompany] = useState(null)
  const [companyDisplayName, setCompanyDisplayName] = useState(null)
  const [showSupport, setShowSupport] = useState(false)

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        console.log('Full token payload:', tokens.accessToken.payload);
        const groups = tokens.accessToken.payload['cognito:groups'];
        
        // Try different ways to access the companyID
        const companyID = 
          tokens.accessToken.payload['custom:companyID'] || 
          tokens.accessToken.payload['companyID'] ||
          tokens.idToken.payload['custom:companyID'] ||
          tokens.idToken.payload['companyID'];
        
        console.log('User groups:', groups);
        console.log('User company ID:', companyID);
        
        // Set user role based on groups
        if (groups && groups.includes('admin')) {
          setUserRole('admin');
        } else {
          setUserRole('company');
          setUserCompany(companyID);
          // Fetch company data to get displayName
          const company = dynamoData.find(item => item.ID === companyID);
          if (company) {
            setCompanyDisplayName(company.displayName);
          }
        }
      } catch (error) {
        console.error('Error getting user info:', error);
        setUserRole('company');
      }
    };
    
    getUserInfo();
  }, [dynamoData]); // Add dynamoData as dependency

  // Function to fetch DynamoDB data
  const fetchDynamoData = () => {
    fetch("https://7rzhr29z73.execute-api.us-east-1.amazonaws.com/prod/companies", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('DynamoDB Data:', data);
      const items = JSON.parse(data.body);
      setDynamoData(items);
    })
    .catch(error => console.log('error', error));
  }

  const deleteDynamoData = (id) => {
    console.log('Attempting to delete company with ID:', id);
    fetch("https://7rzhr29z73.execute-api.us-east-1.amazonaws.com/prod/companies", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
      console.log('Delete response:', data);
      fetchDynamoData(); // Refresh the data after deletion
    })
    .catch(error => console.log('error', error));
  }

  const updateDynamoData = async (id, displayName, categories) => {
    try {
      console.log('updateDynamoData called with:', { id, displayName, categories });
      const requestBody = {
        id: id,
        displayName: displayName,
        categories: categories,
        httpMethod: 'PUT'
      };
      console.log('Request body:', JSON.stringify(requestBody));
      
      const response = await fetch('https://7rzhr29z73.execute-api.us-east-1.amazonaws.com/prod/companies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }

      const data = await response.json();
      console.log('Update successful:', data);
      fetchDynamoData(); // Refresh the data after successful update
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchDynamoData();
  }, []); // Empty dependency array means this runs once when component mounts

   // define the sendDynamoData function that takes a first name and last name as parameters
  var sendDynamoData = (firstName,lastName)=>{
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({
        "companyId": firstName,
        "displayName": lastName,
        "categories": []
    });
    
    // Log the data being sent
    console.log('Data being sent to API:', raw);
    
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    // make API call with parameters and use promises to get response
    fetch("https://7rzhr29z73.execute-api.us-east-1.amazonaws.com/prod/companies", requestOptions)
    .then(response => response.text())
    .then(result => {
        console.log('API Response:', result);
        alert(JSON.parse(result).body);
        // After successful POST, refresh the DynamoDB data
        fetchDynamoData();
    })
    .catch(error => console.log('error', error));
  }

  const handleUpdate = () => {
    fetchDynamoData(); // Refresh the data after an update
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
    <div className='App'>
        <header>
          <div className='signOutButtonContainer'>
            <div className='adminIndicator'>
              {userRole === 'admin' ? 'Admin' : companyDisplayName} 
            </div>
            <Button className="signOutButton" text="Sair" onClick={handleSignOut}/>            
          </div>
          <div>
            <img className='in10Logo' src="/images/in10Logo.svg" width="200px" alt="in10Logo"/>
          </div>
        </header>
        <main>
          {userRole === 'admin' ? (
            <AdminDashboard 
              dynamoData={dynamoData} 
              deleteDynamoData={deleteDynamoData} 
              sendDynamoData={sendDynamoData}
              updateDynamoData={updateDynamoData}
            />
          ) : showSupport ? (
            <Support onClose={() => setShowSupport(false)} />
          ) : (
            <CompanyDashboard companyData={dynamoData.find(item => item.ID === userCompany)} />
          )}
        </main>
        <footer>
          {userRole !== 'admin' && (
            <div className="supportContainer" onClick={() => setShowSupport(!showSupport)}>
              <img src="/images/help-circle.svg" alt="support" />
              <p>Suporte</p>
            </div>
          )}
          <p className='footerText'>© 2025 IN10</p>
        </footer>
    </div>   
     
    </>
  )
}

const AuthenticatedApp = withAuthenticator(App, {
  components: {
    Header() {
      return (
        <div style={{ 
          textAlign: 'center',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <img 
            src="/images/in10Logo.svg" 
            alt="in10Logo" 
            style={{ width: '150px' }}
          />
        </div>
      );
    },
    Footer() {
      return (
        <div style={{ 
          textAlign: 'center',
          padding: '1rem',
          color: 'var(--tertiary-color)',
          fontSize: 'var(--small-font-size)'
        }}>
          <p>© 2025 IN10</p>
        </div>
      );
    },
  },
  formFields: {
    signIn: {
      username: {
        placeholder: 'Nome de usuário',
        label: 'Nome de usuário',
      },
      password: {
        placeholder: 'Senha',
        label: 'Senha',
      },
    },
    signUp: {
      username: {
        placeholder: 'Nome de usuário',
        label: 'Nome de usuário',
      },
      password: {
        placeholder: 'Crie uma senha',
        label: 'Senha',
      },
      confirm_password: {
        placeholder: 'Confirme sua senha',
        label: 'Confirme sua senha',
      },
    },
  },
  variation: 'modal',
  loginMechanisms: ['username'],
  hideSignUp: true,
});

export default function ThemedApp() {
  return (
    <ThemeProvider theme={theme} colorMode="light">
      <AuthenticatedApp />
    </ThemeProvider>
  );
}