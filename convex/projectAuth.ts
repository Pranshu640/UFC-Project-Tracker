import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const login = mutation({
    args: {
        name: v.string(),
        githubUsername: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if account exists in memberAccounts
        const account = await ctx.db
            .query("memberAccounts")
            .withIndex("by_github", (q) => q.eq("githubUsername", args.githubUsername.toLowerCase()))
            .first();

        if (account) {
            if (account.password !== args.password || account.name.toLowerCase() !== args.name.toLowerCase()) {
                throw new Error("Invalid credentials");
            }
            return {
                githubUsername: account.githubUsername,
                name: account.name,
                needsPasswordChange: false,
            };
        }

        // Fallback: check projects
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_github", (q) => q.eq("githubUsername", args.githubUsername.toLowerCase()))
            .collect();

        if (projects.length === 0) {
            throw new Error("No projects found for this GitHub ID");
        }

        // Check if any project matches the name and early password (contactNo)
        const validProject = projects.find((p) =>
            p.submitterName.toLowerCase() === args.name.toLowerCase() &&
            p.contactNo === args.password
        );

        if (!validProject) {
            throw new Error("Invalid credentials");
        }

        return {
            githubUsername: args.githubUsername.toLowerCase(),
            name: validProject.submitterName,
            needsPasswordChange: true,
        };
    }
});

export const changePassword = mutation({
    args: {
        name: v.string(),
        githubUsername: v.string(),
        oldPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const account = await ctx.db
            .query("memberAccounts")
            .withIndex("by_github", (q) => q.eq("githubUsername", args.githubUsername.toLowerCase()))
            .first();

        if (account) {
            if (account.password !== args.oldPassword) {
                throw new Error("Invalid old password");
            }
            await ctx.db.patch(account._id, { password: args.newPassword, name: args.name });
            return { success: true };
        }

        // Check projects fallback
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_github", (q) => q.eq("githubUsername", args.githubUsername.toLowerCase()))
            .collect();

        const validProject = projects.find((p) => p.contactNo === args.oldPassword && p.submitterName.toLowerCase() === args.name.toLowerCase());
        if (!validProject) {
            throw new Error("Invalid old password");
        }

        // Create the account
        await ctx.db.insert("memberAccounts", {
            githubUsername: args.githubUsername.toLowerCase(),
            name: validProject.submitterName,
            password: args.newPassword,
            createdAt: Date.now(),
        });

        return { success: true };
    }
});

export const getMyProjects = query({
    args: { githubUsername: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .withIndex("by_github", (q) => q.eq("githubUsername", args.githubUsername.toLowerCase()))
            .order("desc")
            .collect();
    }
});

export const updateProject = mutation({
    args: {
        projectId: v.id("projects"),
        githubUsername: v.string(),
        title: v.string(),
        description: v.string(),
        domain: v.string(),
        githubRepoLink: v.string(),
        deployedLink: v.optional(v.string()),
        linkedinPost: v.optional(v.string()),
        techStack: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");
        if (project.githubUsername.toLowerCase() !== args.githubUsername.toLowerCase()) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.projectId, {
            title: args.title,
            description: args.description,
            domain: args.domain,
            githubRepoLink: args.githubRepoLink,
            deployedLink: args.deployedLink,
            linkedinPost: args.linkedinPost,
            techStack: args.techStack,
        });

        return { success: true };
    }
});
