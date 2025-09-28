import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { headers } from "next/headers";
import { 
  projectCreateSchema, 
  validateFileUpload, 
  generateSecureJoinCode, 
  sanitizeHtml,
  logSecurityEvent 
} from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      logSecurityEvent("UNAUTHORIZED_PROJECT_CREATE", {}, request);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const rawData = {
      name: formData.get("name") as string,
      githubUrl: formData.get("githubUrl") as string,
      demoUrl: formData.get("demoUrl") as string,
      description: formData.get("description") as string,
    };

    const validationResult = projectCreateSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      logSecurityEvent("INVALID_PROJECT_DATA", {
        userId: session.user.id,
        errors: validationResult.error.issues
      }, request);
      
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, githubUrl, demoUrl, description } = validationResult.data;
    const imageFile = formData.get("image") as File | null;

    let imageUrl: string | null = null;
    
    if (imageFile && imageFile.size > 0) {
      const fileValidation = validateFileUpload(imageFile);
      
      if (!fileValidation.isValid) {
        return NextResponse.json(
          { error: fileValidation.error },
          { status: 400 }
        );
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const timestamp = Date.now();
      const crypto = await import("crypto");
      const hash = crypto.createHash("sha256").update(buffer).digest("hex").substring(0, 16);
      const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `project-${timestamp}-${hash}.${extension}`;
      
      const fs = await import("fs/promises");
      const path = await import("path");
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      
      imageUrl = `/uploads/${filename}`;
    }

    const existingProjectCount = await prisma.project.count({
      where: {
        members: {
          some: { userId: session.user.id }
        }
      }
    });

    if (existingProjectCount >= 10) {
      logSecurityEvent("PROJECT_LIMIT_EXCEEDED", {
        userId: session.user.id,
        currentCount: existingProjectCount
      }, request);
      
      return NextResponse.json(
        { error: "You cannot create more than 10 projects" },
        { status: 400 }
      );
    }

    let joinCode: string;
    let isUnique = false;
    let attempts = 0;
    
    do {
      joinCode = await generateSecureJoinCode();
      const existing = await prisma.project.findUnique({
        where: { joinCode }
      });
      isUnique = !existing;
      attempts++;
    } while (!isUnique && attempts < 10);

    if (!isUnique) {
      logSecurityEvent("JOIN_CODE_GENERATION_FAILED", {
        userId: session.user.id,
        attempts
      }, request);
      
      return NextResponse.json(
        { error: "Unable to generate unique join code. Please try again." },
        { status: 500 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: sanitizeHtml(name),
        githubUrl,
        demoUrl,
        description: sanitizeHtml(description),
        imageUrl,
        joinCode: joinCode!,
        members: {
          create: {
            userId: session.user.id,
          }
        }
      },
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
        message: "Project created successfully",
        project 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Project creation error:", error);
    logSecurityEvent("PROJECT_CREATE_ERROR", {
      error: error instanceof Error ? error.message : "Unknown error"
    }, request);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}