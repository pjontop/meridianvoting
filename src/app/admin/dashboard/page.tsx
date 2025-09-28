"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Trophy, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Github,
  Mail,
  Calendar,
  BarChart3
} from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
  joinCode: string;
  createdAt: string;
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    }
  }>;
  _count: {
    votes: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  projectMembers: Array<{
    project: {
      id: string;
      name: string;
    }
  }>;
  votes: Array<{
    project: {
      id: string;
      name: string;
    }
  }>;
}

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalVotes: number;
  votingEnabled: boolean;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [projectsRes, usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/projects"),
        fetch("/api/admin/users"),
        fetch("/api/admin/stats")
      ]);

      if (!projectsRes.ok || !usersRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const [projectsData, usersData, statsData] = await Promise.all([
        projectsRes.json(),
        usersRes.json(),
        statsRes.json()
      ]);

      setProjects(projectsData.projects || []);
      setUsers(usersData.users || []);
      setStats(statsData);
    } catch (err) {
      setError("Failed to load admin data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoting = async () => {
    try {
      const response = await fetch("/api/admin/toggle-voting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !stats?.votingEnabled
        }),
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to toggle voting:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const leaderboard = projects
    .sort((a, b) => b._count.votes - a._count.votes)
    .slice(0, 10);

  const teamsWithMoreThan3 = projects.filter(p => p.members.length > 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Meridian Voting Platform Administration</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleVoting}
                variant={stats?.votingEnabled ? "destructive" : "default"}
              >
                {stats?.votingEnabled ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Close Voting
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Open Voting
                  </>
                )}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">
                  Back to Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVotes || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voting Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={stats?.votingEnabled ? "default" : "secondary"}>
                {stats?.votingEnabled ? "Open" : "Closed"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Alerts for teams with >3 members */}
        {teamsWithMoreThan3.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> {teamsWithMoreThan3.length} team(s) have more than 3 members: {" "}
              {teamsWithMoreThan3.map(team => team.name).join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Voting Leaderboard
              </CardTitle>
              <CardDescription>Top 10 projects by votes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((project, index) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">
                          {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {project._count.votes} votes
                      </Badge>
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {user.projectMembers.length} project{user.projectMembers.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.votes.length}/3 votes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Projects Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>Complete list of submitted projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Project</th>
                    <th className="text-left p-2">Team</th>
                    <th className="text-left p-2">Members</th>
                    <th className="text-left p-2">Votes</th>
                    <th className="text-left p-2">Join Code</th>
                    <th className="text-left p-2">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {project.description}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          {project.members.map((member) => (
                            <div key={member.user.id} className="text-sm">
                              <p className="font-medium">{member.user.name}</p>
                              <p className="text-gray-500">{member.user.email}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={project.members.length > 3 ? "destructive" : "secondary"}
                        >
                          {project.members.length}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {project._count.votes}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {project.joinCode}
                        </code>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="h-3 w-3" />
                            </a>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
