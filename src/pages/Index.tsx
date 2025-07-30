import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Trophy, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TechnoCratz Debugging Contest
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto mt-6">
            Test your debugging skills in a competitive programming environment. 
            Fix buggy code, compete with teams, and climb the leaderboard!
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/login">
              <Button size="lg" className="text-lg px-8">
                Join Contest
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Code className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Multiple Languages</CardTitle>
              <CardDescription>
                Debug code in C, Python, and Java 
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Live Leaderboard</CardTitle>
              <CardDescription>
                Compete in real-time and see your ranking update instantly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Team Competition</CardTitle>
              <CardDescription>
                Register with your team name and work together to solve challenges
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold">Register</h3>
              <p className="text-muted-foreground text-sm">Enter your team name to join</p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold">Debug</h3>
              <p className="text-muted-foreground text-sm">Fix the buggy code provided</p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold">Submit</h3>
              <p className="text-muted-foreground text-sm">Submit your corrected solution</p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto">
                4
              </div>
              <h3 className="font-semibold">Compete</h3>
              <p className="text-muted-foreground text-sm">Earn points and climb the leaderboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
