
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TaxRate {
  id: string;
  country: string;
  state?: string;
  rate: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export const useTaxRates = () => {
  const taxRatesQuery = useQuery({
    queryKey: ['tax-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data as TaxRate[];
    },
  });

  const getTaxRate = (country: string, state?: string): number => {
    if (!taxRatesQuery.data) return 0.08; // Default 8%

    // Try to find specific state rate first
    if (state) {
      const stateRate = taxRatesQuery.data.find(
        rate => rate.country === country && rate.state === state
      );
      if (stateRate) return stateRate.rate;
    }

    // Fall back to country rate
    const countryRate = taxRatesQuery.data.find(
      rate => rate.country === country && !rate.state
    );
    
    return countryRate?.rate || 0.08; // Default 8%
  };

  return {
    taxRates: taxRatesQuery.data || [],
    isLoading: taxRatesQuery.isLoading,
    getTaxRate,
  };
};
