import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Github, ExternalLink, Calendar, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  githubUrl: string;
  demoUrl: string;
  description: string;
  joinCode: string;
  createdAt: Date;
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  votes: Array<{
    user: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    votes: number;
    members: number;
  };
}

interface AdminProjectsTableProps {
  projects: Project[];
}

export function AdminProjectsTable({ projects }: AdminProjectsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          All Projects ({projects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Join Code</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {project.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.members[0] && (
                      <div>
                        <div className="font-medium">{project.members[0].user.name}</div>
                        <div className="text-sm text-gray-500">
                          {project.members[0].user.email}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        {project._count.votes} votes
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {project._count.members} members
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {project.joinCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/projects/${project.id}`}>
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-3 h-3" />
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}