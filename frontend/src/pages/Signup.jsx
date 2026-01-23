
import { useState, useEffect } from "react";
import { getUniversities } from "../api/meta.api.js";
import { BATCHES, DEPARTMENTS } from "../constants/enums.js";
import { signUser } from "../api/auth.api.js";

export default function Signup() {
    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [universityId, setUniversityId] = useState("");
    const [department, setDepartment] = useState("");
    const [batch, setBatch] = useState("");

    const [universities, setUniversities] = useState([]);
    const [loadingUniversities, setLoadingUniversities] = useState(false);

    useEffect(() => {
        async function fetchUniversities() {
            setLoadingUniversities(true);
            try {
                const res = await getUniversities();
                setUniversities(res.data.universities || []);
            } catch (err) {
                console.error("Failed to load Universities", err);
            } finally {
                setLoadingUniversities(false);
            }
        }

        fetchUniversities();
    }, []);

    useEffect(() => {
        setUniversityId("");
        setDepartment("");
        setBatch("");
    }, [role]);

    async function handleSignup(e) {
        e.preventDefault();

        const payload = {
            name,
            email,
            password,
            role,
        };

        if (role !== "universalAdmin") {
            payload.universityId = universityId;
        }

        if (role === "professor" || role === "student") {
            payload.department = department;
        }

        if (role === "student") {
            payload.batch = batch;
        }

        try {
            await signUser(payload);
        } catch (err) {
            console.error(err.response?.data || err);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 space-y-6 border">
                <h1 className="text-2xl font-semibold text-center">
                    Join the Community
                </h1>

                {/* Role Selection */}
                <div className="flex gap-2">
                    <button type="button" className="flex-1 p-2 border" onClick={() => setRole("student")}>
                        Student
                    </button>
                    <button type="button" className="flex-1 p-2 border" onClick={() => setRole("professor")}>
                        Professor
                    </button>
                    <button type="button" className="flex-1 p-2 border" onClick={() => setRole("admin")}>
                        Admin
                    </button>
                    <button type="button" className="flex-1 p-2 border" onClick={() => setRole("universalAdmin")}>
                        Super Admin
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full p-2 border"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {role !== "universalAdmin" && (
                        <select
                            className="w-full p-2 border"
                            value={universityId}
                            onChange={(e) => setUniversityId(e.target.value)}
                            disabled={loadingUniversities}
                        >
                            <option value="">
                                {loadingUniversities
                                    ? "Loading Universities..."
                                    : "Select University"}
                            </option>
                            {universities.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {(role === "professor" || role === "student") && (
                        <select
                            className="w-full p-2 border"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map((dep) => (
                                <option key={dep} value={dep}>
                                    {dep}
                                </option>
                            ))}
                        </select>
                    )}

                    {role === "student" && (
                        <select
                            className="w-full p-2 border"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                        >
                            <option value="">Select Batch</option>
                            {BATCHES.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    )}

                    <button className="w-full p-2 border" type="submit">
                        Create Account
                    </button>
                </form>

                <p className="text-center">
                    Already have an account? <a href="/login">Sign in</a>
                </p>
            </div>
        </div>
    );
}
