import { useState, useEffect } from 'react'
import Button from './components/common/Button/Buton'
import './App.css'

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

  // Fetch data when component mounts
  useEffect(() => {
    fetchDynamoData();
  }, []); // Empty dependency array means this runs once when component mounts

   // define the callAPI function that takes a first name and last name as parameters
var callAPI = (firstName,lastName)=>{
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

  return (
    <>
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
          <form>
            <label>Company ID :</label>
            <input type="text" id="fName" placeholder="e.g., escala"></input>
            <label>Display Name :</label>
            <input type="text" id="lName" placeholder="e.g., Escala"></input>
            <button type="button" onClick={()=>callAPI(document.getElementById('fName').value,document.getElementById('lName').value)}>Add Company</button>
          </form>

          <h2>Companies</h2>
          <div className="dynamodb-data">
            <div className="data-container">
              {dynamoData.length > 0 ? (
                dynamoData.map((company, index) => (
                  <div key={index} className="data-item">
                    <div className='data-item-container'>
                      <h3>{company.displayName}</h3>
                      <div className="categories">
                        {company.categories.map((category, catIndex) => (
                          <div key={catIndex} className="category-item">
                            <p>{category.text}</p>
                            <small>Category: {category.category}</small>
                          </div>
                        ))}
                      </div>
                      <Button text='Remove' onClick={() => deleteDynamoData(company.ID)}></Button>
                    </div>
                              
                  </div>
                      ))
                  ) : (
                      <p>No data loaded yet</p>
                  )}
            </div>
          </div>
        </main>
        <footer>
          <p>© 2025 IN10</p>
        </footer>
       
    </>
  )
}

export default App
