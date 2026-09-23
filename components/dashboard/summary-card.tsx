import Link from "next/link";

interface Props {
  label: string;
  value: number;
  barClass: string;
  textClass: string;
  href?: string;
}

export function SummaryCard({
  label,
  value,
  barClass,
  textClass,
  href,
}: Props) {
  const content = (
    <div className="relative h-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-300 group-hover:shadow-md">
      <span className={`absolute inset-x-0 top-0 h-1 ${barClass}`} aria-hidden />
      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-500">
            {label}
          </div>
          <div
            className={`mt-1 font-mono text-3xl font-bold leading-none ${textClass}`}
          >
            {value}
          </div>
        </div>
        {href && (
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M5 12h14m0 0-6-6m6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="group block h-full">
      {content}
    </Link>
  );
}