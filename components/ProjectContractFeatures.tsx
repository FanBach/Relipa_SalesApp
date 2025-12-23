
import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Search, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight, X, ArrowLeft, ArrowRight, FileText, PlusCircle, RefreshCw, AlertCircle, Clock, CheckCircle, Send } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project, Contract, Client, MasterCategory, Invoice, ChangeLog, MonthlyData, User, Permission } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';
import { getMockData } from '../services/mockData';

// --- Modal Component for Request Start (Sửa lại chính xác theo UI ảnh) ---
export const RequestStartModal = ({ isOpen, onClose, contract, project }: { isOpen: boolean, onClose: () => void, contract: Contract, project?: Project }) => {
    const [formData, setFormData] = useState({
        to: 'giangnk@relipasoft.com, saleman@relipasoft.com',
        cc: 'div@relipasoft.com, account-group@relipasoft.com',
        bcc: '',
        subject: '',
        body: ''
    });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen && contract && project) {
            const isExtend = contract.is_extend;
            const subject = isExtend 
                ? `[SALE]Request extend dự án_(${project.code})`
                : `[SALE]Request start dự án_(${project.code})`;

            let body = `Dear .....,\n\nCC Mọi người,\n\nEm gửi .... yêu cầu start dự án theo nội dung phía dưới ạ:\n\n`;
            body += `■Tên dự án: ${project.name}\n■Mã code dự án: ${project.code}\n■Kiểu dự án: ${contract.type}\n■Công số: ... MM/tháng\n\n`;
            body += `+ PM : MM\n+ DEV : MM\n+ TESTER : MM\n+ BrSE: MM\n\n`;
            body += `■Nội dung phát triển:\n■Ngày bắt đầu dự án: ${contract.start_date || '01/05/2023'}\n■Ngày kết thúc dự án: ${contract.end_date || '31/05/2023'}\n■ Backlog contract ticket link\n\n`;
            body += `Nhờ .... cho team triển khai giúp em ạ.\nEm cảm ơn anh ạ!`;
            
            setFormData(prev => ({ ...prev, subject, body }));
        }
    }, [isOpen, contract, project]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col relative overflow-hidden max-h-[95vh]">
                {/* Close Button - Vòng tròn có dấu X ở góc phải (#2) */}
                <button onClick={onClose} className="absolute top-5 right-5 p-1 border border-slate-900 rounded-full hover:bg-slate-100 transition-colors z-10 text-slate-900">
                    <X size={22} />
                </button>

                <div className="p-10 flex flex-col h-full overflow-hidden">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Gửi mail request start dự án</h2>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                        {/* Đến * (#3) */}
                        <div className="grid grid-cols-12 gap-6 items-center">
                            <label className="col-span-2 text-sm font-bold text-slate-700 text-right">Đến *</label>
                            <input 
                                type="text" 
                                className="col-span-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:border-black outline-none transition-all" 
                                value={formData.to} 
                                onChange={e => setFormData({...formData, to: e.target.value})} 
                            />
                        </div>

                        {/* Cc (#4) */}
                        <div className="grid grid-cols-12 gap-6 items-center">
                            <label className="col-span-2 text-sm font-bold text-slate-700 text-right">Cc</label>
                            <input 
                                type="text" 
                                className="col-span-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:border-black outline-none transition-all" 
                                value={formData.cc} 
                                onChange={e => setFormData({...formData, cc: e.target.value})} 
                            />
                        </div>

                        {/* Bcc (#5) */}
                        <div className="grid grid-cols-12 gap-6 items-center">
                            <label className="col-span-2 text-sm font-bold text-slate-700 text-right">Bcc</label>
                            <input 
                                type="text" 
                                className="col-span-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:border-black outline-none transition-all" 
                                value={formData.bcc} 
                                onChange={e => setFormData({...formData, bcc: e.target.value})} 
                            />
                        </div>

                        {/* Tiêu đề * (#6) */}
                        <div className="grid grid-cols-12 gap-6 items-center">
                            <label className="col-span-2 text-sm font-bold text-slate-700 text-right">Tiêu đề *</label>
                            <input 
                                type="text" 
                                className="col-span-10 p-2.5 border border-slate-300 rounded-lg text-sm focus:border-black outline-none transition-all" 
                                value={formData.subject} 
                                onChange={e => setFormData({...formData, subject: e.target.value})} 
                            />
                        </div>

                        {/* Nội dung * (#7) */}
                        <div className="grid grid-cols-12 gap-6 items-start">
                            <label className="col-span-2 text-sm font-bold text-slate-700 text-right mt-2">Nội dung *</label>
                            <textarea 
                                className="col-span-10 p-4 border border-slate-300 rounded-lg text-sm font-normal h-[350px] resize-none focus:border-black outline-none transition-all leading-relaxed" 
                                value={formData.body} 
                                onChange={e => setFormData({...formData, body: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Footer (#8) */}
                    <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col items-center gap-4">
                        <p className="text-sm font-medium text-slate-500">Vui lòng kiểm tra lại nội dung mail trước khi gửi.</p>
                        <button 
                            onClick={() => { 
                                setIsSending(true); 
                                setTimeout(() => { setIsSending(false); onClose(); }, 1000); 
                            }} 
                            className="bg-black text-white px-16 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md active:scale-95 transition-all flex items-center gap-2"
                        >
                            {isSending ? <RefreshCw className="animate-spin" size={18} /> : "Gửi"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Project Form (Giữ nguyên logic cũ nhưng phông chữ bình thường) ---
export const ProjectForm = ({ initialData, clients, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Project>>(initialData || {
        code: `PRJ-${Math.floor(Math.random() * 1000)}`,
        name: '',
        client_id: clients[0]?.id,
        technology: 'Web',
        division: 'Division 1',
        start_date: '',
        end_date: '',
        status_id: 2,
        description: ''
    });
    const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
    return (
        <div className="bg-white p-8 rounded-xl min-h-screen">
           <FormHeader title={initialData ? "Sửa dự án" : "Thêm dự án"} onBack={onBack} onSave={() => onSave(formData)} />
           <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
              <div className="space-y-1"><label className="text-sm font-medium">Khách hàng *</label>
                  <select className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-black" value={formData.client_id} onChange={e => handleChange('client_id', Number(e.target.value))}>
                      {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>
              <div className="space-y-1"><label className="text-sm font-medium">Tên dự án *</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-black" />
              </div>
              <div className="space-y-1"><label className="text-sm font-medium">Công nghệ *</label>
                  <input type="text" value={formData.technology} onChange={e => handleChange('technology', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-black" />
              </div>
              <div className="space-y-1"><label className="text-sm font-medium">Mã dự án *</label>
                  <input type="text" value={formData.code} readOnly className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 text-slate-500" />
              </div>
              <div className="col-span-2 space-y-1"><label className="text-sm font-medium">Mô tả</label>
                   <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm h-24 outline-none focus:border-black"></textarea>
              </div>
           </div>
        </div>
    );
};

// --- Project Detail View ---
export const ProjectDetailView = ({ project, onBack, onEdit, onNavigate }: any) => {
    const [activeTab, setActiveTab] = useState<'contracts' | 'revenue' | 'history'>('contracts');
    const mockData = getMockData();
    const client = mockData.clients.find(c => c.id === project.client_id);
    const contracts = mockData.contracts.filter(c => c.project_id === project.id);
    const invoices = mockData.invoices.filter(i => i.project_id === project.id);
    
    const totalValue = contracts.reduce((sum, c) => sum + c.total_value, 0);
    const netRevenue = contracts.reduce((sum, c) => sum + (c.net_revenue || 0), 0);
    const debt = invoices.filter(i => i.status_id === 4).reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);

    return (
        <div className="min-h-screen pb-10 bg-white">
            <div className="bg-white px-8 py-6 flex justify-between items-center sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{project.name}</h1>
                        <p className="text-xs text-slate-500 font-medium">Mã dự án: {project.code}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50">Request start</button>
                    <button onClick={() => onNavigate('/contracts')} className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50">Thêm hợp đồng</button>
                    <button onClick={() => onEdit(project)} className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-md transition-all">Chỉnh sửa</button>
                </div>
            </div>

            <div className="px-8 max-w-[1600px] mx-auto space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-8">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Thông tin dự án</h3>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">Đang thực hiện</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-y-4 text-sm font-medium">
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Tên khách hàng:</span> <span className="text-slate-900">{client?.name}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Công nghệ:</span> <span className="text-slate-900">{project.technology}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Bộ phận phát triển:</span> <span className="text-slate-900">{project.division}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Ngày bắt đầu:</span> <span className="text-slate-900">{project.start_date}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Ngày kết thúc:</span> <span className="text-slate-900">{project.end_date}</span></div>
                            <div className="flex items-start gap-4"><span className="text-slate-500 w-40">Mô tả:</span> <span className="text-slate-900 flex-1 leading-relaxed">{project.description || 'Số hoá phần mềm thanh toán mobile'}</span></div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex justify-between items-center group cursor-pointer hover:bg-white transition-all">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Tổng giá trị hợp đồng</div>
                                <div className="text-lg font-bold text-slate-900">{totalValue.toLocaleString()} US$</div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-black transition-colors" />
                        </div>
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex justify-between items-center group cursor-pointer hover:bg-white transition-all">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Doanh thu (NET)</div>
                                <div className="text-lg font-bold text-slate-900">{netRevenue.toLocaleString()} US$</div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-black transition-colors" />
                        </div>
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex justify-between items-center group cursor-pointer hover:bg-white transition-all">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Công nợ</div>
                                <div className="text-lg font-bold text-slate-900 text-rose-500">{debt.toLocaleString()} US$</div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-black transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-100 p-1 rounded-xl w-fit flex gap-1">
                    <button onClick={() => setActiveTab('contracts')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'contracts' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Hợp đồng ({contracts.length})</button>
                    <button onClick={() => setActiveTab('revenue')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'revenue' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Doanh thu & Công số</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Lịch sử thay đổi</button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-8 min-h-[400px]">
                    {activeTab === 'contracts' && (
                        <div className="space-y-4">
                            {contracts.map((c, i) => (
                                <div key={i} className="border border-slate-100 rounded-xl p-6 hover:border-slate-300 transition-all flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold text-slate-900">{c.code}</h4>
                                            <StatusBadge type="contract" status={c.status_id} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-10 text-xs font-medium text-slate-500">
                                            <div>Ngày bắt đầu: <span className="text-slate-900">{c.start_date}</span></div>
                                            <div>Ngày kết thúc: <span className="text-slate-900">{c.end_date}</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-slate-900">{c.total_value.toLocaleString()} {c.currency}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Giá trị hợp đồng</div>
                                    </div>
                                </div>
                            ))}
                            {contracts.length === 0 && <p className="text-center text-slate-400 py-10">Chưa có hợp đồng nào.</p>}
                        </div>
                    )}

                    {activeTab === 'revenue' && (
                        <div className="h-[400px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={[{name: '1/2024', rev: 350000, mm: 1.5}, {name: '2/2024', rev: 400000, mm: 1.8}]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <RechartsTooltip />
                                    <Bar dataKey="rev" fill="#cbd5e1" barSize={40} radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="mm" stroke="#000" strokeWidth={2} dot={{ r: 3, fill: '#000' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    
                    {activeTab === 'history' && (
                        <div className="max-w-3xl space-y-6">
                             <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-rose-500"></div>
                                <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                                    <div className="font-bold text-slate-900 text-sm mb-1">Thay đổi thông tin: Địa chỉ</div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"><Clock size={10} className="inline mr-1" /> 10/6/2024 21:30 - Bởi: Trần Xuân Đức</p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Projects Module ---
export const ProjectsModule = ({ data, clients, onAdd, onViewDetail }: any) => {
    const [filters, setFilters] = useState({ search: '', status: 'all' });
    const filteredData = data.filter((p: Project) => !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh] p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Quản lý dự án</h2>
                <button onClick={onAdd} className="bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all">Thêm dự án</button>
            </div>
            
            <div className="relative max-w-md mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Tìm kiếm dự án ..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black" value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                        <tr><th className="py-4 px-2">Mã dự án</th><th className="py-4 px-2">Tên dự án</th><th className="py-4 px-2">Khách hàng</th><th className="py-4 px-2">Bộ phận</th><th className="py-4 px-2">Trạng thái</th></tr>
                    </thead>
                    <tbody className="font-medium text-slate-600">
                        {filteredData.map((p: Project) => (
                            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onViewDetail(p)}>
                                <td className="py-5 px-2">{p.code}</td>
                                <td className="py-5 px-2 font-bold text-slate-900">{p.name}</td>
                                <td className="py-5 px-2">{clients.find((c: Client) => c.id === p.client_id)?.name}</td>
                                <td className="py-5 px-2">{p.division}</td>
                                <td className="py-5 px-2"><StatusBadge type="project" status={p.status_id} project={p} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};