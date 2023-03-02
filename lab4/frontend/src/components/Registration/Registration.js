import React, { useState, useEffect , Fragment } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import './Registration.css';
import Head from '../Head/Head';

const Registration = () => {
    const [courseVal, setVal] = useState("");
    const [selectedSection, setSelectedSection] = useState(null);
    const [searchResponseData, setSearchResponseData] = useState([]);
    const [registrationResponseData, setRegistrationResponseData] = useState(null);

    const endpoint = process.env.REACT_APP_API_URL || `http://localhost:5000/search/?courseVal=${courseVal}`;
    const session = JSON.parse(localStorage.getItem("session"));

    const onSubmitForm = async e => {
      e.preventDefault();
      try {
        const body = { courseVal, year: session.user.year, semester: session.user.semester };
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => setSearchResponseData(data))
        .catch(error => console.error(error));
      } catch (err) {
        console.error(err.message);
      }
    };

    const onClickRegister = (course, selectedSection) => {
        try {
            selectedSection = selectedSection ? selectedSection : course.section_slot[0];
            const courseData = {
                id: session.user.id,
                course_id: course.course_id,
                sec_id: selectedSection,
                year: session.user.year,
                semester: session.user.semester
            };
            fetch(`http://localhost:5000/registration`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(courseData)
            })
            .then(response => response.json())
            .then(data => {
                if(data.message === "Already Registered") {
                    alert("You are already registered for this course!");
                } else if(data.message === "Time Slot Clash") {
                    alert("The selected course clashes with another course in your schedule.");
                } else if(data.message === "Prerequisite Not Done") {
                    alert("You have not completed the prerequisites for this course.");
                } else if(data.message === "Registered") {
                    alert("Successfully Registered!");
                    setSearchResponseData([]);
                }
            })
            .catch(error => console.error(error));


          } catch (err) {
            console.error(err.message);
          }
    }

  return (
    <div className="registration-page">
        <Head />
        <NavBar />
        <h1 className="my-5">Course List</h1>
        <form className="d-flex">
        <input
            type="text"
            name="name"
            placeholder="Search course ..."
            className="form-control mr-3"
            value={courseVal}
            onChange={e => setVal(e.target.value)}
        />
        <button className='myButton' onClick={onSubmitForm}>
            Search
        </button>
        </form>
        <table className="table my-5">
        <thead>
            <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Section</th>
            <th>Register</th>
            </tr>
        </thead>
        <tbody>
            {searchResponseData.map(course => (
            <tr>
                <td>{course.course_id}</td>
                <td>{course.title}</td>
                <td>
                <select
                    name="section"
                    className="form-control"
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                >
                    {course && course.section_slot.length > 0 ? (
                    course.section_slot.map(section => (
                        <option value={section}>{section}</option>
                    ))
                    ) : (
                    <option value="">No sections available</option>
                    )}
                </select>
                </td>
                <td className="text-center">
                <button
                    className="myButton"
                    onClick={() => onClickRegister(course, selectedSection)}
                >
                    Register
                </button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
        {searchResponseData.length === 0 && <p style={{fontSize: "20px", color: "white"}}>No Results Found</p>}
    </div>
    
  );
}


export default Registration;