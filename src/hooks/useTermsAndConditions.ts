import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TermsAndConditions {
  id: string;
  title: string;
  content: string;
  version: string;
  last_updated: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTermsAndConditions = () => {
  const [terms, setTerms] = useState<TermsAndConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms_and_conditions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setTerms(data);
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast.error('Failed to load terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const updateTerms = async (title: string, content: string, version: string) => {
    setUpdating(true);
    try {
      // First, deactivate current terms
      await supabase
        .from('terms_and_conditions')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new terms
      const { data, error } = await supabase
        .from('terms_and_conditions')
        .insert({
          title,
          content,
          version,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setTerms(data);
      toast.success('Terms and conditions updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating terms:', error);
      toast.error('Failed to update terms and conditions');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  return {
    terms,
    loading,
    updating,
    updateTerms,
    refreshTerms: fetchTerms
  };
};