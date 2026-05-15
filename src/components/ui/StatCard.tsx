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
    <div className="app-card app-card-hover animate-fade-up group p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {value}
          </h3>
        </div>

        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#1e3a8a] transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#1e3a8a] group-hover:text-white dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:group-hover:bg-blue-400 dark:group-hover:text-slate-950">
            <AppIcon name={icon} className="h-6 w-6" />
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}