
import { Client, Invoice, Project, RevenueAllocation, User, Notification, GraphData, Contract, MonthlyData, MasterCategory, Permission, ChangeLog, BankStatement } from '../types';

const USERS: User[] = [
  { id: 1, email: "duc.tran@relipa.com", full_name: "Tran Van Duc", role_main: "Sale Manager", is_active: true, phone: "+84-999-0101", created_at: "10:00 AM, 21/05/2025", updated_at: "10:00 AM, 21/05/2025" },
  { id: 2, email: "sarah.smith@relipa.com", full_name: "Sarah Smith", role_main: "Account Manager", is_active: true, phone: "+1-555-0102", created_at: "09:00 AM, 15/05/2025", updated_at: "09:00 AM, 15/05/2025" },
  { id: 3, email: "john.doe@relipa.com", full_name: "John Doe", role_main: "Salesman", is_active: true, phone: "+1-555-0103", created_at: "08:00 AM, 10/05/2025", updated_at: "08:00 AM, 10/05/2025" },
];

const CLIENTS: Client[] = [
  { 
    id: 1, code: "FPT001", name: "FPT Software", type: "Thân thiết", country: "Vietnam", address: "Hanoi, Vietnam", 
    contact_person: "Mr. Binh", representative: "Nguyen Van A", recipient_name: "Nguyen Van A", contact_email: "binh@fsoft.com", status_id: 1, 
    owner_sales_id: 1, lead_source: "MKT", lead_get_id: 1, created_at: "18/05/2025", created_by: "Tran Van Duc", first_signed_date: "18/05/2025",
    channel: "Telegram", payer_count: 2, payer_name: "Nguyen Van A", payer_email: "nguyen@email.com",
    tax_code: "0101234567", noted: "Khách hàng VIP, thanh toán đúng hạn."
  },
  { 
    id: 2, code: "CL-002", name: "Globex Inc", type: "Mới", country: "Germany", address: "Berlin, DE", 
    contact_person: "Hans Gruber", representative: "Hans Gruber", recipient_name: "Hans Gruber", contact_email: "hans@globex.de", status_id: 1, 
    owner_sales_id: 2, lead_source: "Web", lead_get_id: 2, created_at: "20/05/2025", created_by: "Sarah Smith", first_signed_date: "21/05/2025",
    channel: "Email", payer_count: 1, payer_name: "Accounting Dept", payer_email: "acc@globex.de",
    tax_code: "DE987654321", noted: ""
  },
  { 
    id: 3, code: "CL-003", name: "Stark Ind", type: "Thân thiết", country: "USA", address: "NY, USA", 
    contact_person: "Tony S.", representative: "Pepper Potts", recipient_name: "Pepper Potts", contact_email: "tony@stark.com", status_id: 1, 
    owner_sales_id: 1, lead_source: "Event", lead_get_id: 3, created_at: "22/05/2025", created_by: "John Doe", first_signed_date: "25/05/2025",
    channel: "Slack", payer_count: 3, payer_name: "Happy Hogan", payer_email: "happy@stark.com",
    tax_code: "US123456789", noted: "Requires NDA."
  },
];

const PROJECTS: Project[] = [
  { id: 1, code: "FPT-MBA-001", name: "Mobile banking app", client_id: 1, status_id: 2, division: "Division 1", technology: "Blockchain", man_month: 50, start_date: "18/05/2025", end_date: "18/05/2026", expected_revenue: 500000.00, currency: "USD", sales_owner_id: 1, div_id: "Division 1" },
  { id: 2, code: "PRJ-Beta", name: "Cloud Migration", client_id: 2, status_id: 2, division: "Division 2", technology: "AWS", man_month: 20, start_date: "2023-03-01", end_date: "2023-09-30", expected_revenue: 85000.00, currency: "EUR", sales_owner_id: 2, div_id: "Division 2" },
  { id: 3, code: "PRJ-Gamma", name: "AI Integration", client_id: 3, status_id: 1, division: "Division 1", technology: "Python/AI", man_month: 120, start_date: "2023-10-01", end_date: "2024-04-01", expected_revenue: 250000.00, currency: "USD", sales_owner_id: 1, div_id: "Division 1" },
];

const CONTRACTS: Contract[] = [
  { id: 1, code: "MBA-C-001", project_id: 1, client_id: 1, name: "Hợp đồng Mobile Banking", status_id: 2, start_date: "18/05/2025", end_date: "18/05/2026", total_value: 500000, net_revenue: 450000, currency: "USD", type: "ODC", progress: 50, sign_date: "15/05/2025", accepted_date: "15/05/2025", commission_fee: 10000, discount: 5000, other_fee: 0, is_transfer_debt: true, is_periodic_invoice: true },
  { id: 2, code: "MBA-C-002", project_id: 1, client_id: 1, name: "Hợp đồng Maintenance", status_id: 1, start_date: "19/05/2026", end_date: "19/05/2027", total_value: 120000, net_revenue: 120000, currency: "USD", type: "Project base", progress: 0, sign_date: "", accepted_date: "", commission_fee: 0, discount: 0, other_fee: 0 },
];

const INVOICES: Invoice[] = [
  { id: 1, invoice_no: "FPT-MBA-001", project_id: 1, client_id: 1, issue_date: "18/05/2025", due_date: "18/05/2025", total_amount: 500000.00, currency: "USD", status_id: 2, status_name: "Đã gửi", amount_after_vat: 550000, paid_amount: 550000, exchange_rate: 2000 },
  { id: 2, invoice_no: "FPT-MBA-002", project_id: 1, client_id: 1, issue_date: "18/05/2025", due_date: "18/05/2025", total_amount: 500000.00, currency: "USD", status_id: 4, status_name: "Quá hạn 10 ngày", amount_after_vat: 550000, paid_amount: 0 },
  { id: 3, invoice_no: "FPT-MBA-003", project_id: 1, client_id: 1, issue_date: "18/05/2025", due_date: "18/05/2025", total_amount: 500000.00, currency: "USD", status_id: 3, status_name: "Đã thanh toán", amount_after_vat: 550000, paid_amount: 550000, payment_date: "18/05/2025" },
  { id: 4, invoice_no: "FPT-MBA-004", project_id: 1, client_id: 1, issue_date: "18/05/2025", due_date: "18/05/2025", total_amount: 500000.00, currency: "USD", status_id: 3, status_name: "Đã thanh toán", amount_after_vat: 550000, paid_amount: 550000 },
  { id: 5, invoice_no: "FPT-MBA-005", project_id: 1, client_id: 1, issue_date: "18/05/2025", due_date: "18/05/2025", total_amount: 500000.00, currency: "USD", status_id: 4, status_name: "Quá hạn 20 ngày", amount_after_vat: 550000, paid_amount: 0 },
  { id: 6, invoice_no: "FPT-MBA-006", project_id: 1, client_id: 1, issue_date: "18/05/2025", due_date: "18/05/2025", total_amount: 500000.00, currency: "USD", status_id: 5, status_name: "Đã huỷ", amount_after_vat: 550000, paid_amount: 0 },
  { id: 7, invoice_no: "FPT-MBA-007", project_id: 1, client_id: 1, issue_date: "18/05/2025", due_date: "18/05/2025", total_amount: 500000.00, currency: "USD", status_id: 1, status_name: "Đã tạo", amount_after_vat: 550000, paid_amount: 0 },
];

const BANK_STATEMENTS: BankStatement[] = [
  { id: 1, document_date: '23/6/2025', document_no: 'MBA-C-001', object_code: 'FPT-001', object_name: 'FPT Software', amount: 500000.00, currency: 'USD', invoice_id: 1, status: 'Chưa duyệt', description: 'Thanh toan dot 1' },
  { id: 2, document_date: '23/6/2025', document_no: 'MBA-C-001', object_code: 'FPT-001', object_name: 'FPT Software', amount: 500000.00, currency: 'USD', invoice_id: undefined, status: 'Chưa xác định', description: 'Chuyen khoan' },
  { id: 3, document_date: '23/6/2025', document_no: 'MBA-C-001', object_code: 'FPT-001', object_name: 'FPT Software', amount: 500000.00, currency: 'USD', invoice_id: 3, status: 'Đã duyệt', description: 'Thanh toan dot 2' },
];

const REVENUE_ALLOCATIONS: RevenueAllocation[] = [
  { id: 1, invoice_id: 1, sales_user_id: 1, revenue_amount: 5000.00, percent_of_invoice: 10.00, allocation_date: "2023-05-05" },
];

const NOTIFICATIONS: Notification[] = [
  { id: 1, title: "Hoá đơn quá hạn", content: "Phát sinh thêm 2 hoá đơn quá hạn thanh toán 10 ngày, vui lòng kiểm tra", is_read: false, created_at: "2025-06-25T10:00:00", type: 'warning' },
  { id: 2, title: "Hoá đơn mới", content: "2 hoá đơn mới được tạo tự động, vui lòng kiểm tra", is_read: false, created_at: "2025-06-25T08:00:00", type: 'info' },
  { id: 3, title: "Hợp đồng sắp hết hạn", content: "Hợp đồng MBA-C-001 sắp hết hạn trong 30 ngày.", is_read: true, created_at: "2025-06-24T14:30:00", type: 'warning' },
];

const CHANGE_LOGS: ChangeLog[] = [
  { id: 1, table_name: 'clients', record_id: 1, column_name: 'Địa chỉ', old_value: '-', new_value: 'Hanoi, Vietnam', changed_by: 'Tran Van Duc', changed_at: '10/06/2024 21:30:00', action_type: 'update' },
  { id: 2, table_name: 'clients', record_id: 1, column_name: '', old_value: '', new_value: '', changed_by: 'Tran Van Duc', changed_at: '10/06/2024 21:30:00', action_type: 'create' },
];

const MONTHLY_DATA: MonthlyData[] = [];
PROJECTS.forEach(p => {
  for (let m = 1; m <= 12; m++) {
    MONTHLY_DATA.push({ projectId: p.id, month: m, value: Math.floor(Math.random() * 10) + 5, type: 'plan' });
    MONTHLY_DATA.push({ projectId: p.id, month: m, value: Math.floor(Math.random() * 10) + 5, type: 'actual' });
    MONTHLY_DATA.push({ projectId: p.id, month: m, value: 50000, type: 'revenue' });
  }
});

const MASTER_CATEGORIES: MasterCategory[] = [
  { id: "lead_source", name: "Danh sách Lead source", items: ["Web", "MKT", "LinkedIn", "8Card", "Landing Page", "Event", "Referral"] },
  { id: "salesman", name: "Danh sách Salesman", items: ["DucTX", "Terry", "HaNT", "Sarah", "John"] },
  { id: "client_type", name: "Loại khách hàng", items: ["EU", "ITのEU", "Thân thiết", "Mới"] },
  { id: "tech", name: "Loại công nghệ", items: ["Blockchain", "System", "App", "AI", "Web"] },
  { id: "contract_type", name: "Loại hợp đồng", items: ["ODC", "Project base", "Lab"] },
];

const PERMISSIONS: Permission[] = [
  { id: 1, role: "Guest (default)", module: "Khách hàng", canView: true, canAdd: false, canEdit: false },
  { id: 2, role: "Guest (default)", module: "Dự án", canView: true, canAdd: false, canEdit: false },
  { id: 3, role: "Guest (default)", module: "Hợp đồng", canView: true, canAdd: false, canEdit: false },
  { id: 4, role: "Guest (default)", module: "Hoá đơn", canView: true, canAdd: false, canEdit: false },
  { id: 5, role: "Guest (default)", module: "Doanh thu", canView: false, canAdd: false, canEdit: false },
  { id: 6, role: "Sale Admin", module: "Khách hàng", canView: true, canAdd: true, canEdit: true },
  { id: 7, role: "Sale Admin", module: "Dự án", canView: true, canAdd: true, canEdit: true },
];

export const getMockData = () => ({
  users: USERS,
  clients: CLIENTS,
  projects: PROJECTS,
  contracts: CONTRACTS,
  invoices: INVOICES,
  statements: BANK_STATEMENTS,
  allocations: REVENUE_ALLOCATIONS,
  notifications: NOTIFICATIONS,
  monthlyData: MONTHLY_DATA,
  masterCategories: MASTER_CATEGORIES,
  permissions: PERMISSIONS,
  changeLogs: CHANGE_LOGS
});

export const getRelationshipData = (): GraphData => {
  const nodes: any[] = [];
  const links: any[] = [];
  CLIENTS.forEach(c => nodes.push({ id: `C-${c.id}`, group: 1, label: c.name, val: 20 }));
  PROJECTS.forEach(p => {
    nodes.push({ id: `P-${p.id}`, group: 2, label: p.code, val: 15 });
    links.push({ source: `C-${p.client_id}`, target: `P-${p.id}`, value: 5 });
  });
  USERS.forEach(u => nodes.push({ id: `U-${u.id}`, group: 3, label: u.full_name, val: 10 }));
  PROJECTS.forEach(p => links.push({ source: `P-${p.id}`, target: `U-${p.sales_owner_id}`, value: 2 }));
  return { nodes, links };
};
