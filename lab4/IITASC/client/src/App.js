import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import Instructor from './components/Instructor';
import Course from './components/Course';
import Running from './components/Running';
import DeptName from './components/DeptName';
import Registration from './components/Registration';

function App() {
  return (
      <Routes>
            <Route exact path="/home" element={<Home />} />      
            <Route exact path="/home/Registration" element={<Registration />} />      
            <Route exact path="/login" element={<Login />} />      
            <Route exact path="/instructor/:instructor_id" element={<Instructor />} />      
            <Route exact path="/course/:course_id" element={<Course />} />      
            <Route exact path="/course/running" element={<Running />} />      
            <Route exact path="/course/running/:dept_name" element={<DeptName />} />      
      </Routes>

  )
}

export default App;