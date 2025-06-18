import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none'
};

export function Container({ 
  children, 
  className, 
  size = 'xl' 
}: ContainerProps) {
  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      sizeMap[size],
      className
    )}>
      {children}
    </div>
  );
}

export function PageContainer({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <Container size="xl">
        {children}
      </Container>
    </div>
  );
} 