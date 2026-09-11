import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseConnection = () => {
  return useQuery({
    queryKey: ['supabase-connection'],
    queryFn: async () => {
      console.log('🔌 Testing Supabase connection...');
      try {
        // Test 1: Basic connection test
        const { data: testData, error: testError } = await supabase
          .from('products')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('❌ Supabase connection test failed:', testError);
          return { 
            status: 'error', 
            error: testError.message,
            details: testError
          };
        }

        console.log('✅ Supabase connection test passed');

        // Test 2: Check if tables exist
        const tables = ['products', 'categories', 'hero_banners', 'brand_sections', 'storefront_settings'];
        const tableStatus: Record<string, boolean> = {};

        for (const table of tables) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('count')
              .limit(1);

            tableStatus[table] = !error;
            if (error) {
              console.error(`❌ Table ${table} error:`, error);
            } else {
              console.log(`✅ Table ${table} accessible`);
            }
          } catch (err) {
            tableStatus[table] = false;
            console.error(`❌ Table ${table} exception:`, err);
          }
        }

        // Test 3: Check data counts
        const dataCounts: Record<string, number> = {};
        
        for (const table of tables) {
          if (tableStatus[table]) {
            try {
              const { data, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

              if (!error && data !== null) {
                dataCounts[table] = data.length || 0;
                console.log(`📊 Table ${table} has ${dataCounts[table]} records`);
              }
            } catch (err) {
              console.error(`❌ Error counting ${table}:`, err);
            }
          }
        }

        return { 
          status: 'success', 
          tableStatus,
          dataCounts,
          message: 'Supabase connection successful'
        };
      } catch (err) {
        console.error('❌ Unexpected error testing Supabase:', err);
        return { 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Unknown error',
          message: 'Failed to test Supabase connection'
        };
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};
