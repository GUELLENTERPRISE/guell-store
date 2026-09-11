
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductSearch from '@/components/ProductSearch';
import FloatingComparisonBar from '@/components/FloatingComparisonBar';
import SEOHead from '@/components/SEOHead';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Buscar: ${query || 'Productos'} - GÜELL`}
        description={`Busca y encuentra productos premium en GÜELL. ${query ? `Resultados para "${query}"` : 'Explora nuestro catálogo completo.'}`}
        keywords={`buscar, búsqueda, productos, ${query}, ${category || 'todas las categorías'}, GÜELL`}
        canonical={`${window.location.origin}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
      />
      <ProductSearch 
        initialQuery={query}
        categoryFilter={category}
        onClose={() => navigate('/')}
      />
      <FloatingComparisonBar />
    </div>
  );
};

export default SearchPage;
