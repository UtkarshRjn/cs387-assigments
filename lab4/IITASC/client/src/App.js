import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import Instructor from './components/Instructor';
import Course from './components/Course';
import Running from './components/Running';
import DeptName from './components/DeptName';

function App() {
  return (
      <Routes>
            <Route path="/home" element={<Home />} />      
            <Route path="/login" element={<Login />} />      
            <Route path="/instructor/:instructor_id" element={<Instructor />} />      
            <Route path="/course/:course_id" element={<Course />} />      
            <Route path="/course/running" element={<Running />} />      
            <Route path="/course/running/:dept_name" element={<DeptName />} />      
      </Routes>

  )
}

export default App;
