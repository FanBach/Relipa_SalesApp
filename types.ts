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

// Complex types for Contract Form S005
export interface ContractEffort {
  role: string; // Item 21
  man_month: number; // Item 22
}

export interface ContractDivision {
  div_name: string; // Item 26
  percentage: number; // Item 27
}

export interface PaymentMilestone {
  date: string; // Item 34
  amount: number; // Item 35
  percent: number; // Item 36
  note: string; // Item 37
}

export interface AllocationItem {
  month: string; // Item 45 (mm/yyyy)
  amount: number; // Item 46
  man_month: number; // Item 47
}

export interface ContractPayer {
  name: string; // Item 30
  email: string; // Item 31
  ratio: number; // Item 58
}

export interface ProjectMilestone {
  name: string; // Item 52
  start_date: string; // Item 53
  end_date: string; // Item 54
}

export interface PeriodicConfig {
  start_date: string; // Item 62
  cycle: number; // Item 63
  amount: number; // Item 64
  note: string; // Item 65
}

export interface Contract {
  id: number;
  code: string; // Item 7
  project_id: number; // Item 4
  client_id: number; // Item 5
  name: string; 
  status_id: number; // Item 13: 1. Đã ký, 2. Dự báo, 3. Chờ ký
  start_date: string; // Item 11
  end_date: string; // Item 12
  total_value: number; // Item 14
  net_revenue: number; 
  currency: string; // Item 15
  currency_unit?: string; // Item 17
  type: string; // Item 6: ODC, Project based
  progress: number;
  
  man_month_sale?: number; // Item 67
  man_month_div?: number; // Item 19
  
  commission_fee?: number; // Item 16
  discount?: number; // Item 18
  other_fee?: number; // Item 68
  
  sign_date?: string; // Item 9
  accepted_date?: string; 
  note?: string; // Item 10
  
  // S005 Advanced Fields
  backlog_link?: string; // Item 24
  is_extend?: boolean; // Item 25
  is_transfer_debt?: boolean; // Item 28, 56
  is_periodic_invoice?: boolean; // Item 33, 61
  
  efforts?: ContractEffort[]; // Item 20-23
  contract_divisions?: ContractDivision[]; // Item 26-27
  payers?: ContractPayer[]; // Item 29-32, 57-60
  periodic_config?: PeriodicConfig; // Item 61-65
  payment_milestones?: PaymentMilestone[]; // Item 34-39
  project_milestones?: ProjectMilestone[]; // Item 51-55
  allocations?: AllocationItem[]; // Item 40-48, 66
}

export interface InvoiceNote {
  id: number;
  content: string;
  created_by: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  project_id: number;
  client_id: number;
  contract_id?: number; // Added
  
  issue_date: string;
  due_date: string;
  
  // Amounts
  contract_value?: number; // Added: Giá trị theo hợp đồng
  deduction?: number; // Added: Giảm trừ công số
  
  subtotal?: number; // Value before VAT (Calculated from contract_value - deduction)
  vat_percent?: number;
  vat_amount?: number;
  total_amount: number; // Value after VAT
  amount_after_vat?: number; // Redundant but consistent with previous types
  paid_amount?: number;
  
  currency: string;
  exchange_rate?: number;
  
  status_id: number; // 1: Draft, 2: Sent, 3: Paid, 4: Overdue, 5: Cancelled
  status_name?: string; // "Đã gửi", "Quá hạn 10 ngày", "Đã thanh toán"
  
  // Content
  content_jp?: string;
  content_vn?: string;
  legal_entity?: string; // e.g., Relipa JP
  
  notes?: InvoiceNote[];
  payment_date?: string;
}

export interface BankStatement {
  id: number;
  document_date: string; // Ngày chứng từ
  document_no: string; // Số chứng từ
  object_code: string; // Mã đối tượng
  object_name: string; // Tên đối tượng
  amount: number;
  currency: string;
  invoice_id?: number; // Linked Invoice
  status: 'Chưa duyệt' | 'Đã duyệt' | 'Chưa xác định';
  description?: string; // Diễn giải
  address?: string;
  bank_account?: string;
  bank_name?: string;
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