"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMentor } from "../../lib/auth";

export default function MentorRegisterPage() {
    const router = useRouter();
    const { setMentor } = useMentor();
    const registerMentor = useMutation(api.users.registerMentor);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        registrationCode: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.registrationCode) {
            setError("All fields are required");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await registerMentor({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                registrationCode: formData.registrationCode,
            });

            setMentor({
                id: result.id,
                name: result.name,
                email: result.email,
                role: result.role,
            });

            router.push("/mentor/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
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
            <div className="form-card" style={{ maxWidth: 420 }}>
                <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
                    <h1 className="form-card-title">Mentor Registration</h1>
                    <p className="form-card-subtitle">
                        Create your mentor account
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Your name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="mentor@club.com"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Min 6 chars"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Re-enter"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Registration Code</label>
                        <input
                            type="text"
                            name="registrationCode"
                            value={formData.registrationCode}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Secret admin code"
                            style={{ fontFamily: "var(--font-mono)" }}
                        />
                        <p className="form-hint">Ask your administrator for the code.</p>
                    </div>

                    <div style={{ marginTop: "var(--space-6)" }}>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: "100%" }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Registering..." : "Register"}
                        </button>
                    </div>
                </form>

                <p style={{
                    textAlign: "center",
                    marginTop: "var(--space-6)",
                    fontSize: "13px",
                    color: "var(--text-secondary)"
                }}>
                    Already have an account?{" "}
                    <a href="/mentor/login" style={{ color: "var(--accent)" }}>
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
