import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { PrismaClient } from "@/generated/prisma";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Function to check if email is in allowed CSV
function isEmailAllowed(email: string): boolean {
    try {
        const csvPath = path.join(process.cwd(), 'allowed-emails.csv');
        if (!fs.existsSync(csvPath)) {
            console.warn('allowed-emails.csv not found, allowing all emails for development');
            return true;
        }
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const emails = csvContent.split('\n').map(line => line.trim().toLowerCase()).filter(Boolean);
        return emails.includes(email.toLowerCase());
    } catch (error) {
        console.error('Error reading allowed emails CSV:', error);
        return false;
    }
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development-only",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: { 
        enabled: false,
    },
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, url, token }, request) => {
                // Check if email is allowed
                if (!isEmailAllowed(email)) {
                    throw new Error('Email not authorized. Please contact an organizer.');
                }

                await transporter.sendMail({
                    from: process.env.SMTP_USER,
                    to: email,
                    subject: "Sign in to Meridian Voting",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #333;">Sign in to Meridian Voting</h2>
                            <p>Click the button below to sign in to your account:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign In</a>
                            </div>
                            <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
                            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `,
                });
            },
            expiresIn: 600, // 10 minutes
        })
    ],
    socialProviders: process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? { 
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET, 
        }, 
    } : {},
    user: {
        additionalFields: {
            isAdmin: {
                type: "boolean",
                defaultValue: false,
                input: false, // Don&apos;t allow setting via API
            },
        },
    },
});
