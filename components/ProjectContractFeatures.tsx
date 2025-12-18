import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Search, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight, X, ArrowLeft, ArrowRight, FileText, PlusCircle, RefreshCw, AlertCircle, Clock, CheckCircle, Send } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Project, Contract, Client, MasterCategory, Invoice, ChangeLog, MonthlyData, User, Permission } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';
import { getMockData } from '../services/mockData';

// --- Modal Component for Request Start ---
export const RequestStartModal = ({ isOpen, onClose, contract, project }: { isOpen: boolean, onClose: () => void, contract: Contract, project?: Project }) => {
    const [formData, setFormData] = useState({
        to: 'giangnk@relipasoft.com',
        cc: 'div@relipasoft.com, account-group@relipasoft.com',
        bcc: '',
        subject: '',
        body: ''
    });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen && contract && project) {
            const isExtend = contract.is_extend;
            const subjectCode = project.code; 
            const subject = isExtend 
                ? `[SALE] Request extend dự án_${subjectCode}`
                : `[SALE] Request start dự án_${subjectCode}`;

            let body = `Dear anh/chị,\n\nCC Mọi người,\n\nEm gửi anh/chị yêu cầu start dự án theo nội dung phía dưới ạ :\n\n`;
            body += `■Tên dự án: ${project.name}\n■Mã code dự án: ${project.code}\n■Kiểu dự án: ${contract.type}\n`;
            body += `■Công số: ${contract.man_month_div || 0} MM/tháng\n\n■Nội dung phát triển: ${project.description || '...'}\n`;
            body += `■Ngày bắt đầu dự án: ${contract.start_date}\n■Ngày kết thúc dự án: ${contract.end_date}\n\n■ Backlog contract ticket link: ${contract.backlog_link || '...'}\n\nNhờ anh/chị cho team triển khai giúp em ạ.\nEm cảm ơn anh ạ!`;
            setFormData(prev => ({ ...prev, subject, body }));
        }
    }, [isOpen, contract, project]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Gửi mail request start dự án</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-2 text-sm font-semibold text-right">Đến *</label>
                        <input type="text" className="col-span-10 p-2 border rounded-lg text-sm" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-2 text-sm font-semibold text-right">Tiêu đề *</label>
                        <input type="text" className="col-span-10 p-2 border rounded-lg text-sm" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-12 gap-4 items-start">
                        <label className="col-span-2 text-sm font-semibold text-right mt-2">Nội dung *</label>
                        <textarea className="col-span-10 p-3 border rounded-lg text-sm font-mono h-64 resize-none" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} />
                    </div>
                </div>
                <div className="p-6 border-t bg-slate-50 rounded-b-xl flex flex-col items-center">
                    <button onClick={() => { setIsSending(true); setTimeout(() => { setIsSending(false); onClose(); alert("Đã gửi!"); }, 1000); }} className="bg-black text-white px-12 py-3 rounded-full text-sm font-bold flex items-center gap-2">
                        {isSending ? <RefreshCw className="animate-spin" size={16} /> : "Gửi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Project Form (Preserved) ---
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
                  <select className="w-full p-2 border rounded-lg text-sm" value={formData.client_id} onChange={e => handleChange('client_id', Number(e.target.value))}>
                      {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>
              <div className="space-y-1"><label className="text-sm font-medium">Tên dự án *</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div className="space-y-1"><label className="text-sm font-medium">Công nghệ *</label>
                  <input type="text" value={formData.technology} onChange={e => handleChange('technology', e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div className="space-y-1"><label className="text-sm font-medium">Mã dự án *</label>
                  <input type="text" value={formData.code} readOnly className="w-full p-2 border rounded-lg text-sm bg-slate-50" />
              </div>
              <div className="col-span-2 space-y-1"><label className="text-sm font-medium">Mô tả</label>
                   <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full p-2 border rounded-lg text-sm h-24"></textarea>
              </div>
           </div>
        </div>
    );
};

// --- Project Detail View (Updated per Image B-39 to B-45) ---
export const ProjectDetailView = ({ project, onBack, onEdit, onNavigate }: any) => {
    const [activeTab, setActiveTab] = useState<'contracts' | 'revenue' | 'history'>('contracts');
    const mockData = getMockData();
    const client = mockData.clients.find(c => c.id === project.client_id);
    const contracts = mockData.contracts.filter(c => c.project_id === project.id);
    const invoices = mockData.invoices.filter(i => i.project_id === project.id);
    
    // Financial Calcs
    const totalValue = contracts.reduce((sum, c) => sum + c.total_value, 0);
    const netRevenue = contracts.reduce((sum, c) => sum + (c.net_revenue || 0), 0);
    const debt = invoices.filter(i => i.status_id === 4).reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);

    return (
        <div className="min-h-screen pb-10 bg-white">
            {/* Header Section */}
            <div className="bg-white px-8 py-6 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={28} className="text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{project.name}</h1>
                        <p className="text-sm text-slate-500 font-medium">Mã dự án: {project.code}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50">Request start</button>
                    <button onClick={() => onNavigate('/contracts')} className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50">Thêm hợp đồng</button>
                    <button onClick={() => onEdit(project)} className="px-8 py-2.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-lg transition-all">Chỉnh sửa</button>
                </div>
            </div>

            <div className="px-8 max-w-[1600px] mx-auto space-y-8">
                {/* Info Grid (Image B-7 to B-21) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Project Info Card */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-lg font-bold text-slate-900">Thông tin dự án</h3>
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">Đang thực hiện</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-y-4 text-sm">
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Tên khách hàng:</span> <span className="font-bold text-slate-900">{client?.name}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Công nghệ:</span> <span className="font-bold text-slate-900">{project.technology}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Bộ phận phát triển:</span> <span className="font-bold text-slate-900">{project.division}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Ngày bắt đầu:</span> <span className="font-bold text-slate-900">{project.start_date}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-500 w-40">Ngày kết thúc:</span> <span className="font-bold text-slate-900">{project.end_date}</span></div>
                            <div className="flex items-start gap-4"><span className="text-slate-500 w-40">Mô tả:</span> <span className="font-bold text-slate-900 flex-1 leading-relaxed">{project.description || 'Số hoá phần mềm thanh toán mobile'}</span></div>
                        </div>
                    </div>

                    {/* Financial Cards (Image B-15 to B-21) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:bg-white transition-all shadow-sm">
                            <div>
                                <div className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Tổng giá trị hợp đồng</div>
                                <div className="text-xl font-black text-slate-900">{totalValue.toLocaleString()} US$</div>
                            </div>
                            <div className="p-2 rounded-full border-2 border-slate-200 group-hover:border-black transition-colors"><ChevronRight size={20} /></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:bg-white transition-all shadow-sm">
                            <div>
                                <div className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Doanh thu (NET)</div>
                                <div className="text-xl font-black text-slate-900">{netRevenue.toLocaleString()} US$</div>
                            </div>
                            <div className="p-2 rounded-full border-2 border-slate-200 group-hover:border-black transition-colors"><ChevronRight size={20} /></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:bg-white transition-all shadow-sm">
                            <div>
                                <div className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Công nợ</div>
                                <div className="text-xl font-black text-slate-900">{debt.toLocaleString()} US$</div>
                            </div>
                            <div className="p-2 rounded-full border-2 border-slate-200 group-hover:border-black transition-colors"><ChevronRight size={20} /></div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation (Image B-22) */}
                <div className="bg-slate-100 p-1.5 rounded-2xl w-fit flex gap-1">
                    <button onClick={() => setActiveTab('contracts')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'contracts' ? 'bg-white text-black shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Hợp đồng ({contracts.length})</button>
                    <button onClick={() => setActiveTab('revenue')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'revenue' ? 'bg-white text-black shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Doanh thu & Công số</button>
                    <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Lịch sử thay đổi</button>
                </div>

                {/* Tab Content (Image B-23 to B-45) */}
                <div className="bg-white rounded-[32px] border border-slate-100 p-1 shadow-sm min-h-[400px]">
                    {activeTab === 'contracts' && (
                        <div className="p-6 space-y-6">
                            {contracts.map((c, i) => {
                                let statusLabel = 'Chờ ký';
                                if (c.status_id === 2) {
                                    const now = new Date();
                                    const end = new Date(c.end_date.split('/').reverse().join('-'));
                                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    if (diff < 0) statusLabel = 'Đã hết hạn';
                                    else if (diff <= 3) statusLabel = `Hết hạn sau ${diff} ngày`;
                                    else statusLabel = 'Đã ký';
                                }
                                return (
                                    <div key={i} className="border border-slate-100 rounded-3xl p-8 hover:bg-slate-50 transition-all flex justify-between items-start group shadow-sm">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <h4 className="text-xl font-black text-slate-900">{c.code}</h4>
                                                <span className="px-4 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">{statusLabel}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
                                                <div className="flex justify-between"><span className="text-slate-400 font-bold">Ngày ký kết:</span> <span className="font-bold text-slate-900">{c.sign_date || '-'}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-400 font-bold">Ngày bắt đầu:</span> <span className="font-bold text-slate-900">{c.start_date}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-400 font-bold">Giá trị hợp đồng:</span> <span className="font-bold text-slate-900">{c.total_value.toLocaleString()} {c.currency}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-400 font-bold">Ngày kết thúc:</span> <span className="font-bold text-slate-900">{c.end_date}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex justify-center pt-4 gap-2">
                                <button className="w-10 h-10 border rounded-xl hover:bg-slate-50 flex items-center justify-center font-bold text-slate-400"><ChevronDown className="rotate-90" size={16}/></button>
                                <button className="w-10 h-10 bg-black text-white rounded-xl text-xs font-bold">1</button>
                                <button className="w-10 h-10 border rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-500">2</button>
                                <span className="px-2 py-3 text-slate-300">...</span>
                                <button className="w-10 h-10 border rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-500">10</button>
                                <button className="w-10 h-10 border rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 font-bold"><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'revenue' && (
                        <div className="p-10 h-[500px] relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={[
                                    {name: '1/2024', rev: 350000, mm: 1.5},
                                    {name: '2/2024', rev: 400000, mm: 1.8},
                                    {name: '3/2024', rev: 300000, mm: 1.2},
                                    {name: '4/2024', rev: 450000, mm: 2.1},
                                    {name: '5/2024', rev: 500000, mm: 2.0},
                                    {name: '6/2024', rev: 420000, mm: 1.9},
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                                    <YAxis hide />
                                    <RechartsTooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border-none outline-none">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.name}</div>
                                                        <div className="text-lg font-black">{Number(payload[0].value).toLocaleString()} US$</div>
                                                        <div className="text-sm font-bold text-slate-300">{payload[1].value} man-month</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="rev" fill="#cbd5e1" barSize={50} radius={[8, 8, 0, 0]} />
                                    <Line type="monotone" dataKey="mm" stroke="#000" strokeWidth={3} dot={{ r: 5, fill: '#000', strokeWidth: 2, stroke: '#fff' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="p-10 max-w-4xl">
                            <div className="space-y-12 relative">
                                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>
                                <div className="relative pl-20">
                                    <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm z-10 border-8 border-white">2</div>
                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="font-black text-slate-900 text-lg mb-2 flex items-center gap-3">Thay đổi thông tin: Địa chỉ <span className="w-2 h-2 rounded-full bg-rose-500"></span></div>
                                        <div className="space-y-2 text-sm">
                                            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Trước thay đổi:</div> <div className="font-medium text-slate-500">-</div>
                                            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mt-2">Sau thay đổi:</div> <div className="font-medium text-slate-500">Hanoi, Vietnam</div>
                                            <div className="text-xs text-slate-400 font-bold pt-4 border-t border-slate-50 mt-4">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative pl-20">
                                    <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm z-10 border-8 border-white">1</div>
                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="font-black text-slate-900 text-lg mb-2">Tạo mới</div>
                                        <div className="text-xs text-slate-400 font-bold">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                    </div>
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
export const ProjectsModule = ({ data, clients, masterData, onAdd, onViewDetail }: any) => {
    const [filters, setFilters] = useState({ search: '', status: 'all' });
    const filteredData = data.filter((p: Project) => !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Quản lý dự án</h2>
                    <button onClick={onAdd} className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Thêm dự án</button>
                </div>
                <div className="relative max-w-md mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Tìm kiếm dự án ..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black" value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-400 font-bold uppercase text-[11px] tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="py-4">Mã dự án</th>
                                <th className="py-4">Tên dự án</th>
                                <th className="py-4">Khách hàng</th>
                                <th className="py-4">Bộ phận</th>
                                <th className="py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((p: Project) => (
                                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onViewDetail(p)}>
                                    <td className="py-5 font-bold text-slate-500">{p.code}</td>
                                    <td className="py-5 font-black text-slate-900">{p.name}</td>
                                    <td className="py-5 font-bold text-slate-500">{clients.find((c: Client) => c.id === p.client_id)?.name}</td>
                                    <td className="py-5 text-slate-500">{p.division}</td>
                                    <td className="py-5"><StatusBadge type="project" status={p.status_id} project={p} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
