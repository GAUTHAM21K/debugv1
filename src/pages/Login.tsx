import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // First check if team exists
      const { data: existingTeam, error: fetchError } = await supabase
        .from('teams')
        .select('id, team_name, current_qid')
        .eq('team_name', teamName.trim())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let teamId;
      let currentQid = null;

      if (existingTeam) {
        // Team exists, use existing team_id
        teamId = existingTeam.id;
        currentQid = existingTeam.current_qid || null;

        toast({
          title: "Welcome back!",
          description: `Logged in as ${teamName}`
        });
      } else {
        // Fetch first question
        const { data: firstQuestion, error: questionError } = await supabase
          .from('questions')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (questionError) throw questionError;

        currentQid = firstQuestion?.id || null;

        // Create new team with initial current_qid
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert({ team_name: teamName.trim(), current_qid: currentQid })
          .select('id')
          .single();

        if (createError) throw createError;

        teamId = newTeam.id;

        toast({
          title: "Team created!",
          description: `Welcome to the contest, ${teamName}!`
        });
      }

      // Store team info in localStorage
      localStorage.setItem('team_id', teamId);
      localStorage.setItem('team_name', teamName.trim());

      if (currentQid) {
        localStorage.setItem('current_qid', currentQid);
      }

      // Navigate to contest page
      navigate('/contest');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Debug Contest</CardTitle>
          <CardDescription>
            Enter your team name to join the debugging contest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                type="text"
                placeholder="Enter your team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Join Contest"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
