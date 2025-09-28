import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const [totalUsers, totalProjects, totalVotes] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.vote.count()
    ]);

    // Check if voting is enabled (you can store this in env or database)
    const votingEnabled = process.env.VOTING_ENABLED === "true";

    return NextResponse.json({
      totalUsers,
      totalProjects,
      totalVotes,
      votingEnabled
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
