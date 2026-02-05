import { useState } from "react";
import { useNavigate } from "react-router";
import { loginUser } from "../api/auth.api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const auth = useAuth();

    console.log("Auth context in Login:", auth); // DEBUG

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const payload = { email, password };

        try {
            const response = await loginUser(payload);
            console.log("Full login response:", response);
            
            const user = response.data.user;
            const token = response.data.token;

            console.log("User:", user);
            console.log("Token:", token);
            console.log("Role:", user.role);

            // Update AuthContext - THIS IS THE KEY LINE YOU'RE MISSING
            auth.login(user, token);

            console.log("Auth updated, navigating...");

            // Navigate
            if (user.role === "UniversalAdmin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/", { replace: true });
            }

        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold">Welcome Back</h1>
                    <p>Sign in with your university credentials</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full p-2 border"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center">
                    New user? <a href="/signup" className="text-blue-600 hover:underline">Create account</a>
                </p>
            </div>
        </div>
    );
}