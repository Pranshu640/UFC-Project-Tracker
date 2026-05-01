# UFC Project Tracker

A modern project showcase platform for the UFC club community. Built with Next.js and Convex, it enables members to submit projects, mentors to review them, and provides a leaderboard system to celebrate achievements.

## Features

### For Everyone
- **Home Page** - Hero section with animated stats (Total Projects, Completed, Deployed, Builders) and recent projects grid
- **Project Browsing** - Filter by status, domain, and tech stack with search functionality
- **Project Details** - Full project information including mentor reviews, GitHub links, and deployment status
- **Leaderboard** - Member rankings by completed projects

### For Project Owners (Authors)
- **Project Submission** - Submit projects with images, tech stack, and links
- **Author Dashboard** - Manage your projects, update details, and change passwords
- **Password System** - Initial password is your contact phone number (can be changed)

### For Mentors
- **Mentor Dashboard** - Review all submitted projects
- **Review System** - Add feedback with status updates
- **Tier Assignment** - Categorize projects as Featured, Highlighted, or Showcased
- **Status Management** - Track project progress through 12 different statuses

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, CSS Variables |
| Backend | Convex (Database, Auth, Storage, Real-time) |
| Fonts | Syne (display), Manrope (body) |

## Project Structure

```
project-tracker/
├── app/                          # Next.js App Router
│   ├── author/                   # Author features
│   │   ├── dashboard/           # Author dashboard
│   │   └── login/               # Author login
│   ├── components/              # Reusable React components
│   ├── leaderboard/             # Leaderboard page
│   ├── mentor/                  # Mentor features
│   │   ├── dashboard/           # Mentor dashboard
│   │   ├── login/              # Mentor login
│   │   └── register/           # Mentor registration
│   ├── projects/               # Project browsing
│   │   ├── [id]/              # Project detail page
│   │   └── page.tsx           # Projects listing
│   ├── submit/                 # Project submission
│   └── lib/auth.tsx            # Authentication context
├── convex/                     # Convex backend functions
│   ├── projects.ts             # Project CRUD
│   ├── users.ts                # User management
│   ├── reviews.ts              # Mentor reviews
│   ├── projectAuth.ts          # Project owner auth
│   ├── storage.ts              # File storage
│   └── schema.ts               # Database schema
└── public/                     # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Pranshu640/UFC-Project-Tracker.git
cd UFC-Project-Tracker

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
MENTOR_REGISTRATION_CODE=your_secret_registration_code
```

You can get your Convex deployment URL by running:

```bash
npx convex dev
```

### Running the Development Server

```bash
# Start Convex backend (in one terminal)
npx convex dev

# Start Next.js frontend (in another terminal)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Database Schema

The project uses Convex's full-text search database with the following tables:

### users
Stores mentor accounts.

| Field | Type | Description |
|-------|------|-------------|
| name | string | User's display name |
| email | string | Unique email address |
| password | string | Hashed password |
| role | "member" \| "mentor" | User role |
| githubUsername | string | GitHub username |
| projectsCompleted | number | Count of reviewed projects |
| createdAt | number | Unix timestamp |

### memberAccounts
Stores project author credentials.

| Field | Type | Description |
|-------|------|-------------|
| githubUsername | string | Primary identifier |
| password | string | Hashed password |
| name | string | Display name |
| createdAt | number | Unix timestamp |

### projects
Stores all submitted projects.

| Field | Type | Description |
|-------|------|-------------|
| submitterName | string | Author's name |
| contactNo | string | Contact phone number |
| title | string | Project title |
| description | string | Project description |
| domain | string | Project domain/category |
| githubUsername | string | Author's GitHub |
| githubRepoLink | string | Repository URL |
| deployedLink | string | Deployed project URL |
| linkedinPost | string | LinkedIn post URL |
| previewImageId | string | Convex storage ID |
| techStack | string[] | Array of technologies |
| status | string | Current project status |
| tier | number | Tier level (1-3) |
| createdAt | number | Unix timestamp |

### reviews
Stores mentor feedback on projects.

| Field | Type | Description |
|-------|------|-------------|
| projectId | Id | Reference to project |
| mentorId | Id | Reference to mentor |
| mentorName | string | Reviewer's name |
| content | string | Review text |
| statusUpdate | string | New status after review |
| createdAt | number | Unix timestamp |

## Authentication

### Mentor Authentication
- Email/password based authentication
- Session stored in localStorage as `mentor_session`
- Requires secret registration code to create new accounts

### Author Authentication
- GitHub username + name + password
- Initial password is the contact phone number used during submission
- Can be changed through the author dashboard

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx convex dev` | Start Convex backend |
| `npx convex deploy` | Deploy Convex functions |
| `npx convex docs` | Open Convex documentation |

## Project Statuses

Projects can have the following statuses:

- `pending` - Awaiting review
- `incomplete` - Needs more information
- `complete` - Completed review
- `deployed` - Successfully deployed
- `completed-good`, `completed-decent`, `completed-great`, `completed-bad` - With feedback
- `deployed-good`, `deployed-decent`, `deployed-great`, `deployed-bad` - Deployed with feedback

## Tier System

Projects are categorized into tiers:

| Tier | Name | Description |
|------|------|-------------|
| 1 | Featured | Top-tier projects |
| 2 | Highlighted | Strong projects |
| 3 | Showcased | Noteworthy projects |
| null | Untiered | Awaiting evaluation |

## Tech Stack Categories

The tech stack selector includes:

- **Frontend**: React, Next.js, Vue, Svelte, Angular, Solid, Astro, Qwik
- **Backend**: Node.js, Python, Go, Rust, Java, C#, Ruby, PHP, Elixir, Kotlin
- **Mobile**: React Native, Flutter, Swift, Kotlin, Expo
- **Database**: PostgreSQL, MongoDB, MySQL, Redis, Firebase, Supabase, Prisma
- **DevOps**: Docker, Kubernetes, AWS, GCP, Azure, Vercel, Netlify, Terraform
- **AI/ML**: TensorFlow, PyTorch, OpenAI, LangChain, Hugging Face, Computer Vision, NLP
- **Blockchain**: Solidity, Rust, Web3.js, Ethers.js, Hardhat
- **Tools**: Git, GitHub, GitLab, Figma, Notion, Linear

## License

This project is private and proprietary to the UFC club community.
