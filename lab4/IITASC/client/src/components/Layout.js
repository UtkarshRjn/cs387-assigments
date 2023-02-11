import Navbar from './NavBar'

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className='container'>{children}</div>
    </div>
  )
}

export default Layout