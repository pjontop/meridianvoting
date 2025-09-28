import { NextRequest } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_SECRET = process.env.BETTER_AUTH_SECRET || "fallback-secret";

export function verifyAdminSession(request: NextRequest): boolean {
    try {
        const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        if (!sessionCookie) return false;

        const sessionObj = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        const { data, signature } = sessionObj;

        // Verify signature
        const hmac = crypto.createHmac('sha256', ADMIN_SESSION_SECRET);
        hmac.update(JSON.stringify(data));
        const expectedSignature = hmac.digest('hex');

        if (signature !== expectedSignature) return false;

        // Check if session is still valid (24 hours)
        const now = Date.now();
        const sessionAge = now - data.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        return sessionAge < maxAge && data.isAdmin === true;
    } catch (error) {
        return false;
    }
}

export async function verifyBetterAuthAdmin(): Promise<boolean> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) return false;

        // Check if user is admin in database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isAdmin: true }
        });

        return user?.isAdmin === true;
    } catch (error) {
        console.error('Better Auth admin check error:', error);
        return false;
    }
}

export async function requireAdminAuth(request: NextRequest) {
    // Check both admin session types
    const hasAdminSession = verifyAdminSession(request);
    const hasBetterAuthAdmin = await verifyBetterAuthAdmin();

    if (!hasAdminSession && !hasBetterAuthAdmin) {
        throw new Error("Unauthorized: Admin access required");
    }
}
