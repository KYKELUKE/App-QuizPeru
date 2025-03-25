-- Esquema de base de datos para Supabase

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
  SELECT COUNT(*) INTO count
  FROM questions
  WHERE theme_id = $1;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de un usuario
CREATE OR REPLACE FUNCTION get_user_stats(user_id TEXT)
RETURNS TABLE (
  quizzes_taken INTEGER,
  correct_answers INTEGER,
  total_questions INTEGER,
  average_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS quizzes_taken,
    SUM(score)::INTEGER AS correct_answers,
    SUM(total_questions)::INTEGER AS total_questions,
    CASE
      WHEN SUM(total_questions) > 0 THEN
        (SUM(score) * 100.0 / SUM(total_questions))
      ELSE 0
    END AS average_score
  FROM quiz_results
  WHERE quiz_results.user_id = $1;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad RLS (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Políticas para temas
CREATE POLICY "Temas públicos visibles para todos" ON themes
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Los usuarios pueden ver sus propios temas" ON themes
  FOR SELECT USING (created_by = auth.uid()::TEXT);

CREATE POLICY "Los usuarios pueden crear sus propios temas" ON themes
  FOR INSERT WITH CHECK (created_by = auth.uid()::TEXT);

CREATE POLICY "Los usuarios pueden actualizar sus propios temas" ON themes
  FOR UPDATE USING (created_by = auth.uid()::TEXT);

CREATE POLICY "Los usuarios pueden eliminar sus propios temas" ON themes
  FOR DELETE USING (created_by = auth.uid()::TEXT);

-- Políticas para preguntas
CREATE POLICY "Los usuarios pueden ver preguntas de temas públicos" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM themes
      WHERE themes.id = questions.theme_id
      AND themes.is_public = TRUE
    )
  );

CREATE POLICY "Los usuarios pueden ver sus propias preguntas" ON questions
  FOR SELECT USING (created_by = auth.uid()::TEXT);

CREATE POLICY "Los usuarios pueden crear sus propias preguntas" ON questions
  FOR INSERT WITH CHECK (created_by = auth.uid()::TEXT);

CREATE POLICY "Los usuarios pueden actualizar sus propias preguntas" ON questions
  FOR UPDATE USING (created_by = auth.uid()::TEXT);

CREATE POLICY "Los usuarios pueden eliminar sus propias preguntas" ON questions
  FOR DELETE USING (created_by = auth.uid()::TEXT);

-- Políticas para resultados de quiz
CREATE POLICY "Los usuarios pueden ver sus propios resultados" ON quiz_results
  FOR SELECT USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Los usuarios pueden crear sus propios resultados" ON quiz_results
  FOR INSERT WITH CHECK (user_id = auth.uid()::TEXT);

