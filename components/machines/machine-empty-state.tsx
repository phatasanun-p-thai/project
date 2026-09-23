"use client";

interface Props {
  variant: "noData" | "noResult";
  isAdmin: boolean;
  onCreate?: () => void;
  onReset?: () => void;
}

export function MachineEmptyState({
  variant,
  isAdmin,
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
            d="M10.3 4.2 3.6 15a2 2 0 0 0 1.7 3h13.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 9v3m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {isNoData ? "ยังไม่มีข้อมูลเครื่องจักร" : "ไม่พบเครื่องจักรตามเงื่อนไข"}
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        {isNoData
          ? "เริ่มเพิ่มเครื่องจักรเครื่องแรก เพื่อใช้บันทึก Alarm และงานบำรุงรักษา"
          : "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูผลลัพธ์อื่น"}
      </p>

      <div className="mt-6 flex justify-center">
        {isNoData && isAdmin && onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            เพิ่มเครื่องจักร
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