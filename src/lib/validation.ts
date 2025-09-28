import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Project name cannot exceed 100 characters")
    .trim(),
  githubUrl: z.string()
    .url("Invalid GitHub URL")
    .refine(url => url.includes("github.com"), "Must be a valid GitHub repository URL"),
  demoUrl: z.string()
    .url("Invalid demo URL"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description cannot exceed 500 characters")
    .trim(),
});

export const joinCodeSchema = z.string()
  .length(8, "Join code must be exactly 8 characters")
  .regex(/^[A-Z0-9]+$/, "Join code can only contain letters and numbers");

export const voteSchema = z.object({
  projectId: z.string()
    .min(1, "Project ID is required"),
  action: z.enum(["add", "remove"]),
});

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (file.size > maxSize) {
    return { isValid: false, error: "File size cannot exceed 5MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Only JPEG, PNG, GIF, and WebP images are allowed" };
  }

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: "Invalid file extension" };
  }

  return { isValid: true };
}

export async function generateSecureJoinCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const crypto = await import("crypto");
  let result = "";
  
  for (let i = 0; i < 8; i++) {
    const randomByte = crypto.randomBytes(1)[0];
    result += chars.charAt(randomByte % chars.length);
  }
  
  return result;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  return `${localPart.substring(0, 2)}${"*".repeat(localPart.length - 2)}@${domain}`;
}

export function logSecurityEvent(event: string, details: Record<string, unknown>, request?: Request) {
  const timestamp = new Date().toISOString();
  const ip = request ? getClientIP(request) : "unknown";
  
  console.warn(`[SECURITY] ${timestamp} - ${event}`, {
    ip,
    ...details,
  });
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return "unknown";
}