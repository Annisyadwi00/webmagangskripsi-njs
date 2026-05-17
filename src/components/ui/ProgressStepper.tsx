type StepStatus = 'done' | 'active' | 'pending' | 'rejected';

type Step = {
  title: string;
  description: string;
  status: StepStatus;
};

type ProgressStepperProps = {
  steps: Step[];
};

function getStepClass(status: StepStatus) {
  if (status === 'done') {
    return {
      circle:
        'border-green-200 bg-green-50 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300',
      card: 'border-green-100 bg-green-50/60 dark:border-green-400/20 dark:bg-green-400/10',
      line: 'bg-green-200 dark:bg-green-400/30',
    };
  }

  if (status === 'active') {
    return {
      circle:
        'border-blue-200 bg-blue-50 text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300',
      card: 'border-blue-100 bg-blue-50/70 dark:border-blue-400/20 dark:bg-blue-400/10',
      line: 'bg-blue-200 dark:bg-blue-400/30',
    };
  }

  if (status === 'rejected') {
    return {
      circle:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300',
      card: 'border-red-100 bg-red-50/70 dark:border-red-400/20 dark:bg-red-400/10',
      line: 'bg-red-200 dark:bg-red-400/30',
    };
  }

  return {
    circle:
      'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500',
    card: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
    line: 'bg-slate-200 dark:bg-slate-700',
  };
}

export default function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <div className="app-card app-card-hover p-6">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
          Progress Magang
        </p>

        <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
          Alur status magang kamu
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Pantau tahapan magang dari pengajuan LOA sampai proses selesai.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const style = getStepClass(step.status);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.title} className="relative flex gap-4">
              {!isLast && (
                <div
                  className={`absolute left-[22px] top-12 h-[calc(100%-1rem)] w-0.5 ${style.line}`}
                />
              )}

              <div
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${style.circle}`}
              >
                {step.status === 'done' ? '✓' : index + 1}
              </div>

              <div
                className={`flex-1 rounded-2xl border p-4 transition-all duration-200 ${style.card}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-black text-slate-950 dark:text-white">
                    {step.title}
                  </h3>

                  {step.status === 'active' && (
                    <span className="app-badge app-badge-blue">Sedang Berjalan</span>
                  )}

                  {step.status === 'done' && (
                    <span className="app-badge app-badge-green">Selesai</span>
                  )}

                  {step.status === 'rejected' && (
                    <span className="app-badge app-badge-red">Ditolak</span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}