import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Generate a secure random admin password on first run
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(32).toString('hex');

// Simple session management for admin
const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_SECRET = process.env.BETTER_AUTH_SECRET || "fallback-secret";

function createAdminSession(username: string): string {
    const sessionData = {
        username,
        isAdmin: true,
        timestamp: Date.now()
    };
    
    const sessionString = JSON.stringify(sessionData);
    const hmac = crypto.createHmac('sha256', ADMIN_SESSION_SECRET);
    hmac.update(sessionString);
    const signature = hmac.digest('hex');
    
    return Buffer.from(JSON.stringify({ data: sessionData, signature })).toString('base64');
}

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Verify admin credentials
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create admin session
        const sessionToken = createAdminSession(username);
        
        const response = NextResponse.json({ success: true });
        
        // Set secure cookie
        response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/admin"
        });

        return response;
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Utility function to verify admin session (export for use in other admin routes)
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
