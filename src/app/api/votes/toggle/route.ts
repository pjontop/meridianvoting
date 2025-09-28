import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { headers } from "next/headers";
import { voteSchema, logSecurityEvent } from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      logSecurityEvent("UNAUTHORIZED_VOTE", {}, request);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = voteSchema.safeParse(body);

    if (!validationResult.success) {
      logSecurityEvent("INVALID_VOTE_DATA", {
        userId: session.user.id,
        errors: validationResult.error.issues
      }, request);
      
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { projectId, action } = validationResult.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!project) {
      logSecurityEvent("VOTE_PROJECT_NOT_FOUND", {
        userId: session.user.id,
        projectId
      }, request);
      
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.members.length > 0) {
      logSecurityEvent("SELF_VOTE_ATTEMPT", {
        userId: session.user.id,
        projectId
      }, request);
      
      return NextResponse.json(
        { error: "Cannot vote for your own project" },
        { status: 400 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: projectId
        }
      }
    });

    if (action === "add") {
      if (existingVote) {
        return NextResponse.json(
          { error: "You have already voted for this project" },
          { status: 400 }
        );
      }

      const userVoteCount = await prisma.vote.count({
        where: { userId: session.user.id }
      });

      if (userVoteCount >= 3) {
        logSecurityEvent("VOTE_LIMIT_EXCEEDED", {
          userId: session.user.id,
          currentVotes: userVoteCount,
          projectId
        }, request);
        
        return NextResponse.json(
          { error: "You have already used all 3 of your votes" },
          { status: 400 }
        );
      }

      await prisma.vote.create({
        data: {
          userId: session.user.id,
          projectId: projectId
        }
      });

      return NextResponse.json(
        { message: "Vote added successfully" },
        { status: 201 }
      );
      
    } else if (action === "remove") {
      if (!existingVote) {
        return NextResponse.json(
          { error: "You have not voted for this project" },
          { status: 400 }
        );
      }

      await prisma.vote.delete({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: projectId
          }
        }
      });

      return NextResponse.json(
        { message: "Vote removed successfully" },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Vote toggle error:", error);
    logSecurityEvent("VOTE_ERROR", {
      error: error instanceof Error ? error.message : "Unknown error"
    }, request);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}