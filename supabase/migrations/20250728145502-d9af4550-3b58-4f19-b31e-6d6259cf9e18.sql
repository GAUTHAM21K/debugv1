-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT UNIQUE NOT NULL,
  score INTEGER DEFAULT 0,
  current_qid UUID,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Anyone can read teams (e.g., for leaderboard)
CREATE POLICY "select all teams" ON teams
  FOR SELECT USING (true);

-- Allow any team to insert themselves
CREATE POLICY "insert new team" ON teams
  FOR INSERT WITH CHECK (true);

-- Only admins can update scores or question progress
CREATE POLICY "admin team update" ON teams
  FOR UPDATE USING (auth.role() = 'admin');

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  buggy_code_c TEXT,
  buggy_code_python TEXT,
  buggy_code_java TEXT,
  correct_answer_c TEXT,
  correct_answer_python TEXT,
  correct_answer_java TEXT,
  max_points INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Full access only to admins
CREATE POLICY "admin only access" ON questions
  FOR ALL USING (auth.role() = 'admin');

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  question_id UUID REFERENCES questions(id),
  language TEXT CHECK (language IN ('c', 'python', 'java')),
  code TEXT,
  is_correct BOOLEAN,
  submitted_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow all teams to submit
CREATE POLICY "anyone can insert submission" ON submissions
  FOR INSERT WITH CHECK (true);

-- Only admins can view all submissions
CREATE POLICY "admin can view submissions" ON submissions
  FOR SELECT USING (auth.role() = 'admin');