import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  title: string;
  description: string;
  max_points: number;
  created_at: string;
}

interface Team {
  id: string;
  team_name: string;
  score: number;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    max_points: 10,
    buggy_code_c: '',
    buggy_code_python: '',
    buggy_code_java: '',
    correct_answer_c: '',
    correct_answer_python: '',
    correct_answer_java: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuestions();
      fetchTeams();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === 'SECRET123') {
      setIsAuthenticated(true);
      toast({
        title: "Access granted",
        description: "Welcome to the admin panel"
      });
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect password",
        variant: "destructive"
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, title, description, max_points, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      });
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('score', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question added successfully"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        max_points: 10,
        buggy_code_c: '',
        buggy_code_python: '',
        buggy_code_java: '',
        correct_answer_c: '',
        correct_answer_python: '',
        correct_answer_java: ''
      });

      // Refresh questions
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription>
              Enter the admin password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Button 
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Add Question Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>
              Create a new debugging challenge for contestants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuestion} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Question title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_points">Max Points</Label>
                  <Input
                    id="max_points"
                    type="number"
                    value={formData.max_points}
                    onChange={(e) => handleInputChange('max_points', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the problem to solve"
                  required
                />
              </div>

              {/* Code sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* C Code */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">C</h3>
                  <div className="space-y-2">
                    <Label htmlFor="buggy_code_c">Buggy Code</Label>
                    <Textarea
                      id="buggy_code_c"
                      value={formData.buggy_code_c}
                      onChange={(e) => handleInputChange('buggy_code_c', e.target.value)}
                      placeholder="Buggy C code"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correct_answer_c">Correct Answer</Label>
                    <Textarea
                      id="correct_answer_c"
                      value={formData.correct_answer_c}
                      onChange={(e) => handleInputChange('correct_answer_c', e.target.value)}
                      placeholder="Fixed C code"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                </div>

                {/* Python Code */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Python</h3>
                  <div className="space-y-2">
                    <Label htmlFor="buggy_code_python">Buggy Code</Label>
                    <Textarea
                      id="buggy_code_python"
                      value={formData.buggy_code_python}
                      onChange={(e) => handleInputChange('buggy_code_python', e.target.value)}
                      placeholder="Buggy Python code"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correct_answer_python">Correct Answer</Label>
                    <Textarea
                      id="correct_answer_python"
                      value={formData.correct_answer_python}
                      onChange={(e) => handleInputChange('correct_answer_python', e.target.value)}
                      placeholder="Fixed Python code"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                </div>

                {/* Java Code */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Java</h3>
                  <div className="space-y-2">
                    <Label htmlFor="buggy_code_java">Buggy Code</Label>
                    <Textarea
                      id="buggy_code_java"
                      value={formData.buggy_code_java}
                      onChange={(e) => handleInputChange('buggy_code_java', e.target.value)}
                      placeholder="Buggy Java code"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correct_answer_java">Correct Answer</Label>
                    <Textarea
                      id="correct_answer_java"
                      value={formData.correct_answer_java}
                      onChange={(e) => handleInputChange('correct_answer_java', e.target.value)}
                      placeholder="Fixed Java code"
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding Question..." : "Add Question"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{question.description}</TableCell>
                    <TableCell>{question.max_points}</TableCell>
                    <TableCell>{new Date(question.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle>Teams ({teams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.team_name}</TableCell>
                    <TableCell>{team.score}</TableCell>
                    <TableCell>{new Date(team.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;