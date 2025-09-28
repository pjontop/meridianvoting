import { PrismaClient } from "@/generated/prisma";
import { cache, cacheKeys } from "./cache";

const prisma = new PrismaClient();

// Cached database queries for better performance
export const db = {
  // Get all projects with vote counts (cached)
  async getProjectsWithVotes() {
    const cacheKey = cacheKeys.projectsWithVotes();
    const cached = await cache.get<any[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        votes: {
          select: {
            userId: true,
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: [
        { votes: { _count: "desc" } },
        { createdAt: "desc" }
      ]
    });

    // Cache for 2 minutes
    await cache.set(cacheKey, projects, 120);
    return projects;
  },

  // Get user votes (cached)
  async getUserVotes(userId: string) {
    const cacheKey = cacheKeys.userVotes(userId);
    const cached = await cache.get<any[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const votes = await prisma.vote.findMany({
      where: { userId },
      select: { projectId: true }
    });

    // Cache for 5 minutes
    await cache.set(cacheKey, votes, 300);
    return votes;
  },

  // Get user project memberships (cached)
  async getUserProjects(userId: string) {
    const cacheKey = cacheKeys.userProjects(userId);
    const cached = await cache.get<any[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const projects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });

    // Cache for 10 minutes
    await cache.set(cacheKey, projects, 600);
    return projects;
  },

  // Get project details (cached)
  async getProjectDetails(projectId: string) {
    const cacheKey = cacheKeys.projectDetails(projectId);
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: {
            votes: true,
            members: true
          }
        }
      }
    });

    // Cache for 5 minutes
    await cache.set(cacheKey, project, 300);
    return project;
  },

  // Invalidate cache when data changes
  async invalidateUserCache(userId: string) {
    await Promise.all([
      cache.del(cacheKeys.userVotes(userId)),
      cache.del(cacheKeys.userProjects(userId)),
      cache.del(cacheKeys.projectsWithVotes()),
      cache.del(cacheKeys.leaderboard())
    ]);
  },

  async invalidateProjectCache(projectId?: string) {
    await Promise.all([
      cache.del(cacheKeys.projectsWithVotes()),
      cache.del(cacheKeys.leaderboard()),
      projectId ? cache.del(cacheKeys.projectDetails(projectId)) : Promise.resolve()
    ]);
  }
};

export { prisma };
