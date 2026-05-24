type DataStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
};

export function DataState({
  loading,
  error,
  empty,
  emptyMessage = "No data yet.",
  children,
}: DataStateProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="glass-panel rounded-[24px] border border-rose-500/20 px-5 py-4 text-sm text-rose-300"
      >
        {error}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="glass-panel rounded-[24px] px-5 py-10 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <span className="inline-flex h-8 w-8 animate-spin-ring rounded-full border-2 border-white/20 border-t-accent-orange" />
    </div>
  );
}
