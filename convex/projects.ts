import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
    v.literal("pending"),
    v.literal("incomplete"),
    v.literal("complete"),
    v.literal("completed-good"),
    v.literal("completed-decent"),
    v.literal("completed-great"),
    v.literal("completed-bad"),
    v.literal("deployed"),
    v.literal("deployed-good"),
    v.literal("deployed-decent"),
    v.literal("deployed-great"),
    v.literal("deployed-bad")
);

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
        linkedinPost: v.optional(v.string()),
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
            linkedinPost: args.linkedinPost?.trim() || undefined,
            previewImageId: args.previewImageId,
            techStack: args.techStack,
            status: "pending",
            tier: undefined,
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

        // Sort by tier: Tier 1 first, then Tier 2, then Tier 3, then untiered
        projects.sort((a, b) => {
            const tierA = a.tier ?? 99; // Untiered goes last
            const tierB = b.tier ?? 99;
            if (tierA !== tierB) return tierA - tierB;
            return 0; // Keep existing order within same tier
        });

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

// Update project status (mentor only)
export const updateProjectStatus = mutation({
    args: {
        projectId: v.id("projects"),
        status: statusValidator,
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.projectId, { status: args.status });
        return { success: true };
    },
});

// Update project tier (mentor only)
export const updateProjectTier = mutation({
    args: {
        projectId: v.id("projects"),
        tier: v.union(v.literal(1), v.literal(2), v.literal(3)),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.projectId, { tier: args.tier });
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
                (p) => p.status === "complete" || p.status === "deployed" ||
                    p.status.startsWith("completed-") || p.status.startsWith("deployed-")
            ).length,
            deployedProjects: projects.filter(
                (p) => p.status === "deployed" || p.status.startsWith("deployed-")
            ).length,
            totalMembers: uniqueMembers.size,
            tier1Projects: projects.filter((p) => p.tier === 1).length,
            tier2Projects: projects.filter((p) => p.tier === 2).length,
            tier3Projects: projects.filter((p) => p.tier === 3).length,
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
