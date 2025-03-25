-- Tabla de temas
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT[] NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  questions_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE
);

-- Tabla de preguntas
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de resultados de quiz
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para incrementar el contador de preguntas
CREATE OR REPLACE FUNCTION increment_question_count(theme_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE themes
  SET questions_count = questions_count + 1
  WHERE id = theme_id;
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar el contador de preguntas
CREATE OR REPLACE FUNCTION decrement_question_count(theme_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE themes
  SET questions_count = GREATEST(questions_count - 1, 0)
  WHERE id = theme_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el número de preguntas de un tema
CREATE OR REPLACE FUNCTION get_questions_count(theme_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count FROM questions WHERE theme_id = $1;
  RETURN count;
END;
$$ LANGUAGE plpgsql;

