
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SearchAnalyticsData {
  searchQuery: string;
  categoryFilter?: string;
  resultsCount: number;
  filtersApplied?: Record<string, any>;
  searchDurationMs?: number;
  sessionId?: string;
}

interface SearchResultClick {
  resultId: string;
  position: number;
  searchQuery: string;
}

export const useSearchAnalytics = () => {
  const [sessionId] = useState(() => crypto.randomUUID());

  const trackSearch = useCallback(async (analyticsData: SearchAnalyticsData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('search_analytics').insert({
        user_id: user?.id || null,
        search_query: analyticsData.searchQuery,
        category_filter: analyticsData.categoryFilter,
        results_count: analyticsData.resultsCount,
        filters_applied: analyticsData.filtersApplied || {},
        search_duration_ms: analyticsData.searchDurationMs,
        session_id: analyticsData.sessionId || sessionId,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to track search analytics:', error);
    }
  }, [sessionId]);

  const trackResultClick = useCallback(async (clickData: SearchResultClick) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update the most recent search record with click data
      const { data: recentSearch } = await supabase
        .from('search_analytics')
        .select('id')
        .eq('user_id', user?.id || null)
        .eq('search_query', clickData.searchQuery)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentSearch) {
        await supabase
          .from('search_analytics')
          .update({
            clicked_result_id: clickData.resultId,
            clicked_result_position: clickData.position,
          })
          .eq('id', recentSearch.id);
      }
    } catch (error) {
      console.error('Failed to track result click:', error);
    }
  }, [sessionId]);

  return {
    trackSearch,
    trackResultClick,
    sessionId,
  };
};

export const usePopularSearches = () => {
  return useQuery({
    queryKey: ['popular-searches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_searches')
        .select('*')
        .limit(10);

      if (error) throw error;
      return data;
    },
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
    staleTime: 15 * 60 * 1000, // Consider stale after 15 minutes
  });
};
