import { BrowserRouter,Route, Routes,Navigate,Outlet, } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import Instructor from './components/Instructor';
import Course from './components/Course';
import Running from './components/Running';
import DeptName from './components/DeptName';
import Registration from './components/Registration';
//import { useSelector } from 'react-redux'


const PrivateRoutes = () =>{
  const isAuth = false
  return <>{isAuth ? <Outlet/> : <Navigate to='/login' />}</>
}

const RestrictedRoutes = () =>{
  const isAuth = false
  return <>{!isAuth ? <Outlet/> : <Navigate to='/home' />}</>
}

const App = () => {
  return (
      <Routes>
            <Route path="/instructor/:instructor_id" element={<Instructor />} />      
            <Route path="/course/:course_id" element={<Course />} />      
            <Route path="/course/running" element={<Running />} />      
            <Route path="/course/running/:dept_name" element={<DeptName />} />      
      
            <Route element={<PrivateRoutes/>}>
              <Route path="/home" element={<Home />} /> 
            </Route>
            <Route element={<RestrictedRoutes/>}>
              <Route path="/home/registration" element={<Registration />} />      
              <Route path="/login" element={<Login />} />      
            </Route>
      </Routes>

  )
}

export default App;
