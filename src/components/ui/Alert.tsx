type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const variantClass: Record<AlertVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

type AlertProps = {
  variant?: AlertVariant;
  children: React.ReactNode;
};

export default function Alert({ variant = 'info', children }: AlertProps) {
  return (
    <div
      className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${variantClass[variant]}`}
    >
      {children}
    </div>
  );
}