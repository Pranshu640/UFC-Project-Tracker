"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MentorSession {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthorSession {
    githubUsername: string;
    name: string;
    needsPasswordChange: boolean;
}

interface AuthContextType {
    mentor: MentorSession | null;
    setMentor: (mentor: MentorSession | null) => void;
    author: AuthorSession | null;
    setAuthor: (author: AuthorSession | null) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [mentor, setMentorState] = useState<MentorSession | null>(null);
    const [author, setAuthorState] = useState<AuthorSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for existing session
        const storedMentor = localStorage.getItem("mentor_session");
        if (storedMentor) {
            try {
                setMentorState(JSON.parse(storedMentor));
            } catch {
                localStorage.removeItem("mentor_session");
            }
        }

        const storedAuthor = localStorage.getItem("author_session");
        if (storedAuthor) {
            try {
                setAuthorState(JSON.parse(storedAuthor));
            } catch {
                localStorage.removeItem("author_session");
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

    const setAuthor = (author: AuthorSession | null) => {
        setAuthorState(author);
        if (author) {
            localStorage.setItem("author_session", JSON.stringify(author));
        } else {
            localStorage.removeItem("author_session");
        }
    };

    const logout = () => {
        setMentor(null);
        setAuthor(null);
    };

    return (
        <AuthContext.Provider value={{ mentor, setMentor, author, setAuthor, logout, isLoading }}>
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

export function useAuthor() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthor must be used within an AuthProvider");
    }
    return context;
}
