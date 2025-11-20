// components/monitoring/StatCard.tsx
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  children?: ReactNode;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-blue-600',
  children 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`h-8 w-8 ${iconColor}`} />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}