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
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  iconShape?: 'circle' | 'rounded';
}

const COLOR_MAP = {
  blue: { bg: 'bg-[#EBF5FF]', text: 'text-[#1E88E5]', border: 'border-blue-100' },
  emerald: { bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]', border: 'border-emerald-100' },
  amber: { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]', border: 'border-amber-100' },
  rose: { bg: 'bg-[#FFF1F2]', text: 'text-[#F43F5E]', border: 'border-rose-100' },
  indigo: { bg: 'bg-[#EEF2FF]', text: 'text-[#6366F1]', border: 'border-indigo-100' },
  purple: { bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]', border: 'border-purple-100' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  iconShape = 'rounded',
}: StatCardProps) {
  const c = COLOR_MAP[color];
  const shapeClass = iconShape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <Card className="hover:border-slate-300 transition-all bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md">
      <CardContent className="p-5 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
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
        <div className={`h-10 w-10 ${shapeClass} ${c.bg} ${c.text} ${c.border} border flex items-center justify-center shrink-0`} aria-hidden="true">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
