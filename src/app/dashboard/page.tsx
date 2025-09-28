import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Trophy, Settings } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meridian</h1>
              <p className="text-gray-600">Peer Voting Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user.name}!</span>
              {user.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/api/auth/sign-out">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/projects/create">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Project
                </CardTitle>
                <CardDescription>
                  Submit your project for peer voting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Share your GitHub repository, demo link, and project details to get started.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/projects/join">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Join Project
                </CardTitle>
                <CardDescription>
                  Join an existing project team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Enter a join code to become part of a project team.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/voting">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Vote & Leaderboard
                </CardTitle>
                <CardDescription>
                  Browse projects and cast your votes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Explore submitted projects and vote for your top 3 favorites.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 text-center">
                Your recent project activity will appear here once you create or join projects.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}