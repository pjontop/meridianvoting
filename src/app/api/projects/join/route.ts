import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { joinCode } = await request.json();

    if (!joinCode || typeof joinCode !== "string") {
      return NextResponse.json(
        { error: "Join code is required" },
        { status: 400 }
      );
    }

    const normalizedJoinCode = joinCode.trim().toUpperCase();

    if (!/^[A-Z0-9]{8}$/.test(normalizedJoinCode)) {
      return NextResponse.json(
        { error: "Invalid join code format" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { joinCode: normalizedJoinCode },
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
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid join code. Please check the code and try again." },
        { status: 404 }
      );
    }

    const isAlreadyMember = project.members.some(
      member => member.userId === session.user.id
    );

    if (isAlreadyMember) {
      return NextResponse.json(
        { 
          error: "You are already a member of this project",
          project: { id: project.id }
        },
        { status: 400 }
      );
    }

    await prisma.projectMember.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
      }
    });

    const updatedProject = await prisma.project.findUnique({
      where: { id: project.id },
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
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: "Successfully joined the project team!",
        project: updatedProject
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Project join error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}