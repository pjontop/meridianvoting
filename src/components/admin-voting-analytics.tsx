import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp } from "lucide-react";

interface Vote {
  id: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  };
}

interface AdminVotingAnalyticsProps {
  votes: Vote[];
}

export function AdminVotingAnalytics({ votes }: AdminVotingAnalyticsProps) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayVotes = votes.filter(vote => 
    new Date(vote.createdAt).toDateString() === today.toDateString()
  ).length;
  
  const yesterdayVotes = votes.filter(vote => 
    new Date(vote.createdAt).toDateString() === yesterday.toDateString()
  ).length;

  const recentVotes = votes.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Voting Analytics
        </CardTitle>
        <CardDescription>
          Recent voting activity and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Today&apos;s Votes</p>
            <p className="text-2xl font-bold">{todayVotes}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Yesterday</p>
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-4 h-4 ${todayVotes >= yesterdayVotes ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-sm font-medium">{yesterdayVotes}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Votes</h4>
          <div className="space-y-2">
            {recentVotes.length > 0 ? (
              recentVotes.map((vote) => (
                <div key={vote.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-sm">
                    <span className="font-medium">{vote.user.name}</span>
                    {" voted for "}
                    <span className="font-medium">{vote.project.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(vote.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No votes yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}