import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Monaco from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  title: string;
  description: string;
  buggy_code_c: string;
  buggy_code_python: string;
  buggy_code_java: string;
  correct_answer_c: string;
  correct_answer_python: string;
  correct_answer_java: string;
  max_points: number;
}

interface Team {
  id: string;
  team_name: string;
  score: number;
}

const normalizeCode = (code: string): string => {
  return code.replace(/\r\n/g, '\n').split('\n').map(line => line.trim()).filter(Boolean).join('\n').trim();
};

const Contest = () => {
  const [language, setLanguage] = useState<'c' | 'python' | 'java'>('python');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const teamId = localStorage.getItem('team_id');
  const teamName = localStorage.getItem('team_name');

  useEffect(() => {
    if (!teamId) {
      navigate('/login');
      return;
    }

    fetchData();
    setupRealtimeLeaderboard();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: questionList, error: questionError }, { data: teamData, error: teamError }] = await Promise.all([
        supabase.from('questions').select('*').order('created_at'),
        supabase.from('teams').select('current_qid').eq('id', teamId).single()
      ]);

      if (questionError) throw questionError;
      if (teamError) throw teamError;

      setQuestions(questionList || []);
      const qid = teamData?.current_qid;

      const index = questionList.findIndex(q => q.id === qid);
      const startIndex = index !== -1 ? index : 0;

      setCurrentQuestionIndex(startIndex);
      setCurrentQuestion(questionList[startIndex]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load contest data.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      const buggyCode = currentQuestion[`buggy_code_${language}` as keyof Question] as string;
      setUserCode(buggyCode || '// No code available');
    }
  }, [currentQuestion, language]);

  const setupRealtimeLeaderboard = async () => {
    const channel = supabase.channel('teams_channel');
    channel
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'teams' },
        (payload: any) => {
          setTeams(prev =>
            prev.map(t => (t.id === payload.new.id ? { ...t, score: payload.new.score } : t)).sort((a, b) => b.score - a.score)
          );
        }
      )
      .subscribe();
    fetchLeaderboard();
  };

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase.from('teams').select('id, team_name, score').order('score', { ascending: false }).limit(10);
    if (!error) setTeams(data || []);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !teamId) return;
    setLoading(true);

    try {
      const correctAnswer = currentQuestion[`correct_answer_${language}` as keyof Question] as string;
      const isCorrect = normalizeCode(userCode) === normalizeCode(correctAnswer);

      const { error: submissionError } = await supabase.from('submissions').insert({
        team_id: teamId,
        question_id: currentQuestion.id,
        language,
        code: userCode,
        is_correct: isCorrect
      });

      if (submissionError) throw submissionError;

      if (isCorrect) {
        const nextQuestion = questions[currentQuestionIndex + 1];
        await supabase.from('teams').update({ current_qid: nextQuestion?.id || null }).eq('id', teamId);
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentQuestion(nextQuestion || null);
        setIsCompleted(!nextQuestion);
        fetchLeaderboard();
        toast({ title: "Correct!", description: `You earned ${currentQuestion.max_points} points!` });
      } else {
        toast({ title: "Incorrect", description: "Try again!", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Submission failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
      e.preventDefault();
      toast({ title: "Action blocked", description: "Copy/paste is disabled", variant: "destructive" });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({ title: "Action blocked", description: "Right-click is disabled", variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background" onKeyDown={handleKeyDown} onContextMenu={handleContextMenu}>
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Debug Contest</h1>
            <p className="text-muted-foreground">Team: {teamName}</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={(val: 'python' | 'c' | 'java') => setLanguage(val)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { localStorage.clear(); navigate('/login'); }} variant="outline">Logout</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {isCompleted && (
              <Card><CardHeader>
                <CardTitle className="text-center text-2xl">🎉 Contest Completed!</CardTitle>
                <p className="text-center text-muted-foreground">You completed all questions.</p>
              </CardHeader></Card>
            )}

            {currentQuestion && !isCompleted && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Question {currentQuestionIndex + 1}: {currentQuestion.title}</span>
                      <Badge variant="secondary">{currentQuestion.max_points} points</Badge>
                    </CardTitle>
                    <p className="text-muted-foreground">{currentQuestion.description}</p>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Buggy Code ({language})</CardTitle></CardHeader>
                  <CardContent>
                    <Monaco height="300px" language={language} value={currentQuestion[`buggy_code_${language}`]} options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }} theme="vs-dark" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-x-4">
                    <CardTitle>Your Solution</CardTitle>
                    <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
                      {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Monaco height="400px" language={language} value={userCode} onChange={val => setUserCode(val || '')} options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }} theme="vs-dark" />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((t, i) => (
                      <TableRow key={t.id} className={t.id === teamId ? "bg-accent" : ""}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{t.team_name}{t.id === teamId && ' (You)'}</TableCell>
                        <TableCell>{t.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contest;
