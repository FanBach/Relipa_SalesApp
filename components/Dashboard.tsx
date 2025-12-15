import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Invoice, Project, Contract } from '../types';
import { DollarSign, Briefcase, Users, FileText, ChevronDown } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  projects: Project[];
  contracts: Contract[];
}

const COLORS = ['#82ca9d', '#8884d8', '#ffc658', '#ff8042'];

const StatCard = ({ title, value, subtext }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-1">{value}</h3>
    <p className="text-xs text-slate-500">{subtext}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ invoices, projects, contracts }) => {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const activeProjects = projects.filter(p => p.status_id === 2).length;
  const activeContracts = contracts.filter(c => c.status_id === 2).length;
  const unpaidInvoices = invoices.filter(i => i.status_id !== 3);
  const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  const paymentData = [
    { name: 'Quá hạn', value: invoices.filter(i => i.status_id === 4).length },
    { name: 'Chờ thanh toán', value: invoices.filter(i => i.status_id === 2).length },
    { name: 'Đã thanh toán', value: invoices.filter(i => i.status_id === 3).length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-2">
           <span className="text-sm text-slate-500">Đơn vị tiền</span>
           <button className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded text-sm font-medium">
             USD <ChevronDown size={14} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Doanh thu" 
          value={`${totalRevenue.toLocaleString()} US$`} 
          subtext="+12% so với tháng trước"
        />
        <StatCard 
          title="Khách hàng" 
          value={30} 
          subtext="+2 khách hàng mới tháng này"
        />
        <StatCard 
          title="Dự án" 
          value={`${activeProjects} đang thực hiện`} 
          subtext="3 sắp hoàn thành"
        />
        <StatCard 
          title="Hợp đồng" 
          value={`${activeContracts} đang hiệu lực`} 
          subtext="3 hợp đồng sắp hết hạn"
        />
        <StatCard 
          title="Hoá đơn chưa thanh toán" 
          value={`${(unpaidAmount/1000).toFixed(0)}k US$`} 
          subtext={`${unpaidInvoices.length} hoá đơn quá hạn`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between mb-4">
             <h3 className="font-semibold text-slate-800">Doanh thu theo tháng</h3>
             <button className="text-xs border px-2 py-1 rounded flex items-center gap-1">Bộ lọc <ChevronDown size={12}/></button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(val) => `$${val}`} />
                <RechartsTooltip />
                <Bar dataKey="revenue" fill="#d1d5db" radius={[4, 4, 0, 0]} activeBar={{ fill: '#9ca3af' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Tình trạng thanh toán</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Hợp đồng sắp hết hạn</h3>
            <div className="space-y-4">
               {contracts.slice(0, 3).map(c => (
                 <div key={c.id} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">{c.code}</p>
                      <p className="text-xs text-slate-500">FPT Software</p>
                    </div>
                    <div className="text-right">
                       <p className="font-medium text-slate-800">{c.total_value.toLocaleString()} {c.currency}</p>
                       <p className="text-xs text-orange-500">Hết hạn sau 20 ngày</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Hoá đơn quá hạn</h3>
            <div className="space-y-4">
               {invoices.filter(i => i.status_id === 4 || i.status_id === 2).slice(0, 3).map(i => (
                 <div key={i.id} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">{i.invoice_no}</p>
                      <p className="text-xs text-slate-500">FPT Software</p>
                    </div>
                    <div className="text-right">
                       <p className="font-medium text-slate-800">{i.total_amount.toLocaleString()} {i.currency}</p>
                       <p className="text-xs text-red-500">Quá hạn 20 ngày</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;