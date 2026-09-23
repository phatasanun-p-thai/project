export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: DonutDatum[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ data, size = 160, strokeWidth = 20 }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulated = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const fraction = total > 0 ? d.value / total : 0;
      const startAt = accumulated;
      accumulated += fraction;
      return {
        ...d,
        fraction,
        dasharray: `${fraction * circumference} ${circumference}`,
        dashoffset: -startAt * circumference,
      };
    });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={`กราฟวงกลม รวม ${total}`}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.dasharray}
              strokeDashoffset={segment.dashoffset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold leading-none text-gray-900">
            {total}
          </span>
          <span className="mt-1 text-xs text-gray-500">ทั้งหมด</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: d.color }}
                aria-hidden
              />
              <span className="truncate text-gray-700">{d.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-mono font-semibold text-gray-900">
                {d.value}
              </span>
              <span className="w-11 text-right font-mono text-xs text-gray-400">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
        {segments.length === 0 && (
          <li className="text-sm text-gray-400">ยังไม่มีข้อมูลในหมวดนี้</li>
        )}
      </ul>
    </div>
  );
}