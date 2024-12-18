import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CandyCane, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      console.log("Fetching questions...");
      const { data, error } = await supabase
        .from("questions")
        .select("*");
      
      if (error) {
        console.error("Error fetching questions:", error);
        throw error;
      }
      
      console.log("Questions fetched:", data);
      return data;
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  console.log("Current question:", currentQuestion);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentQuestion?.correct_answer) {
      setScore(score + 1);
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-white/90 backdrop-blur">
          <CardContent className="p-6">
            <p className="text-red-600 text-center">Error loading questions. Please try again.</p>
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-white/90 backdrop-blur">
          <CardContent className="p-6">
            <p className="text-center">No questions available.</p>
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
          <div className="text-lg font-semibold text-green-700">
            Score: {score}
          </div>
        </div>

        {currentQuestion && (
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
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