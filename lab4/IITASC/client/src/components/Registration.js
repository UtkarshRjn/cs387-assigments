import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'

const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/registration";

const Registration = () => {
    const [responseData, setResponseData] = useState({});

    // const items = [
    //     {
    //       id: 0,
    //       name: 'Cobol'
    //     },
    //     {
    //       id: 1,
    //       name: 'JavaScript'
    //     },
    //     {
    //       id: 2,
    //       name: 'Basic'
    //     },
    //     {
    //       id: 3,
    //       name: 'PHP'
    //     },
    //     {
    //       id: 4,
    //       name: 'Java'
    //     }
    //   ]
    
    
    useEffect(() => {
        const session = JSON.parse(localStorage.getItem("session"));

        const body = {};//{ id: session.user.id };

        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => setResponseData(data))
        .catch(error => console.error(error));
    }, []);
    const items = Object.values(responseData);
   
    const handleOnSearch = (string, results) => {
        // onSearch will have as the first callback parameter
        // the string searched and for the second the results.
        console.log(string, results)
      }
    
      const handleOnHover = (result) => {
        // the item hovered
        console.log(result)
      }
    
      const handleOnSelect = (item) => {
        // the item selected
        console.log(item)
      }
    
      const handleOnFocus = () => {
        console.log('Focused')
      }
    
      const formatResult = (item) => {
        return (
          <>
            <span style={{ display: 'block', textAlign: 'left' }}>id: {item.id}</span>
            <span style={{ display: 'block', textAlign: 'left' }}>name: {item.course_id}</span>
            <span style={{ display: 'block', textAlign: 'left' }}>name: {item.title}</span>
       
          </>
        )
      }
    
//                 <tbody>
//                     {
//                     responseDataArray.map((item, index) => (
//                         <tr key={index}>
//                             <td>{index+1}</td>
//                             <td>{item.course_id}</td>
//                             <td>{item.title}</td>
//                             <td>{item.section}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         {/* </body> */}
//     {/* </html> */}
//     </Layout>
//   );
// }
// //}
return (
    <Layout>
    <div className="App">
      <header className="App-header">
        <div style={{ width: 400 }}>
          <ReactSearchAutocomplete
            items={items}
            fuseOptions={{ keys: ["title", "course_id"] }}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            autoFocus
            formatResult={formatResult}
            resultStringKeyName="title"
          />
        </div>
      </header>
    </div>
    </Layout>
  )
}
export default Registration;