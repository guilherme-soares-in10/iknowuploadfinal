import { useState, useEffect } from 'react'
import Button from './components/common/Button/Buton'
import './App.css'
import AdminDashboard from './components/admin/AdminDashboard/AdminDashboard'
import { Amplify } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { signOut } from '@aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css'


// Configure Amplify
Amplify.configure({
  aws_project_region: 'us-east-1',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_8O2O3UkkF',
  aws_user_pools_web_client_id: 'vdb2e71v0lovn4dl35sdqjirb'
})

function App() {
  const [dynamoData, setDynamoData] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [userCompany, setUserCompany] = useState(null)
  const [companyDisplayName, setCompanyDisplayName] = useState(null)

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
    fetch("https://irqns6amh7.execute-api.us-east-1.amazonaws.com/dev/companies", {
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
    fetch("https://irqns6amh7.execute-api.us-east-1.amazonaws.com/dev/companies", {
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

  const updateDynamoData = async (id, displayName) => {
    try {
      const response = await fetch('https://irqns6amh7.execute-api.us-east-1.amazonaws.com/dev/companies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          displayName: displayName,
          httpMethod: 'PUT'  // Add this to ensure the Lambda function recognizes it as a PUT request
        })
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
        "categories": [
            {
                "text": "Upload arquivos plano de mídia",
                "category": "plano-midia"
            }
        ]
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
    fetch("https://irqns6amh7.execute-api.us-east-1.amazonaws.com/dev/companies", requestOptions)
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
            <Button className="signOutButton" text="Sign out" onClick={handleSignOut}/>            
          </div>
          <div>
            <img className='in10Logo' src="./src/images/in10Logo.svg" width="200px" alt="in10Logo"/>
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
          ) : (
            <div>
              <h2>Company Interface for {userCompany}</h2>
              {/* Here we'll add the company-specific interface later */}
            </div>
          )}
        </main>
        <footer>
          <p>© 2025 IN10</p>
        </footer>
    </div>   
     
    </>
  )
}

export default withAuthenticator(App, {
  signUpAttributes: [
    'email'
  ]
});
