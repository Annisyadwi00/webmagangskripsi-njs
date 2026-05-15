type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const variantClass: Record<AlertVariant, string> = {
  success:
    'border-green-200 bg-green-50 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300',
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-400/20 dark:bg-yellow-400/10 dark:text-yellow-300',
  info:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300',
};

type AlertProps = {
  variant?: AlertVariant;
  children: React.ReactNode;
};

export default function Alert({ variant = 'info', children }: AlertProps) {
  return (
    <div
      className={`animate-scale-in mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${variantClass[variant]}`}
    >
      {children}
    </div>
  );
}