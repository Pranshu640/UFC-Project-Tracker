import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple mentor login (password-based)
export const mentorLogin = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user || user.role !== "mentor") {
            throw new Error("Invalid credentials");
        }

        // Simple password check (in production, use proper hashing)
        if (user.password !== args.password) {
            throw new Error("Invalid credentials");
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    },
});

// Create a mentor account with secret code verification
export const registerMentor = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        registrationCode: v.string(),
    },
    handler: async (ctx, args) => {
        // Verify registration code from environment
        const validCode = process.env.MENTOR_REGISTRATION_CODE;
        if (!validCode || args.registrationCode !== validCode) {
            throw new Error("Invalid registration code");
        }

        // Validate inputs
        if (args.name.trim().length < 2) {
            throw new Error("Name must be at least 2 characters");
        }
        if (!args.email.includes("@")) {
            throw new Error("Invalid email format");
        }
        if (args.password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        // Check if email already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
            .first();

        if (existing) {
            throw new Error("Email already registered");
        }

        const userId = await ctx.db.insert("users", {
            name: args.name.trim(),
            email: args.email.toLowerCase().trim(),
            password: args.password, // In production, hash this!
            role: "mentor",
            projectsCompleted: 0,
            createdAt: Date.now(),
        });

        return {
            id: userId,
            name: args.name.trim(),
            email: args.email.toLowerCase().trim(),
            role: "mentor" as const,
        };
    },
});

// Get member leaderboard (based on completed projects)
export const getMemberLeaderboard = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        const projects = await ctx.db.query("projects").collect();

        // Group projects by github username
        const memberStats: Record<
            string,
            { username: string; total: number; completed: number; deployed: number }
        > = {};

        projects.forEach((p) => {
            if (!memberStats[p.githubUsername]) {
                memberStats[p.githubUsername] = {
                    username: p.githubUsername,
                    total: 0,
                    completed: 0,
                    deployed: 0,
                };
            }

            memberStats[p.githubUsername].total++;

            if (p.status === "complete" || p.status === "deployed") {
                memberStats[p.githubUsername].completed++;
            }
            if (p.status === "deployed") {
                memberStats[p.githubUsername].deployed++;
            }
        });

        // Sort by completed projects, then by deployed
        return Object.values(memberStats)
            .sort((a, b) => {
                if (b.completed !== a.completed) return b.completed - a.completed;
                return b.deployed - a.deployed;
            })
            .slice(0, limit);
    },
});

// Get all mentors
export const getMentors = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "mentor"))
            .collect();
    },
});

// Get mentor by ID
export const getMentor = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user || user.role !== "mentor") {
            return null;
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    },
});
