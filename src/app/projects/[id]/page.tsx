import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Github, ExternalLink, Users, Copy, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CopyJoinCode } from "@/components/copy-join-code";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const project = await prisma.project.findUnique({
    where: { id },
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
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
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

  if (!project) {
    notFound();
  }

  const isTeamMember = project.members.some(member => member.userId === session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">Project Details</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                {project.imageUrl && (
                  <div className="mb-6">
                    <Image
                      src={project.imageUrl}
                      alt={project.name}
                      width={600}
                      height={300}
                      className="w-full h-60 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {project._count.votes} votes
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{project.description}</p>

                <div className="flex flex-wrap gap-4">
                  <Button asChild variant="default">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                  
                  <Button asChild variant="outline">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>

                  <Link href="/voting">
                    <Button variant="secondary">
                      <Trophy className="w-4 h-4 mr-2" />
                      Vote for Projects
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.members.map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                      </div>
                      {index === 0 && (
                        <Badge variant="outline" className="ml-auto">Creator</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isTeamMember && (
              <Card>
                <CardHeader>
                  <CardTitle>Share with Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Join Code
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-center font-mono text-lg font-bold tracking-wider">
                          {project.joinCode}
                        </code>
                        <CopyJoinCode joinCode={project.joinCode} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Share this code with your team members
                      </p>
                    </div>

                    <Alert>
                      <AlertDescription>
                        Team members can join your project using this code at{" "}
                        <Link href="/projects/join" className="font-medium underline">
                          /projects/join
                        </Link>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Votes:</span>
                  <span className="font-semibold">{project._count.votes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Members:</span>
                  <span className="font-semibold">{project.members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}