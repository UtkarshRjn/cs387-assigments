import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Instructor from './components/Instructor/Instructor';
import Course from './components/Course/Course';
import Running from './components/Running/Running';
import DeptName from './components/DeptName/DeptName';
import Registration from './components/Registration/Registration';

function App() {
  return (
      <Routes>
            <Route exact path="/home" element={<Home />} />      
            <Route exact path="/login" element={<Login />} />      
            <Route exact path="/instructor/:instructor_id" element={<Instructor />} />      
            <Route exact path="/course/:course_id" element={<Course />} />      
            <Route exact path="/course/running" element={<Running />} />      
            <Route exact path="/course/running/:dept_name" element={<DeptName />} />      
            <Route exact path="/home/registration" element={<Registration />} />      
      </Routes>

  )
}

export default App;
