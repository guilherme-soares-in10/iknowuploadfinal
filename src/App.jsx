import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

   // define the callAPI function that takes a first name and last name as parameters
   var callAPI = (firstName,lastName)=>{
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({"firstName":firstName,"lastName":lastName});
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    // make API call with parameters and use promises to get response
    fetch("https://3nh7p317qf.execute-api.us-east-1.amazonaws.com/dev", requestOptions)
    .then(response => response.text())
    .then(result => alert(JSON.parse(result).body))
    .catch(error => console.log('error', error));
}

  return (
    <>
       <form>
        <label>First Name :</label>
        <input type="text" id="fName"></input>
        <label>Last Name :</label>
        <input type="text" id="lName"></input>
        <button type="button" onClick={()=>callAPI(document.getElementById('fName').value,document.getElementById('lName').value)}>Call API</button>
    </form>
    </>
  )
}

export default App
