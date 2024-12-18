import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CandyCane, ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      console.log("Starting to fetch questions...");
      const { data, error } = await supabase
        .from("questions")
        .select("*");
      
      if (error) {
        console.error("Supabase error fetching questions:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No data returned from Supabase");
        return [];
      }
      
      console.log("Questions successfully fetched:", data);
      console.log("Number of questions:", data.length);
      return data;
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  console.log("Current question index:", currentQuestionIndex);
  console.log("Current question:", currentQuestion);
  console.log("Total questions available:", questions?.length);

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion?.correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
      
      // Update the user's profile with the new score
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // First get the current profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_score')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Then update with the incremented score
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              total_score: (profile.total_score || 0) + 1
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating score:', updateError);
          } else {
            // Invalidate the userInfo query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ['userInfo'] });
          }
        }
      }

      toast({
        title: "Correct!",
        description: "Well done! 🎄",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${currentQuestion?.correct_answer}`,
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      toast({
        title: "Game Over!",
        description: `Final score: ${score} out of ${questions?.length}`,
      });
    }
  };

  if (error) {
    console.error("Error in component:", error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-white/90 backdrop-blur">
          <CardContent className="p-6">
            <p className="text-red-600 text-center">Error loading questions: {error.message}</p>
            <Button onClick={() => navigate("/")} className="mt-4 w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 flex items-center justify-center">
        <CandyCane className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    console.log("No questions available. questions array:", questions);
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-white/90 backdrop-blur">
          <CardContent className="p-6">
            <p className="text-center">No questions available. Please try again later.</p>
            <Button onClick={() => navigate("/")} className="mt-4 w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-green-700">
              Score: {score}
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {currentQuestion && (
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Question {currentQuestionIndex + 1} of {questions?.length}
                </p>
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="grid gap-3">
                {[currentQuestion.correct_answer, ...currentQuestion.wrong_answers]
                  .sort(() => Math.random() - 0.5)
                  .map((answer) => (
                    <Button
                      key={answer}
                      variant={selectedAnswer === answer ? "default" : "outline"}
                      className={`w-full ${
                        selectedAnswer === answer ? "bg-green-600" : ""
                      }`}
                      onClick={() => handleAnswerSelect(answer)}
                      disabled={selectedAnswer !== null}
                    >
                      {answer}
                    </Button>
                  ))}
              </div>

              {selectedAnswer && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {currentQuestionIndex < questions.length - 1 
                      ? "Next Question" 
                      : "Finish Game"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Game;