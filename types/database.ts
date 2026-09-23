export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = "admin" | "technician";
export type MachineStatus = "Running" | "Stop" | "Alarm" | "Maintenance";
export type AlarmStatus = "Open" | "In Progress" | "Closed";
export type MaintenanceStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  machine_id: string;
  machine_name: string;
  machine_type: string;
  location: string;
  status: MachineStatus;
  created_at: string;
  updated_at: string;
}

export interface Alarm {
  id: string;
  machine_id: string;
  alarm_code: string;
  alarm_description: string;
  cause: string | null;
  occurred_at: string;
  status: AlarmStatus;
  created_at: string;
  updated_at: string;
}

/** Alarm ที่ join ข้อมูลเครื่องจักร (supabase select "*, machines(*)") */
export type AlarmWithMachine = Alarm & {
  machines: Machine | null;
};

export interface MaintenanceRecord {
  id: string;
  machine_id: string;
  maintenance_type: string;
  problem: string;
  action_taken: string;
  technician_id: string | null;
  date: string;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
}

/** Maintenance ที่ join ข้อมูลเครื่องจักรและช่างเทคนิค (select "*, machines(*), technician:profiles(*)") */
export type MaintenanceWithRelations = MaintenanceRecord & {
  machines: Machine | null;
  technician: Profile | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Role;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: Role;
          created_at: string;
          updated_at: string;
        };
        Update: Partial<{
          id: string;
          email: string;
          full_name: string;
          role: Role;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      machines: {
        Row: {
          id: string;
          machine_id: string;
          machine_name: string;
          machine_type: string;
          location: string;
          status: MachineStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          machine_id: string;
          machine_name: string;
          machine_type: string;
          location: string;
          status: MachineStatus;
          created_at: string;
          updated_at: string;
        };
        Update: Partial<{
          id: string;
          machine_id: string;
          machine_name: string;
          machine_type: string;
          location: string;
          status: MachineStatus;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      alarms: {
        Row: {
          id: string;
          machine_id: string;
          alarm_code: string;
          alarm_description: string;
          cause: string | null;
          occurred_at: string;
          status: AlarmStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          machine_id: string;
          alarm_code: string;
          alarm_description: string;
          cause?: string | null;
          occurred_at: string;
          status: AlarmStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          machine_id: string;
          alarm_code: string;
          alarm_description: string;
          cause: string | null;
          occurred_at: string;
          status: AlarmStatus;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "alarms_machine_id_fkey";
            columns: ["machine_id"];
            isOneToOne: false;
            referencedRelation: "machines";
            referencedColumns: ["id"];
          }
        ];
      };
      maintenance_records: {
        Row: {
          id: string;
          machine_id: string;
          maintenance_type: string;
          problem: string;
          action_taken: string;
          technician_id: string | null;
          date: string;
          status: MaintenanceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          machine_id: string;
          maintenance_type: string;
          problem: string;
          action_taken: string;
          technician_id?: string | null;
          date: string;
          status: MaintenanceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          machine_id: string;
          maintenance_type: string;
          problem: string;
          action_taken: string;
          technician_id: string | null;
          date: string;
          status: MaintenanceStatus;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "maintenance_records_machine_id_fkey";
            columns: ["machine_id"];
            isOneToOne: false;
            referencedRelation: "machines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_records_technician_id_fkey";
            columns: ["technician_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
