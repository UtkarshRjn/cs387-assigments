function Reg_table({tableData}){
    return(
        <table className="table">
            <thead>
                <tr>
                    <th>S.N</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Section</th>
                    <th>Register</th>
                </tr>
            </thead>
            <tbody>
            {
                tableData.map((data, index)=>{
                    return(
                        <tr key={index}>
                            <td>{index+1}</td>
                            <td>{data.course_id}</td>
                            <td>{data.title}</td>
                            <td>{data.section}</td>
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
    )
}
export default Reg_table;