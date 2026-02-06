"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MentorSession {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    mentor: MentorSession | null;
    setMentor: (mentor: MentorSession | null) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [mentor, setMentorState] = useState<MentorSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for existing session
        const stored = localStorage.getItem("mentor_session");
        if (stored) {
            try {
                setMentorState(JSON.parse(stored));
            } catch {
                localStorage.removeItem("mentor_session");
            }
        }
        setIsLoading(false);
    }, []);

    const setMentor = (mentor: MentorSession | null) => {
        setMentorState(mentor);
        if (mentor) {
            localStorage.setItem("mentor_session", JSON.stringify(mentor));
        } else {
            localStorage.removeItem("mentor_session");
        }
    };

    const logout = () => {
        setMentor(null);
    };

    return (
        <AuthContext.Provider value={{ mentor, setMentor, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useMentor() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useMentor must be used within an AuthProvider");
    }
    return context;
}
