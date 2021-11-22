import React, { useState, useEffect } from 'react';
import './App.css';
import {Table} from "react-bootstrap";
import { nanoid } from 'nanoid';
import axios from 'axios';

const App = () => {
  const [companies, setCompanies] = useState([]);
  const [addFormData, setAddFormData] = useState({
    company: '',
    businessType: '',
    location: ''
  })

  const handleAddFormChange = (event) => {
    event.preventDefault();
    const fieldbusinessType = event.target.getAttribute('businessType');
    const fieldValue = event.target.value;
    const newFormData = { ...addFormData };
    newFormData[fieldbusinessType] = fieldValue;
    setAddFormData(newFormData);
  }

  const handleAddFormSubmit = async (event) => {
    event.preventDefault();
    const newCompany = {
      id: nanoid(),
      businessType: addFormData.businessType,
      company: addFormData.company,
      location: addFormData.location
    };
    await axios.post("http://localhost:8080/api/add", newCompany )
    await getData()
  }

  const handleDeleteClick = async (companyId) => {
    const response= await axios.delete(`http://localhost:8080/api/delete/${companyId}`)
    setCompanies(response.data.data);
  }

  const getData = async () => {
    const response = await axios.get("http://localhost:8080/api/data")
    console.log(response);
    setCompanies(response.data.data)
  }

  useEffect(() => {
    getData()
  }, [])

  return (

    < div  classbusinessType="App">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>company</th>
            <th>Business Type</th>
            <th>location</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr>
              <td>{company.company}</td>
              <td>{company.businessType}</td>
              <td>{company.location}</td>
              <td>
                <button type="button" onClick={() => handleDeleteClick(company.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2>Add a company</h2>
      <form onSubmit={handleAddFormSubmit}>
        <input type="text" businessType="company" required="required" placeholder="Enter a company" onChange={handleAddFormChange}></input>
        <input type="text" businessType="businessType" required="required" placeholder="Enter a businessType" onChange={handleAddFormChange}></input>
        <input type="text" businessType="location" required="required" placeholder="Enter a location" onChange={handleAddFormChange}></input>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default App;
