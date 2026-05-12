-- RMKR Supabase Schema

-- 1. Create the `configs` table
CREATE TABLE public.configs (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  apify_token TEXT DEFAULT '',
  apollo_key TEXT DEFAULT '',
  anthropic_key TEXT DEFAULT '',
  gemini_key TEXT DEFAULT '',
  anymailfinder_key TEXT DEFAULT '',
  prospeo_key TEXT DEFAULT '',
  system_prompt TEXT DEFAULT 'You are a helpful, intelligent writing assistant.',
  user_prompt TEXT DEFAULT 'Your task is to take, as input, a bunch of information about a prospect, and then generate a customized, one-line email icebreaker to imply that the rest of my communique is personalized.

You will return your icebreakers in the following JSON format:
{"verdict":"true or false, string", "icebreaker": "Hey {firstName}. Love {thing} — also work in {paraphrasedIndustry}. Wanted to run something by you.", "shortenedCompanyName": "Shortened version of company name"}

Rules:
- Write in a spartan/laconic tone of voice.
- Shorten company names wherever possible ("XYZ" not "XYZ Agency").
- Shorten locations ("San Fran" not "San Francisco").
- If data is of a company not a person, return verdict: "false".',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id)
);

-- 2. Create the `orders` table
CREATE TABLE public.orders (
  id TEXT NOT NULL, -- e.g. "JOB-123456"
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  date TEXT NOT NULL,
  total_leads INTEGER DEFAULT 0,
  verified_emails INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  leads JSONB DEFAULT '[]'::jsonb,
  run_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for `configs`
CREATE POLICY "Users can view own config"
ON public.configs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config"
ON public.configs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config"
ON public.configs FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Create RLS Policies for `orders`
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders"
ON public.orders FOR DELETE
USING (auth.uid() = user_id);

-- 6. Trigger to create a default config when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.configs (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
