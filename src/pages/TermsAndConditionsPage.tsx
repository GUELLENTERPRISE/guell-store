
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTermsAndConditions } from '@/hooks/useTermsAndConditions';
import LoadingState from '@/components/LoadingState';

const TermsAndConditionsPage = () => {
  const navigate = useNavigate();
  const { terms, loading } = useTermsAndConditions();

  if (loading) {
    return <LoadingState />;
  }

  if (!terms) {
    return (
      <div className="min-h-screen bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Terms and Conditions are not available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{terms.title}</h1>
          <p className="text-muted-foreground mt-2">
            Version {terms.version} • Last updated: {new Date(terms.last_updated).toLocaleDateString()}
          </p>
        </div>

        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {terms.content}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
