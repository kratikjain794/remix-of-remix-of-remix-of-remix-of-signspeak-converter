-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SIGN LIBRARY --------------------------------------------------------
CREATE TABLE public.sign_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gloss TEXT NOT NULL UNIQUE,
  english TEXT NOT NULL,
  hindi TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  video_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  duration NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sign_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sign_videos TO authenticated;
GRANT ALL ON public.sign_videos TO service_role;
ALTER TABLE public.sign_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signs public read" ON public.sign_videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "signs admin write" ON public.sign_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.isl_gloss_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  english_word TEXT,
  hindi_word TEXT,
  isl_gloss TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sign_video_id UUID REFERENCES public.sign_videos(id) ON DELETE SET NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gloss_english ON public.isl_gloss_mappings (lower(english_word));
CREATE INDEX idx_gloss_hindi ON public.isl_gloss_mappings (hindi_word);
GRANT SELECT ON public.isl_gloss_mappings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.isl_gloss_mappings TO authenticated;
GRANT ALL ON public.isl_gloss_mappings TO service_role;
ALTER TABLE public.isl_gloss_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gloss public read" ON public.isl_gloss_mappings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "gloss admin write" ON public.isl_gloss_mappings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.recognition_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_index INTEGER NOT NULL,
  gloss TEXT NOT NULL UNIQUE,
  english TEXT NOT NULL,
  hindi TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recognition_classes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recognition_classes TO authenticated;
GRANT ALL ON public.recognition_classes TO service_role;
ALTER TABLE public.recognition_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes public read" ON public.recognition_classes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "classes admin write" ON public.recognition_classes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- HISTORY -------------------------------------------------------------
CREATE TABLE public.translation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL DEFAULT 'text',
  source_language TEXT NOT NULL DEFAULT 'en',
  original_text TEXT NOT NULL,
  normalized_text TEXT,
  gloss_sequence TEXT[] NOT NULL DEFAULT '{}',
  is_announcement BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.translation_history TO authenticated;
GRANT ALL ON public.translation_history TO service_role;
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own translations" ON public.translation_history FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.recognition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recognized_gloss TEXT NOT NULL,
  english_text TEXT,
  hindi_text TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0,
  model_mode TEXT NOT NULL DEFAULT 'demo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recognition_history TO authenticated;
GRANT ALL ON public.recognition_history TO service_role;
ALTER TABLE public.recognition_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recognitions" ON public.recognition_history FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MODELS & SETTINGS ---------------------------------------------------
CREATE TABLE public.model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  model_type TEXT NOT NULL DEFAULT 'lstm',
  file_path TEXT,
  accuracy NUMERIC,
  status TEXT NOT NULL DEFAULT 'not_loaded',
  is_active BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.model_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.model_versions TO authenticated;
GRANT ALL ON public.model_versions TO service_role;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "models public read" ON public.model_versions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "models admin write" ON public.model_versions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.system_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.system_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SEED ----------------------------------------------------------------
INSERT INTO public.system_settings (key, value, description) VALUES
  ('ISL_MODEL_MODE', 'demo', 'Active recognition model mode: demo | pytorch | transformer'),
  ('ISL_MODEL_PATH', 'models/isl_model.pth', 'Path to the trained PyTorch weights'),
  ('SEQUENCE_LENGTH', '30', 'Number of landmark frames per recognition window'),
  ('CONFIDENCE_THRESHOLD', '0.70', 'Minimum confidence before a prediction is accepted'),
  ('PREDICTION_INTERVAL', '1200', 'Milliseconds between recognition requests'),
  ('WHISPER_MODEL', 'google/gemini-3.5-transcribe', 'Speech recognition model identifier');

INSERT INTO public.sign_videos (gloss, english, hindi, category, description, keywords) VALUES
  ('HELLO','hello','नमस्ते','greetings','Standard ISL greeting.', ARRAY['hi','hello','greeting','namaste']),
  ('THANK-YOU','thank you','धन्यवाद','greetings','Expression of thanks.', ARRAY['thanks','thank you','dhanyavaad']),
  ('PLEASE','please','कृपया','greetings','Polite request marker.', ARRAY['please','kripya']),
  ('GOOD','good','अच्छा','daily conversation','Positive quality.', ARRAY['good','fine','accha']),
  ('MORNING','morning','सुबह','time','Time of day.', ARRAY['morning','subah']),
  ('YES','yes','हाँ','daily conversation','Affirmation.', ARRAY['yes','haan']),
  ('NO','no','नहीं','daily conversation','Negation.', ARRAY['no','nahi']),
  ('HELP','help','मदद','emergency','Request for assistance.', ARRAY['help','madad']),
  ('WATER','water','पानी','food','Drinking water.', ARRAY['water','pani']),
  ('FOOD','food','खाना','food','Meal or food.', ARRAY['food','khana','eat']),
  ('TRAIN','train','ट्रेन','railway','Railway train.', ARRAY['train','rail','gaadi']),
  ('STATION','station','स्टेशन','railway','Railway station.', ARRAY['station','platform']),
  ('PLATFORM','platform','प्लेटफार्म','railway','Railway platform.', ARRAY['platform']),
  ('ARRIVE','arrive','आना','travel','To arrive.', ARRAY['arrive','arrival','aana']),
  ('DEPART','depart','जाना','travel','To depart.', ARRAY['depart','departure','leave']),
  ('LATE','late','देर','time','Delayed.', ARRAY['late','delay','der']),
  ('HOSPITAL','hospital','अस्पताल','healthcare','Hospital building.', ARRAY['hospital','aspatal','clinic']),
  ('DOCTOR','doctor','डॉक्टर','healthcare','Medical doctor.', ARRAY['doctor','daktar']),
  ('SCHOOL','school','स्कूल','education','School.', ARRAY['school','vidyalaya']),
  ('TEACHER','teacher','शिक्षक','education','Teacher.', ARRAY['teacher','shikshak']),
  ('BOOK','book','किताब','education','Book.', ARRAY['book','kitab']),
  ('HOME','home','घर','places','Home or house.', ARRAY['home','house','ghar']),
  ('STOP','stop','रुको','directions','Stop moving.', ARRAY['stop','ruko','halt']),
  ('WAIT','wait','इंतज़ार','directions','Wait here.', ARRAY['wait','intezaar']),
  ('GO','go','जाओ','directions','Go ahead.', ARRAY['go','jao']),
  ('NAME','name','नाम','people','Name of a person.', ARRAY['name','naam']),
  ('YOU','you','आप','people','Second person.', ARRAY['you','aap','tum']),
  ('I','I','मैं','people','First person.', ARRAY['i','me','my','main']),
  ('WHAT','what','क्या','questions','Question word.', ARRAY['what','kya']),
  ('WHERE','where','कहाँ','questions','Question word.', ARRAY['where','kahan']),
  ('WHEN','when','कब','questions','Question word.', ARRAY['when','kab']),
  ('HOW','how','कैसे','questions','Question word.', ARRAY['how','kaise']),
  ('ONE','one','एक','numbers','Number 1.', ARRAY['1','one','ek']),
  ('TWO','two','दो','numbers','Number 2.', ARRAY['2','two','do']),
  ('THREE','three','तीन','numbers','Number 3.', ARRAY['3','three','teen']),
  ('FOUR','four','चार','numbers','Number 4.', ARRAY['4','four','char']),
  ('FIVE','five','पाँच','numbers','Number 5.', ARRAY['5','five','panch']),
  ('SORRY','sorry','माफ़ कीजिए','greetings','Apology.', ARRAY['sorry','maaf']),
  ('TICKET','ticket','टिकट','travel','Travel ticket.', ARRAY['ticket','tikat']),
  ('TIME','time','समय','time','Time.', ARRAY['time','samay']);

INSERT INTO public.isl_gloss_mappings (english_word, hindi_word, isl_gloss, category, sign_video_id, priority)
SELECT sv.english, sv.hindi, sv.gloss, sv.category, sv.id, 10 FROM public.sign_videos sv;

INSERT INTO public.isl_gloss_mappings (english_word, hindi_word, isl_gloss, category, sign_video_id, priority)
SELECT k.word, NULL, sv.gloss, sv.category, sv.id, 50
FROM public.sign_videos sv, LATERAL unnest(sv.keywords) AS k(word)
WHERE lower(k.word) <> lower(sv.english);

INSERT INTO public.recognition_classes (class_index, gloss, english, hindi)
SELECT row_number() OVER (ORDER BY gloss) - 1, gloss, english, hindi
FROM public.sign_videos
WHERE gloss IN ('HELLO','THANK-YOU','PLEASE','YES','NO','HELP','WATER','FOOD','TRAIN','STATION','HOSPITAL','SCHOOL','HOME','STOP','WAIT','GO','GOOD','MORNING','NAME','YOU','I');

INSERT INTO public.model_versions (name, version, model_type, file_path, accuracy, status, is_active, notes) VALUES
  ('ISL Demo Classifier', '0.1', 'demo', NULL, NULL, 'loaded', true, 'Deterministic demo classifier over the seeded vocabulary. Not a trained model - for interface demonstration only.'),
  ('ISL LSTM', '1.0', 'lstm', 'models/isl_model.pth', NULL, 'not_loaded', false, 'Upload trained weights and switch ISL_MODEL_MODE to pytorch to activate.');
