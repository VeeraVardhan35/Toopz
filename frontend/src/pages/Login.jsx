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


    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const payload = { email, password };

        try {
            const response = await loginUser(payload);
            
            const user = response.data.user;
            const token = response.data.token;


            auth.login(user, token);


            if (user.role === "UniversalAdmin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/", { replace: true });
            }

        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1216] px-4">
            <div className="w-full max-w-md p-6 space-y-6 panel-card">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold text-slate-100">Welcome Back</h1>
                    <p className="text-slate-400">Sign in with your university credentials</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-400/40 text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-white/10 bg-[#14181d] rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2b69ff]/60"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border border-white/10 bg-[#14181d] rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2b69ff]/60"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full p-3 border border-white/10 bg-[#2b69ff] hover:bg-[#2458d6] rounded-lg text-white font-semibold transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-slate-400">
                    New user? <a href="/signup" className="text-blue-400 hover:underline">Create account</a>
                </p>
            </div>
        </div>
    );
}
