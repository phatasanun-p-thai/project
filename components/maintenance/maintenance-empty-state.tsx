"use client";

interface Props {
  variant: "noData" | "noResult";
  onCreate?: () => void;
  onReset?: () => void;
}

export function MaintenanceEmptyState({
  variant,
  onCreate,
  onReset,
}: Props) {
  const isNoData = variant === "noData";

  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden
        >
          <path
            d="M9.9 5.1.9 20a2 2 0 0 0 1.7 3h18.8a2 2 0 0 0 1.7-3L14.1 5.1a2 2 0 0 0-4.2 0Zm2.1 7v5m0 3h.01"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {isNoData ? "ยังไม่มีข้อมูล Maintenance" : "ไม่พบ Maintenance ตามเงื่อนไข"}
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        {isNoData
          ? "เริ่มบันทึกงานซ่อมบำรุงเครื่องจักรแรกของคุณ"
          : "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูผลลัพธ์อื่น"}
      </p>

      <div className="mt-6 flex justify-center">
        {isNoData && onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            เพิ่ม Maintenance
          </button>
        ) : (
          !isNoData &&
          onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ล้างตัวกรอง
            </button>
          )
        )}
      </div>
    </div>
  );
}