import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new project with validation
export const createProject = mutation({
    args: {
        submitterName: v.string(),
        contactNo: v.string(),
        title: v.string(),
        description: v.string(),
        domain: v.string(),
        githubUsername: v.string(),
        githubRepoLink: v.string(),
        deployedLink: v.optional(v.string()),
        previewImageId: v.optional(v.id("_storage")),
        techStack: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        // Validation checks
        if (args.submitterName.trim().length < 2) {
            throw new Error("Name must be at least 2 characters");
        }
        if (args.title.trim().length < 3) {
            throw new Error("Title must be at least 3 characters");
        }
        if (args.description.trim().length < 20) {
            throw new Error("Description must be at least 20 characters");
        }
        if (!args.githubRepoLink.includes("github.com")) {
            throw new Error("Invalid GitHub repository URL");
        }
        if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(args.githubUsername.trim())) {
            throw new Error("Invalid GitHub username format");
        }

        // Rate limiting: Check for recent submissions from same contact
        const recentProjects = await ctx.db
            .query("projects")
            .filter((q) => q.eq(q.field("contactNo"), args.contactNo.trim()))
            .order("desc")
            .take(1);

        if (recentProjects.length > 0) {
            const lastSubmission = recentProjects[0].createdAt;
            const cooldown = Date.now() - 5 * 60 * 1000; // 5 minutes cooldown
            if (lastSubmission > cooldown) {
                throw new Error("Please wait 5 minutes between submissions");
            }
        }

        const projectId = await ctx.db.insert("projects", {
            submitterName: args.submitterName.trim(),
            contactNo: args.contactNo.trim(),
            title: args.title.trim(),
            description: args.description.trim(),
            domain: args.domain,
            githubUsername: args.githubUsername.trim().toLowerCase(),
            githubRepoLink: args.githubRepoLink.trim(),
            deployedLink: args.deployedLink?.trim() || undefined,
            previewImageId: args.previewImageId,
            techStack: args.techStack,
            status: "pending",
            averageRating: 0,
            ratingCount: 0,
            totalRatingScore: 0,
            createdAt: Date.now(),
        });
        return projectId;
    },
});

// Get all projects with optional filtering
export const getProjects = query({
    args: {
        status: v.optional(v.string()),
        domain: v.optional(v.string()),
        searchQuery: v.optional(v.string()),
        techStack: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        let projects = await ctx.db.query("projects").order("desc").collect();

        // Filter by status
        if (args.status && args.status !== "all") {
            projects = projects.filter((p) => p.status === args.status);
        }

        // Filter by domain
        if (args.domain && args.domain !== "all") {
            projects = projects.filter((p) => p.domain === args.domain);
        }

        // Filter by tech stack (match ANY)
        if (args.techStack && args.techStack.length > 0) {
            projects = projects.filter((p) => {
                if (!p.techStack) return false;
                const projectStack = p.techStack;
                return args.techStack!.some(tech => projectStack.includes(tech));
            }
            );
        }

        // Search by title or description
        if (args.searchQuery) {
            const query = args.searchQuery.toLowerCase();
            projects = projects.filter(
                (p) =>
                    p.title.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.githubUsername.toLowerCase().includes(query)
            );
        }

        return projects;
    },
});

// Get a single project by ID
export const getProject = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get top rated projects
export const getTopProjects = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 5;
        const projects = await ctx.db.query("projects").order("desc").collect();

        // Sort by average rating, then by rating count
        return projects
            .filter((p) => p.ratingCount > 0)
            .sort((a, b) => {
                if (b.averageRating !== a.averageRating) {
                    return b.averageRating - a.averageRating;
                }
                return b.ratingCount - a.ratingCount;
            })
            .slice(0, limit);
    },
});

// Update project status (mentor only)
export const updateProjectStatus = mutation({
    args: {
        projectId: v.id("projects"),
        status: v.union(
            v.literal("pending"),
            v.literal("incomplete"),
            v.literal("complete"),
            v.literal("deployed")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.projectId, { status: args.status });
        return { success: true };
    },
});

// Get project stats
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();
        const uniqueMembers = new Set(projects.map((p) => p.githubUsername));

        return {
            totalProjects: projects.length,
            completedProjects: projects.filter(
                (p) => p.status === "complete" || p.status === "deployed"
            ).length,
            deployedProjects: projects.filter((p) => p.status === "deployed").length,
            totalMembers: uniqueMembers.size,
        };
    },
});

// Get projects by domain for stats
export const getProjectsByDomain = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();
        const domainCounts: Record<string, number> = {};

        projects.forEach((p) => {
            domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
        });

        return Object.entries(domainCounts).map(([domain, count]) => ({
            domain,
            count,
        }));
    },
});
