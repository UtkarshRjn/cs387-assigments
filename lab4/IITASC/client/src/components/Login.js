import { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Layout from './Layout';
const endpoint = process.env.REACT_APP_API_URL || "http://localhost:5000/login";

const Login = () => {
    const navigate = useNavigate();
    const userRef = useRef();
    const errRef = useRef();

    const [description, setDescription] = useState("");
    const [id, setId] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [id, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = { id, pwd };
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });
      
            if (!response.ok) {
                throw new Error("Login failed.");
            }
    
            const session = await response.json();
            console.log(session);

            localStorage.setItem("session", JSON.stringify(session));
            navigate("/home");
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <Layout>  
            <section>
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                <h1>Sign In</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="student id" className='form-label'>Student Id:</label>
                    <input
                        type="text"
                        id="student id"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setId(e.target.value)}
                        value={id}
                        required
                    />

                    <label htmlFor="password" className='form-label'>Password:</label>
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        required
                    />
                    
                    <button type='submit' className='btn btn-primary'>
                     Sign In
                    </button>
                </form>
            </section>
        </Layout>
    )
}

export default Login
//<button>Sign In</button>
//<div style={{ color: 'red', margin: '10px 0' }}>{error}</div>