export type QuizTheme = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string[];
  created_by: string;
  created_at: string;
  questions_count: number;
  is_public: boolean;
};

export type Question = {
  id: string;
  theme_id: string;
  text: string;
  options: QuestionOption[];
  created_by: string;
  created_at: string;
};

export type QuestionOption = {
  id: string;
  text: string;
  is_correct: boolean;
};

export type QuizResult = {
  id: string;
  theme_id: string;
  theme_name: string;
  user_id: string;
  score: number;
  total_questions: number;
  created_at: string;
};
