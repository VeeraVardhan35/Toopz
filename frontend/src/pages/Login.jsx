import {useState} from "react";
import {loginUser} from "../api/auth.api.js";

export default function Login() {
    const [email, setEmail] = useState([]);
    const [password, setPassword] = useState([]);

    async function handleLogin(e) {
        e.preventDefault();
        const payload = {
            email,
            password
        };
        try {
            await loginUser(payload);
        }
        catch(err){
            console.error(err.response?.data || err);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold">Welcome Back</h1>
                    <p> Sign in with your university credentials</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="email"
                        className="w-full p-2 border"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="password"
                        className="w-full p-2 border"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="w-full p-2 border">Sign In</button>
                </form>
                <p className="text-center">
                    New user? <a href="/signup">Create account</a>
                </p>
            </div>
        </div>
    );
}