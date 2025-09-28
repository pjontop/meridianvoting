import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    requireAdminAuth(request);

    const { enabled } = await request.json();
    
    // Update environment variable (in a real app, you'd use a database or config service)
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
    }

    const lines = envContent.split('\n');
    const votingEnabledIndex = lines.findIndex(line => line.startsWith('VOTING_ENABLED='));
    
    if (votingEnabledIndex >= 0) {
      lines[votingEnabledIndex] = `VOTING_ENABLED=${enabled}`;
    } else {
      lines.push(`VOTING_ENABLED=${enabled}`);
    }

    await fs.writeFile(envPath, lines.join('\n'));

    // Update process.env for immediate effect
    process.env.VOTING_ENABLED = enabled.toString();

    return NextResponse.json({
      message: `Voting ${enabled ? 'enabled' : 'disabled'} successfully`,
      votingEnabled: enabled
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Toggle voting error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
