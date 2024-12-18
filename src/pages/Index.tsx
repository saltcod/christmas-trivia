import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Play, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Leaderboard from "@/components/Leaderboard";

const Index = () => {
  const navigate = useNavigate();

  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return {
          email: user.email,
          total_score: 0,
          games_played: 0
        };
      }

      return {
        email: user.email,
        ...profile
      };
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8">
      {/* User Profile Section */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{userInfo?.email}</p>
          <p className="text-xs text-gray-500">Total Score: {userInfo?.total_score || 0}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <UserRound className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-red-600">Christmas Trivia</h1>
          <p className="text-lg text-gray-600">Test your holiday knowledge!</p>
        </div>

        {/* Game Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Play Game Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Play className="h-6 w-6 text-green-600" />
                Start Game
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-gray-600">Ready to test your Christmas knowledge?</p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/game')}
              >
                Play Now
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">{userInfo?.games_played || 0}</p>
                  <p className="text-sm text-gray-600">Games Played</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{userInfo?.total_score || 0}</p>
                  <p className="text-sm text-gray-600">Total Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Section */}
        <Leaderboard />
      </div>
    </div>
  );
};

export default Index;