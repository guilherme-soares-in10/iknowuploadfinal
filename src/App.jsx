import { useState, useEffect } from 'react'
import Button from './components/common/Button/Buton'
import './App.css'
import AdminDashboard from './components/admin/AdminDashboard/AdminDashboard'
function App() {
  const [dynamoData, setDynamoData] = useState([])

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

  return (
    <>
    <div className='App'>
        <header>
          <div className='signOutButtonContainer'>
            <div className='adminIndicator'>
              Admin 
            </div>
            <Button className="signOutButton" text="Sign out"/>            
          </div>
          <div>
            <img className='in10Logo' src="./src/images/in10Logo.svg" width="200px" alt="in10Logo"/>
          </div>
        </header>
        <main>
          <AdminDashboard 
            dynamoData={dynamoData} 
            deleteDynamoData={deleteDynamoData} 
            sendDynamoData={sendDynamoData}
            updateDynamoData={updateDynamoData}
          />
        </main>
        <footer>
          <p>© 2025 IN10</p>
        </footer>
    </div>   
     
    </>
  )
}

export default App
