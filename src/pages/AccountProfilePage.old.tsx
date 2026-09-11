// DEPRECATED: This component is obsolete. Use /account/dashboard instead.
// This file will be removed in a future version.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AccountProfilePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified account dashboard
    toast.info('Redirecting to unified Account Dashboard...');
    navigate('/account/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default AccountProfilePage;
