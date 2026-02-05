import { useState } from "react";
import { loginUser } from "../api/auth.api.js";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError(""); // Clear previous errors
        setLoading(true);

        const payload = {
            email,
            password
        };

        try {
            // Call login API
            const response = await loginUser(payload);

            // Check user role from response
            const user = response.data.user;

            if (user.role === "UniversalAdmin") {
                // Redirect super admin to dashboard
                window.location.href = "/admin";
            } else {
                // Normal users go to home
                window.location.href = "/";
            }

        } catch (err) {
            console.error(err.response?.data || err);
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
