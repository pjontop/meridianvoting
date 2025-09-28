import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword: { 
        enabled: false,
    }, 
    magicLink: {
        enabled: true,
        sendMagicLink: async ({ email, url, token }) => {
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: "Sign in to Meridian",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Sign in to Meridian</h2>
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
    },
    emailVerification: {
        enabled: false, // Not needed with magic links
    },
    socialProviders: { 
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
    },
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
