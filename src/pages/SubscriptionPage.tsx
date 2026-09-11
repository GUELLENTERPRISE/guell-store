
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">GÜELL+ Membership</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <SubscriptionStatus />
        
        <div className="text-center text-muted-foreground">
          <p>Manage your GÜELL+ membership and view subscription benefits.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
