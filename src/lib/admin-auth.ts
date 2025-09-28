import { NextRequest } from "next/server";
import crypto from "crypto";

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

export function requireAdminAuth(request: NextRequest) {
    if (!verifyAdminSession(request)) {
        throw new Error("Unauthorized: Admin access required");
    }
}
