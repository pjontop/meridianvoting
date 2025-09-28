import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Trophy, Calendar, Shield } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: Date;
  projectMembers: Array<{
    project: {
      id: string;
      name: string;
    };
  }>;
  votes: Array<{
    project: {
      id: string;
      name: string;
    };
  }>;
}

interface AdminUsersTableProps {
  users: User[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          All Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.name}
                        {user.isAdmin && (
                          <Badge variant="destructive" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.emailVerified ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        {user.votes.length} votes
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {user.projectMembers.length} projects
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
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