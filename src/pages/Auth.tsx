import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-green-100 p-8 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-white/90 backdrop-blur">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-700">Welcome to Merry Quiz-tastic!</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </Card>
    </div>
  );
};

export default AuthPage;