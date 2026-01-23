import {BrowserRouter, Routes, Route, Navigate} from "react-router";
import {useEffect, useState} from "react";
import Login from  "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import {axiosInstance} from "./api/axios.api.js";

function App() {
    const [isAuth, setIsAuth] = useState(null);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await axiosInstance.get('/auth/check');
                setIsAuth(res.data.user);
            }
            catch(err) {
                console.error("error in checking auth", err);
            }
        }
        checkAuth();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={isAuth? <Home /> : <Navigate to={"/login"} /> } />
                <Route path="/login" element={!isAuth? <Login /> : <Navigate to={"/"} /> }/>
                <Route path="/signup" element={!isAuth?<Signup /> : <Navigate to={"/"} /> }/>
            </Routes>
        </BrowserRouter>
    );
}

export default  App;