"use client";

interface Props {
  variant: "noData" | "noResult";
  isAdmin: boolean;
  onCreate?: () => void;
  onReset?: () => void;
}

export function AlarmEmptyState({
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
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {isNoData ? "ยังไม่มีข้อมูล Alarm" : "ไม่พบ Alarm ตามเงื่อนไข"}
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        {isNoData
          ? "เริ่มบันทึก Alarm แรกเพื่อติดตามสถานะเครื่องจักรของคุณ"
          : "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูผลลัพธ์อื่น"}
      </p>

      <div className="mt-6 flex justify-center">
        {isNoData && isAdmin && onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            เพิ่ม Alarm
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