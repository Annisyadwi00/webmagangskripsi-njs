import AppIcon from '@/components/ui/AppIcon';

type IconName =
  | 'document'
  | 'calendar'
  | 'check'
  | 'users'
  | 'briefcase'
  | 'message'
  | 'book'
  | 'chart'
  | 'clock'
  | 'warning';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: IconName;
};

export default function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="app-card group p-6 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </h3>
        </div>

        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#1e3a8a] group-hover:bg-[#1e3a8a] group-hover:text-white">
            <AppIcon name={icon} className="h-6 w-6" />
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
  );
}