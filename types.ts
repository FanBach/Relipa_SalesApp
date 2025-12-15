// Matching the Relipa Database Schema and Screenshots

export interface User {
  id: number;
  email: string;
  full_name: string;
  role_main: string;
  is_active: boolean;
  phone: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientPayer {
  name: string;
  email: string;
}

export interface Client {
  id: number;
  code: string;
  name: string;
  tax_code?: string;
  address?: string;
  representative?: string; // Present in UI as "Người đại diện"
  recipient_name?: string; // Maps to UI "Người đại diện" if separate, using representative for now
  lead_source?: string; // stored as string or ID, UI uses ID mapping
  lead_source_id?: string;
  lead_get_id?: number; // User ID who got the lead
  type?: string; // e.g. "Thân thiết", "Mới"
  country: string;
  contact_person: string;
  contact_email: string;
  status_id: number; // 1: Active, 2: Inactive, 3: Lead
  owner_sales_id: number; // Maps to Salesman
  created_at?: string;
  created_by?: string; // Name of creator
  first_signed_date?: string;
  channel?: string; // Telegram, Email
  payer_count?: number;
  payer_name?: string;
  payer_email?: string;
  payers?: ClientPayer[]; // New field for dynamic form
  origin_client_id?: string; // Name of old entity
  noted?: string;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  client_id: number;
  status_id: number; // 1: Planning, 2: Active, 3: Completed, 4: On Hold
  division?: string;
  technology?: string;
  man_month?: number;
  start_date: string;
  end_date: string;
  expected_revenue: number;
  currency: string;
  sales_owner_id: number;
  description?: string;
  div_id?: string; // For UI display
}

export interface Contract {
  id: number;
  code: string;
  project_id: number;
  client_id: number;
  name: string;
  status_id: number; // 1: Chờ ký, 2: Đã ký, 3: Hết hạn
  start_date: string;
  end_date: string;
  total_value: number;
  net_revenue: number;
  currency: string;
  type: string; // ODC, Project base
  progress: number;
  man_month_sale?: number;
  man_month_div?: number;
  commission_fee?: number;
  discount?: number;
  other_fee?: number;
  sign_date?: string;
  accepted_date?: string;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  project_id: number;
  client_id: number;
  issue_date: string;
  due_date: string;
  total_amount: number;
  currency: string;
  status_id: number; // 1: Draft, 2: Sent, 3: Paid, 4: Overdue
  amount_after_vat?: number;
  paid_amount?: number;
}

export interface RevenueAllocation {
  id: number;
  invoice_id: number;
  sales_user_id: number;
  revenue_amount: number;
  percent_of_invoice: number;
  allocation_date: string;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  type: 'info' | 'warning' | 'success';
}

export interface ChangeLog {
  id: number;
  table_name: string; // 'clients', 'projects', etc.
  record_id: number;
  column_name: string; // e.g. "Địa chỉ"
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
  action_type: 'update' | 'create'; 
}

// New Types for specific modules
export interface MonthlyData {
  projectId: number;
  month: number; // 1-12
  value: number;
  type: 'plan' | 'actual' | 'revenue';
}

export interface MasterCategory {
  id: string;
  name: string;
  items: string[];
}

export interface Permission {
  id: number;
  role: string;
  module: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
}

// Helper types for Graph Visualization
export interface GraphNode {
  id: string;
  group: number; // 1: Client, 2: Project, 3: User
  label: string;
  val: number; // Size
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}