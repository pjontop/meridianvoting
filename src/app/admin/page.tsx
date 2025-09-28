import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Download,
  Shield,
  BarChart3,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { AdminStatsCards } from "@/components/admin-stats-cards";
import { AdminProjectsTable } from "@/components/admin-projects-table";
import { AdminUsersTable } from "@/components/admin-users-table";
import { AdminVotingAnalytics } from "@/components/admin-voting-analytics";

const prisma = new PrismaClient();

export default async function AdminPanel() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  if (!(session.user as any).isAdmin) {
    redirect("/dashboard");
  }

  const [stats, projects, users, votes] = await Promise.all([
    prisma.$transaction([
      prisma.user.count(),
      prisma.project.count(),
      prisma.vote.count(),
      prisma.projectMember.count(),
    ]),
    prisma.project.findMany({
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
            votes: true,
            members: true,
          }
        }
      },
      orderBy: [
        { votes: { _count: "desc" } },
        { createdAt: "desc" }
      ]
    }),
    prisma.user.findMany({
      include: {
        projectMembers: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        votes: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.vote.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        project: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const [totalUsers, totalProjects, totalVotes, totalMemberships] = stats;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Admin Panel
                </h1>
                <p className="text-gray-600">Manage users, projects, and voting analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            You have administrative access to all platform data. Please use these tools responsibly.
          </AlertDescription>
        </Alert>

        <AdminStatsCards
          totalUsers={totalUsers}
          totalProjects={totalProjects}
          totalVotes={totalVotes}
          totalMemberships={totalMemberships}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Administrative actions and data exports
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export All Data (CSV)
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Voting Results
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Manage Voting Periods
              </Button>
            </CardContent>
          </Card>

          <AdminVotingAnalytics votes={votes} />
        </div>

        <AdminProjectsTable projects={projects} />
        
        <AdminUsersTable users={users} />
      </main>
    </div>
  );
}