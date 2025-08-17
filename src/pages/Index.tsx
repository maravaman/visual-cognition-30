import React from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import HealthDashboard from '@/components/health/HealthDashboard';

const Index = () => {
  return (
    <AuthWrapper>
      <HealthDashboard />
    </AuthWrapper>
  );
};

export default Index;
