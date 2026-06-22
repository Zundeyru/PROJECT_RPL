interface BadgeProps {
  status: 'aktif' | 'nonaktif' | 'libur';
  size?: 'sm' | 'md';
}

export function Badge({ status, size = 'md' }: BadgeProps) {
  const configs = {
    aktif:    { bg: 'bg-status-aktif',    text: 'text-status-aktif-text',    dot: 'bg-status-aktif-dot',    label: 'Aktif' },
    nonaktif: { bg: 'bg-status-nonaktif', text: 'text-status-nonaktif-text', dot: 'bg-status-nonaktif-dot', label: 'Nonaktif' },
    libur:    { bg: 'bg-status-libur',    text: 'text-status-libur-text',    dot: 'bg-status-libur-dot',    label: 'Libur' },
  };

  const { bg, text, dot, label } = configs[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
