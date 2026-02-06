"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMentor } from "../../lib/auth";

export default function MentorLoginPage() {
    const router = useRouter();
    const { setMentor } = useMentor();
    const mentorLogin = useMutation(api.users.mentorLogin);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError("Enter email and password");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await mentorLogin({
                email: email.trim(),
                password: password.trim(),
            });

            setMentor({
                id: result.id,
                name: result.name,
                email: result.email,
                role: result.role,
            });

            router.push("/mentor/dashboard");
        } catch {
            setError("Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 100px)"
        }}>
            <div className="form-card" style={{ maxWidth: 400 }}>
                <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
                    <h1 className="form-card-title">Mentor Login</h1>
                    <p className="form-card-subtitle">
                        Access the mentor dashboard
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="mentor@club.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <div style={{ marginTop: "var(--space-6)" }}>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: "100%" }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </div>
                </form>

                <p style={{
                    textAlign: "center",
                    marginTop: "var(--space-6)",
                    fontSize: "13px",
                    color: "var(--text-secondary)"
                }}>
                    Need an account?{" "}
                    <a href="/mentor/register" style={{ color: "var(--accent)" }}>
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}
