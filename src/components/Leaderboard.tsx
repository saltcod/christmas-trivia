import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";

type LeaderboardPlayer = {
  id: string;
  total_score: number | null;
  auth_user?: {
    email: string;
  } | null;
}

const Leaderboard = () => {
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("*, auth_user:id(email)")
        .order("total_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as LeaderboardPlayer[];
    },
  });

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Leaderboard
        </h3>
        <Trophy className="h-6 w-6 text-yellow-500" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData?.map((player, index) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">#{index + 1}</TableCell>
              <TableCell>{player.auth_user?.email || 'Anonymous'}</TableCell>
              <TableCell className="text-right">{player.total_score || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Leaderboard;