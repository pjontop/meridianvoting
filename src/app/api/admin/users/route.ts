import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const users = await prisma.user.findMany({
      include: {
        projectMembers: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        votes: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
