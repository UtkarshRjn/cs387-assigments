import { useRef, useState, useEffect } from 'react';
import './Login.css'
import Head from '../Head/Head';
import { useNavigate } from "react-router-dom";
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
            if(session.user.identity == 'student') navigate("/home");
            else navigate(`/instructor/${session.user.id}`);
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <>  
            <Head/>
            <section className="container">
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                <h1 class='h1-login'>Sign In</h1>
                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="student id">Student Id:</label>
                    <input
                        type="text"
                        id="student id"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setId(e.target.value)}
                        value={id}
                        required
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        required
                    />
                    <button class='my-Button'>Sign In</button>
                </form>
            </section>
        </>

    )
}

export default Login