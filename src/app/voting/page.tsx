import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Trophy, Users, Github, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { VoteButton } from "@/components/vote-button";

// Enable ISR with 60 second revalidation
export const revalidate = 60;

export default async function VotingPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Use cached database queries
  const [projects, userVotes, userProjectIds] = await Promise.all([
    db.getProjectsWithVotes(),
    db.getUserVotes(session.user.id),
    db.getUserProjects(session.user.id)
  ]);

  const userVoteSet = new Set(userVotes.map(vote => vote.projectId));
  const userProjectIdSet = new Set(userProjectIds.map(member => member.projectId));
  const remainingVotes = 3 - userVotes.length;

  const votableProjects = projects.filter(project => !userProjectIdSet.has(project.id));

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
              <h1 className="text-2xl font-bold text-gray-900">Project Voting & Leaderboard</h1>
              <p className="text-gray-600">Vote for your favorite projects (max 3 votes)</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Voting Status</h2>
                <p className="text-gray-600">
                  You have <span className="font-semibold text-blue-600">{remainingVotes}</span> vote{remainingVotes !== 1 ? "s" : ""} remaining
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < userVotes.length ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {remainingVotes === 0 && (
          <Alert className="mb-6">
            <Heart className="w-4 h-4" />
            <AlertDescription>
              You&apos;ve used all 3 of your votes! You can still browse the leaderboard below.
            </AlertDescription>
          </Alert>
        )}

        {votableProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Available</h3>
              <p className="text-gray-600 mb-4">
                There are no projects available for voting at this time.
              </p>
              <Link href="/projects/create">
                <Button>Create a Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const isUserProject = userProjectIdSet.has(project.id);
              const hasVoted = userVoteSet.has(project.id);
              const canVote = !isUserProject && !hasVoted && remainingVotes > 0;

              return (
                <Card key={project.id} className="relative overflow-hidden">
                  {index < 3 && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge 
                        variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}
                        className="font-semibold"
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                  )}

                  <div className="relative">
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        alt={project.name}
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        <Trophy className="w-3 h-3 mr-1" />
                        {project._count.votes}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                      </Badge>
                      {isUserProject && (
                        <Badge variant="outline" className="text-xs">
                          Your Project
                        </Badge>
                      )}
                      {hasVoted && (
                        <Badge variant="default" className="text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Voted
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-3 h-3 mr-1" />
                          Code
                        </a>
                      </Button>
                      
                      <Button asChild variant="outline" size="sm">
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Demo
                        </a>
                      </Button>

                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>

                    <div className="pt-2">
                      {isUserProject ? (
                        <Button disabled variant="outline" className="w-full">
                          Cannot vote for own project
                        </Button>
                      ) : hasVoted ? (
                        <VoteButton
                          projectId={project.id}
                          hasVoted={true}
                          canVote={true}
                          variant="destructive"
                          className="w-full"
                        >
                          <Heart className="w-4 h-4 mr-2 fill-current" />
                          Remove Vote
                        </VoteButton>
                      ) : (
                        <VoteButton
                          projectId={project.id}
                          hasVoted={false}
                          canVote={canVote}
                          variant="default"
                          className="w-full"
                          disabled={!canVote}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {canVote ? "Vote" : remainingVotes === 0 ? "No votes left" : "Vote"}
                        </VoteButton>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}