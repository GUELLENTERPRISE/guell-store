
-- Create search_analytics table to track search queries and results
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  search_query TEXT NOT NULL,
  category_filter TEXT,
  results_count INTEGER NOT NULL DEFAULT 0,
  filters_applied JSONB DEFAULT '{}',
  search_duration_ms INTEGER,
  clicked_result_id UUID,
  clicked_result_position INTEGER,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own search analytics
CREATE POLICY "Users can insert their own search analytics" 
  ON public.search_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to view all search analytics
CREATE POLICY "Admins can view all search analytics" 
  ON public.search_analytics 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- Create indexes for better performance
CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);
CREATE INDEX idx_search_analytics_search_query ON public.search_analytics(search_query);

-- Create popular_searches view for quick access to trending searches
CREATE VIEW public.popular_searches AS
SELECT 
  search_query,
  COUNT(*) as search_count,
  AVG(results_count) as avg_results,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_searched
FROM public.search_analytics 
WHERE created_at >= NOW() - INTERVAL '30 days'
AND search_query IS NOT NULL
AND LENGTH(TRIM(search_query)) > 0
GROUP BY search_query
ORDER BY search_count DESC
LIMIT 100;
