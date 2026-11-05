import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const c = COLOR_MAP[color];

  return (
    <Card className="hover:border-slate-300 transition-all">
      <CardContent className="p-5 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 text-[11px] pt-1">
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.value}
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${c.bg} ${c.text} ${c.border} border`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

