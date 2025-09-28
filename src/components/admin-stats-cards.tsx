import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, FolderOpen, UserCheck } from "lucide-react";

interface AdminStatsCardsProps {
  totalUsers: number;
  totalProjects: number;
  totalVotes: number;
  totalMemberships: number;
}

export function AdminStatsCards({
  totalUsers,
  totalProjects,
  totalVotes,
  totalMemberships,
}: AdminStatsCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Projects",
      value: totalProjects,
      icon: FolderOpen,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Votes",
      value: totalVotes,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Project Members",
      value: totalMemberships,
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}