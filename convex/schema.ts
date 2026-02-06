import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - for both members and mentors
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.optional(v.string()), // Only for mentors
    role: v.union(v.literal("member"), v.literal("mentor")),
    githubUsername: v.optional(v.string()),
    projectsCompleted: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_github", ["githubUsername"]),

  // Projects table
  projects: defineTable({
    submitterName: v.string(),
    contactNo: v.string(),
    title: v.string(),
    description: v.string(),
    domain: v.string(),
    githubUsername: v.string(),
    githubRepoLink: v.string(),
    deployedLink: v.optional(v.string()),
    linkedinPost: v.optional(v.string()), // Optional LinkedIn post URL
    previewImageId: v.optional(v.id("_storage")), // Convex file storage
    techStack: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("pending"),
      v.literal("incomplete"),
      v.literal("complete"),
      v.literal("deployed")
    ),
    averageRating: v.number(),
    ratingCount: v.number(),
    totalRatingScore: v.number(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_domain", ["domain"])
    .index("by_rating", ["averageRating"])
    .index("by_github", ["githubUsername"]),

  // Reviews by mentors
  reviews: defineTable({
    projectId: v.id("projects"),
    mentorId: v.id("users"),
    mentorName: v.string(),
    content: v.string(),
    statusUpdate: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // Ratings by members
  ratings: defineTable({
    projectId: v.id("projects"),
    raterGithub: v.string(), // Using GitHub username to identify raters
    score: v.number(), // 1-5 stars
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_rater_project", ["raterGithub", "projectId"]),
});
