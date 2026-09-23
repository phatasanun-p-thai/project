import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Alarm & Maintenance Management System",
  description:
    "ระบบจัดการข้อมูลเครื่องจักร Alarm และ Maintenance สำหรับระบบ Automation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}