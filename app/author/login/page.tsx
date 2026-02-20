"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthor } from "../../lib/auth";

export default function AuthorLoginPage() {
    const router = useRouter();
    const { setAuthor } = useAuthor();
    const authorLogin = useMutation(api.projectAuth.login);

    const [name, setName] = useState("");
    const [githubUsername, setGithubUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !githubUsername.trim() || !password.trim()) {
            setError("Enter all fields to continue");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await authorLogin({
                name: name.trim(),
                githubUsername: githubUsername.trim(),
                password: password.trim(),
            });

            setAuthor({
                githubUsername: result.githubUsername,
                name: result.name,
                needsPasswordChange: result.needsPasswordChange,
            });

            router.push("/author/dashboard");
        } catch (e: any) {
            setError(e.message || "Invalid credentials");
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
                    <h1 className="form-card-title">Project Owner Login</h1>
                    <p className="form-card-subtitle">
                        Access your project dashboard
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name (Used Earlier)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Github Username</label>
                        <input
                            type="text"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            className="form-input"
                            placeholder="github username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                            Initial password is the Contact Phone Number you used during submission.
                        </p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
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
            </div>
        </div>
    );
}
