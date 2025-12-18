import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { Invoice, Project, Contract, Client } from '../types';
import { ChevronDown, DollarSign, Users, Briefcase, FileText, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  projects: Project[];
  contracts: Contract[];
  clients: Client[];
}

const COLORS = {
  blue: '#38bdf8',   // Division 1 / Khách hàng A / Dự án 1 / Đã thanh toán
  amber: '#fbbf24',  // Division 2 / Khách hàng B / Dự án 2 / Chờ thanh toán
  green: '#84cc16',  // Global / Khách hàng C / Dự án 3 / Quá hạn thanh toán
  pink: '#f472b6',   // R&D
  red: '#ef4444',    // Thanh toán (Line chart)
  slate: '#94a3b8',  // Kế hoạch
  lightSlate: '#e2e8f0'
};

const StatCard = ({ title, value, subValue, trend, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl font-black text-slate-900 leading-none">{value}</h3>
      </div>
      <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-[10px] text-slate-500 font-bold">{subValue}</p>
      {trend && (
        <div className={`flex items-center text-[10px] font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  </div>
);

const SectionHeader = ({ title, expanded, onToggle }: any) => (
  <div className="flex items-center gap-2 cursor-pointer group mb-6 w-fit" onClick={onToggle}>
    <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
    <ChevronDown size={20} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
  </div>
);

const PieCenterLabel = () => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
    <div className="bg-[#cbd5e1] px-2 py-0.5 rounded text-[9px] font-black text-white whitespace-nowrap uppercase">
      2,3M US$
    </div>
  </div>
);

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  if (percent === 0) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-black">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ invoices, projects, contracts, clients }) => {
  const [revExpanded, setRevExpanded] = useState(true);
  const [payExpanded, setPayExpanded] = useState(true);
  const [conExpanded, setConExpanded] = useState(true);

  const monthlyData = Array.from({length: 7}, (_, i) => ({
    name: `Tháng ${i+1}`,
    rev: 150 + (i * 60) + Math.random() * 50,
    debt: 120 + (i * 50) + Math.random() * 40,
    pay: 100 + (i * 70) + Math.random() * 30,
    plan: 140 + (i * 55),
    forecast: 160 + (i * 65),
    d1: 50 + Math.random() * 20,
    d2: 40 + Math.random() * 20,
    global: 60 + Math.random() * 20
  }));

  const quarterlyData = [
    { name: 'Quý 1', p: 400, a: 380, f: 410 },
    { name: 'Quý 2', p: 450, a: 400, f: 440 },
    { name: 'Quý 3', p: 300, a: 320, f: 310 },
    { name: 'Quý 4', p: 500, a: 480, f: 520 },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in px-4 max-w-[1600px] mx-auto">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Doanh thu tháng này" value="50.000,00 US$" subValue="+12% so với tháng trước" trend={12} icon={DollarSign} colorClass="bg-blue-600" />
        <StatCard title="Khách hàng" value="30" subValue="+2 khách hàng mới tháng này" trend={5} icon={Users} colorClass="bg-emerald-600" />
        <StatCard title="Dự án" value="12 đang thực hiện" subValue="3 sắp hoàn thành" trend={0} icon={Briefcase} colorClass="bg-amber-600" />
        <StatCard title="Hợp đồng" value="30 đang hiệu lực" subValue="3 hợp đồng sắp hết hạn" trend={-2} icon={FileText} colorClass="bg-indigo-600" />
        <StatCard title="Hoá đơn chưa thanh toán" value="78M US$" subValue="5 hoá đơn quá hạn" trend={-10} icon={AlertCircle} colorClass="bg-rose-600" />
      </div>

      {/* SECTION DOANH THU */}
      <div className="space-y-6">
        <SectionHeader title="Doanh thu" expanded={revExpanded} onToggle={() => setRevExpanded(!revExpanded)} />
        {revExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pie Bộ phận */}
            <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6">Phân bổ doanh thu theo bộ phận</h3>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:'Division 1',v:33},{name:'Division 2',v:35},{name:'Global',v:32},{name:'R&D',v:0}]} innerRadius={60} outerRadius={85} dataKey="v" labelLine={false} label={renderCustomizedLabel}>
                      <Cell fill={COLORS.blue} /><Cell fill={COLORS.amber} /><Cell fill={COLORS.green} /><Cell fill={COLORS.pink} />
                    </Pie>
                    <RechartsTooltip />
                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingLeft: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <PieCenterLabel />
              </div>
            </div>

            {/* Bar Thời gian */}
            <div className="lg:col-span-8 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Phân bổ doanh thu theo thời gian</h3>
                <div className="flex gap-2 text-[9px] font-black uppercase text-slate-400">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#38bdf8]"></div> Kế hoạch</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div> Thực tế</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#84cc16]"></div> Dự báo</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="black" />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                    <RechartsTooltip />
                    <Bar dataKey="p" name="Kế hoạch" fill={COLORS.blue} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="a" name="Thực tế" fill={COLORS.amber} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="f" name="Dự báo" fill={COLORS.green} radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area YTD */}
            <div className="lg:col-span-12 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase mb-8 text-center">Doanh thu luỹ kế (YTD)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.1}/><stop offset="95%" stopColor={COLORS.amber} stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} fontWeight="black" />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight="bold" />
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" align="center" iconType="plainline" />
                    <Area type="monotone" dataKey="rev" name="Thực tế" stroke={COLORS.amber} strokeWidth={4} fill="url(#areaGrad)" dot={{ r: 4, fill: COLORS.amber }} />
                    <Line type="monotone" dataKey="plan" name="Kế hoạch" stroke={COLORS.blue} strokeDasharray="5 5" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="forecast" name="Dự báo" stroke={COLORS.green} strokeWidth={2} dot={{ r: 4, fill: COLORS.green }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Khách hàng */}
            <div className="lg:col-span-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6">Phân bổ doanh thu theo khách hàng</h3>
              <div className="h-60 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:'Khách hàng A',v:33},{name:'Khách hàng B',v:35},{name:'Khách hàng C',v:32}]} innerRadius={60} outerRadius={85} dataKey="v" labelLine={false} label={renderCustomizedLabel}>
                      <Cell fill={COLORS.blue} /><Cell fill={COLORS.amber} /><Cell fill={COLORS.green} />
                    </Pie>
                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
                <PieCenterLabel />
              </div>
            </div>

            {/* Pie Dự án */}
            <div className="lg:col-span-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6">Phân bổ doanh thu theo dự án</h3>
              <div className="h-60 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:'Dự án 1',v:33},{name:'Dự án 2',v:35},{name:'Dự án 3',v:32}]} innerRadius={60} outerRadius={85} dataKey="v" labelLine={false} label={renderCustomizedLabel}>
                      <Cell fill={COLORS.blue} /><Cell fill={COLORS.amber} /><Cell fill={COLORS.green} />
                    </Pie>
                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
                <PieCenterLabel />
              </div>
            </div>

            {/* Bar Phân bổ bộ phận */}
            <div className="lg:col-span-12 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-8">Phân bổ doanh thu các bộ phận</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="black" />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', paddingTop: '20px' }} />
                    <Bar dataKey="d1" name="Division 1" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={12} />
                    <Bar dataKey="d2" name="Division 2" fill={COLORS.amber} radius={[2, 2, 0, 0]} barSize={12} />
                    <Bar dataKey="global" name="Global" fill={COLORS.green} radius={[2, 2, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION THANH TOÁN */}
      <div className="space-y-6">
        <SectionHeader title="Thanh toán" expanded={payExpanded} onToggle={() => setPayExpanded(!payExpanded)} />
        {payExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-10">Doanh thu & công nợ & thanh toán</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={{ stroke: '#cbd5e1' }} tickLine={false} fontSize={11} fontWeight="black" dy={10} />
                    <YAxis hide />
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" align="center" iconType="plainline" wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: 'black' }} />
                    <Line type="monotone" dataKey="rev" name="Doanh thu" stroke={COLORS.green} strokeWidth={3} dot={{ r: 4, fill: COLORS.green, strokeWidth: 2, stroke: '#fff' }} />
                    <Line type="monotone" dataKey="debt" name="Công nợ" stroke={COLORS.amber} strokeWidth={3} dot={{ r: 4, fill: COLORS.amber, strokeWidth: 2, stroke: '#fff' }} />
                    <Line type="monotone" dataKey="pay" name="Thanh toán" stroke={COLORS.red} strokeWidth={3} dot={{ r: 4, fill: COLORS.red, strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6">Tình trạng thanh toán</h3>
              <div className="h-60 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:'Đã thanh toán',v:33},{name:'Chờ thanh toán',v:35},{name:'Quá hạn thanh toán',v:32}]} innerRadius={60} outerRadius={85} dataKey="v" labelLine={false} label={renderCustomizedLabel}>
                      <Cell fill={COLORS.blue} /><Cell fill={COLORS.amber} /><Cell fill={COLORS.green} />
                    </Pie>
                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
                <PieCenterLabel />
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6">Phân bổ công nợ theo khách hàng</h3>
              <div className="h-60 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:'Khách hàng A',v:33},{name:'Khách hàng B',v:35},{name:'Khách hàng C',v:32}]} innerRadius={60} outerRadius={85} dataKey="v" labelLine={false} label={renderCustomizedLabel}>
                      <Cell fill={COLORS.blue} /><Cell fill={COLORS.amber} /><Cell fill={COLORS.green} />
                    </Pie>
                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
                <PieCenterLabel />
              </div>
            </div>

            {/* List Hoá đơn cảnh báo */}
            <div className="lg:col-span-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-900 uppercase mb-6 flex justify-between">Hoá đơn quá hạn <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-black">5 hoá đơn</span></h3>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-[20px] bg-slate-50 border border-slate-100">
                    <div><p className="text-xs font-black text-slate-900">INV-BAC-20250418</p><p className="text-[10px] text-slate-500 font-bold">FPT Software</p></div>
                    <div className="text-right"><p className="text-xs font-black text-slate-900">500,000.00 US$</p><p className="text-[9px] text-rose-600 font-black">Quá hạn 20 ngày</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-900 uppercase mb-6 flex justify-between">Hoá đơn chờ thanh toán <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[9px] font-black">12 hoá đơn</span></h3>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-[20px] bg-slate-50 border border-slate-100">
                    <div><p className="text-xs font-black text-slate-900">INV-BAC-20250418</p><p className="text-[10px] text-slate-500 font-bold">FPT Software</p></div>
                    <div className="text-right"><p className="text-xs font-black text-slate-900">500,000.00 US$</p><p className="text-[9px] text-amber-600 font-black">Hạn sau 20 ngày</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION HỢP ĐỒNG */}
      <div className="space-y-6">
        <SectionHeader title="Hợp đồng" expanded={conExpanded} onToggle={() => setConExpanded(!conExpanded)} />
        {conExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-900 uppercase mb-6 flex justify-between">Hợp đồng sắp hết hạn <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-black">3 hợp đồng</span></h3>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-[20px] bg-slate-50 border border-slate-100">
                    <div><p className="text-xs font-black text-slate-900">MBA-C-001</p><p className="text-[10px] text-slate-500 font-bold">FPT Software</p></div>
                    <div className="text-right"><p className="text-xs font-black text-slate-900">500,000 US$</p><p className="text-[9px] text-rose-600 font-black">Hết hạn sau 20 ngày</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-900 uppercase mb-6 flex justify-between">Hợp đồng sắp đến hạn thanh toán <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[9px] font-black">5 hợp đồng</span></h3>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-[20px] bg-slate-50 border border-slate-100">
                    <div><p className="text-xs font-black text-slate-900">MBA-C-001</p><p className="text-[10px] text-slate-500 font-bold">FPT Software</p></div>
                    <div className="text-right"><p className="text-xs font-black text-slate-900">500,000 US$</p><p className="text-[9px] text-amber-600 font-black">Thanh toán sau 10 ngày</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
