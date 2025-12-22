
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight, Download, X, Plus } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Project, Client, Contract, Invoice, ChangeLog, MonthlyData } from '../types';
import { StatusBadge, FormHeader, DateRangePicker, parseDDMMYYYY } from './Shared';
import { getMockData } from '../services/mockData';

// --- TRANG THÊM/SỬA DỰ ÁN (S004 - Add new & Edit) ---
export const ProjectForm = ({ initialData, clients, onBack, onSave }: any) => {
    const defaultData = {
        code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        client_id: clients[0]?.id,
        technology: 'Web',
        division: 'Division 1',
        start_date: '',
        end_date: '',
        status_id: 2,
        description: ''
    };

    const [formData, setFormData] = useState<Partial<Project>>({ ...defaultData, ...initialData });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAutoCode = () => {
        const randomCode = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
        handleChange('code', randomCode);
    };

    return (
        <div className="bg-white p-8 rounded-xl min-h-screen animate-fade-in">
            <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">Thông tin dự án</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-10 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">Huỷ</button>
                    <button onClick={() => onSave(formData)} className="px-10 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-md transition-all active:scale-95">Lưu</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-8 max-w-6xl mx-auto">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Khách hàng *</label>
                    <select 
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none bg-white transition-all"
                        value={formData.client_id || ''}
                        onChange={e => handleChange('client_id', Number(e.target.value))}
                    >
                        <option value="">Chọn khách hàng</option>
                        {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tên dự án *</label>
                    <input 
                        type="text" 
                        placeholder="Tên dự án"
                        value={formData.name || ''} 
                        onChange={e => handleChange('name', e.target.value)} 
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none transition-all" 
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Công nghệ *</label>
                    <select 
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none bg-white transition-all"
                        value={formData.technology || ''}
                        onChange={e => handleChange('technology', e.target.value)}
                    >
                        <option value="">Công nghệ</option>
                        <option value="Blockchain">Blockchain</option>
                        <option value="AI">AI</option>
                        <option value="Web">Web</option>
                        <option value="System">System</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Mã dự án *</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Mã dự án"
                            value={formData.code || ''} 
                            onChange={e => handleChange('code', e.target.value)}
                            className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none bg-white transition-all" 
                        />
                        <button 
                            onClick={handleAutoCode}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                        >
                            Tự động
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Bộ phận phát triển</label>
                    <select 
                        value={formData.division || ''} 
                        onChange={e => handleChange('division', e.target.value)} 
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none bg-white transition-all"
                    >
                        <option value="">Bộ phận phát triển</option>
                        <option>Division 1</option>
                        <option>Division 2</option>
                        <option>Global</option>
                    </select>
                </div>

                <div className="row-span-3 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Mô tả</label>
                    <textarea 
                        value={formData.description || ''} 
                        onChange={e => handleChange('description', e.target.value)} 
                        placeholder="Mô tả dự án ..."
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm h-[180px] resize-none focus:ring-1 focus:ring-black outline-none transition-all"
                    ></textarea>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ngày bắt đầu *</label>
                    <input 
                        type="date" 
                        value={formData.start_date || ''} 
                        onChange={e => handleChange('start_date', e.target.value)} 
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none transition-all" 
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ngày kết thúc *</label>
                    <input 
                        type="date" 
                        value={formData.end_date || ''} 
                        onChange={e => handleChange('end_date', e.target.value)} 
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none transition-all" 
                    />
                </div>
            </div>
        </div>
    );
};

// --- TRANG DANH SÁCH DỰ ÁN (S004 - View list) ---
export const ProjectsModule = ({ data, clients, onAdd, onViewDetail }: any) => {
    const [filters, setFilters] = useState({ search: '', status: 'Tất cả', tech: 'Tất cả', div: 'Tất cả', startDate: '', endDate: '' });
    
    const filteredData = useMemo(() => {
        return data.filter((p: Project) => {
            const matchesSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase());
            const matchesDiv = filters.div === 'Tất cả' || p.division === filters.div;
            const matchesStatus = filters.status === 'Tất cả' || (filters.status === 'Đang thực hiện' ? p.status_id === 2 : p.status_id !== 2);
            const matchesTech = filters.tech === 'Tất cả' || p.technology === filters.tech;

            let matchesDate = true;
            if (filters.startDate || filters.endDate) {
                const date = parseDDMMYYYY(p.start_date);
                if (date) {
                    if (filters.startDate) {
                        const start = new Date(filters.startDate);
                        start.setHours(0,0,0,0);
                        if (date < start) matchesDate = false;
                    }
                    if (filters.endDate) {
                        const end = new Date(filters.endDate);
                        end.setHours(23,59,59,999);
                        if (date > end) matchesDate = false;
                    }
                } else {
                    matchesDate = false;
                }
            }

            return matchesSearch && matchesDiv && matchesStatus && matchesTech && matchesDate;
        }).sort((a: any, b: any) => b.id - a.id);
    }, [data, filters]);

    // Kiểm tra xem bộ lọc có khác mặc định không (không tính ô tìm kiếm)
    const isFiltered = filters.status !== 'Tất cả' || filters.tech !== 'Tất cả' || filters.div !== 'Tất cả' || filters.startDate !== '' || filters.endDate !== '';

    const clearFilters = () => setFilters({ search: '', status: 'Tất cả', tech: 'Tất cả', div: 'Tất cả', startDate: '', endDate: '' });

    const formatVN = (dateStr: string) => {
        if (!dateStr) return '-';
        if (dateStr.includes('/')) return dateStr;
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[85vh] p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý dự án</h2>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-slate-100 rounded-lg text-sm font-bold text-slate-500 whitespace-nowrap">
                        {filteredData.length} dự án
                    </div>
                    <button onClick={onAdd} className="bg-black text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md">
                        Thêm dự án
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dự án ..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all" 
                            value={filters.search} 
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} 
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-10">
                <div className="p-2 text-slate-900"><Filter size={20} strokeWidth={2.5} /></div>
                
                <select 
                    value={filters.status} 
                    onChange={e => setFilters({...filters, status: e.target.value})}
                    className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none hover:border-slate-300 bg-white cursor-pointer transition-all"
                >
                    <option>Trạng thái</option>
                    <option>Đang thực hiện</option>
                    <option>Hoàn thành</option>
                </select>

                <select 
                    value={filters.tech}
                    onChange={e => setFilters({...filters, tech: e.target.value})}
                    className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none hover:border-slate-300 bg-white cursor-pointer transition-all"
                >
                    <option>Công nghệ</option>
                    <option>Blockchain</option>
                    <option>AI</option>
                    <option>Web</option>
                </select>

                <select 
                    value={filters.div}
                    onChange={e => setFilters({...filters, div: e.target.value})}
                    className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none hover:border-slate-300 bg-white cursor-pointer transition-all"
                >
                    <option>Bộ phận</option>
                    <option>Division 1</option>
                    <option>Division 2</option>
                    <option>Global</option>
                </select>

                <div className="w-auto">
                    <DateRangePicker 
                        startDate={filters.startDate} 
                        endDate={filters.endDate} 
                        onChange={(start, end) => setFilters(prev => ({ ...prev, startDate: start, endDate: end }))} 
                    />
                </div>

                {isFiltered && (
                    <button onClick={clearFilters} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-50 transition-all animate-fade-in">Xoá bộ lọc</button>
                )}
                
                <div className="ml-auto">
                    <button className="px-6 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                        Tải xuống
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-900 font-bold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                        <tr>
                            <th className="py-4 pr-4">Mã dự án</th>
                            <th className="py-4 pr-4">Tên dự án</th>
                            <th className="py-4 pr-4">Khách hàng</th>
                            <th className="py-4 pr-4">Ngày bắt đầu</th>
                            <th className="py-4 pr-4">Ngày kết thúc</th>
                            <th className="py-4 pr-4">Bộ phận</th>
                            <th className="py-4 pr-4 text-center">Man-month</th>
                            <th className="py-4 pr-4">Công nghệ</th>
                            <th className="py-4">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((p: Project) => (
                            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => onViewDetail(p)}>
                                <td className="py-5 pr-4 text-slate-500 font-medium">{p.code}</td>
                                <td className="py-5 pr-4 font-bold text-slate-900">{p.name}</td>
                                <td className="py-5 pr-4 text-slate-500 font-medium">{clients.find((c: Client) => c.id === p.client_id)?.name || '-'}</td>
                                <td className="py-5 pr-4 text-slate-500">{formatVN(p.start_date)}</td>
                                <td className="py-5 pr-4 text-slate-500">{formatVN(p.end_date)}</td>
                                <td className="py-5 pr-4 text-slate-500">{p.division || '-'}</td>
                                <td className="py-5 pr-4 text-center text-slate-500">{p.man_month || 50}</td>
                                <td className="py-5 pr-4 text-slate-500">{p.technology || '-'}</td>
                                <td className="py-5"><StatusBadge type="project" status={p.status_id} project={p} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-12 gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 transition-all" disabled><ChevronDown className="rotate-90" size={14}/></button>
                <button className="w-8 h-8 flex items-center justify-center border border-black bg-black text-white text-xs font-bold rounded shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-500 rounded transition-all">2</button>
                <span className="flex items-center px-2 text-slate-300 font-medium">...</span>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-500 rounded transition-all">10</button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-500 rounded transition-all"><ChevronRight size={14}/></button>
            </div>
        </div>
    );
};

// --- TRANG CHI TIẾT DỰ ÁN (S004 - View detail) ---
export const ProjectDetailView = ({ project, onBack, onEdit, onNavigate }: any) => {
    const [activeTab, setActiveTab] = useState<'contracts' | 'revenue' | 'history'>('contracts');
    const mockData = getMockData();
    const client = mockData.clients.find(c => c.id === project.client_id);
    const contracts = mockData.contracts.filter(c => c.project_id === project.id);
    const invoices = mockData.invoices.filter(i => i.project_id === project.id);

    const totalValue = contracts.reduce((sum, c) => sum + c.total_value, 0);
    const netRevenue = contracts.reduce((sum, c) => sum + (c.net_revenue || 0), 0);
    const debt = invoices.filter(i => i.status_id === 4).reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);

    const formatVN = (dateStr: string) => {
        if (!dateStr) return '-';
        if (dateStr.includes('/')) return dateStr;
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="min-h-screen pb-10 bg-slate-50 animate-fade-in">
            <div className="bg-white px-8 py-5 flex justify-between items-center sticky top-0 z-10 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                        <p className="text-xs text-slate-500 font-medium">Mã dự án: {project.code}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all">Request start</button>
                    <button onClick={() => onNavigate('/contracts')} className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all">Thêm hợp đồng</button>
                    <button onClick={() => onEdit(project)} className="px-8 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-md transition-all active:scale-95">Chỉnh sửa</button>
                </div>
            </div>

            <div className="px-8 max-w-[1600px] mx-auto space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wider">Thông tin dự án</h3>
                            <StatusBadge type="project" status={project.status_id} project={project} />
                        </div>
                        
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-4"><span className="text-slate-400 font-medium w-40">Tên khách hàng:</span> <span className="font-bold text-slate-900">{client?.name}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 font-medium w-40">Công nghệ:</span> <span className="font-bold text-slate-900">{project.technology}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 font-medium w-40">Bộ phận phát triển:</span> <span className="font-bold text-slate-900">{project.division}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 font-medium w-40">Ngày bắt đầu:</span> <span className="font-bold text-slate-900">{formatVN(project.start_date)}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 font-medium w-40">Ngày kết thúc:</span> <span className="font-bold text-slate-900">{formatVN(project.end_date)}</span></div>
                            <div className="flex items-start gap-4"><span className="text-slate-400 font-medium w-40 mt-0.5">Mô tả:</span> <span className="font-bold text-slate-900 flex-1 leading-relaxed">{project.description || 'Số hoá phần mềm thanh toán mobile'}</span></div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="font-bold text-slate-900 mb-2 pl-2 uppercase text-[10px] tracking-widest text-slate-400">Tổng quan tài chính</h3>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center group cursor-pointer hover:bg-white transition-all shadow-sm" onClick={() => onNavigate('/contracts')}>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Tổng giá trị hợp đồng</div>
                                <div className="text-xl font-bold text-slate-900">{totalValue.toLocaleString()} US$</div>
                            </div>
                            <div className="p-1.5 rounded-full border border-slate-300 group-hover:border-black transition-colors"><ChevronRight size={18} /></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center group cursor-pointer hover:bg-white transition-all shadow-sm" onClick={() => onNavigate('/contracts')}>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Doanh thu (NET)</div>
                                <div className="text-xl font-bold text-slate-900">{netRevenue.toLocaleString()} US$</div>
                            </div>
                            <div className="p-1.5 rounded-full border border-slate-300 group-hover:border-black transition-colors"><ChevronRight size={18} /></div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-between items-center group cursor-pointer hover:bg-white transition-all shadow-sm" onClick={() => onNavigate('/invoices')}>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Công nợ</div>
                                <div className="text-xl font-bold text-slate-900">{debt.toLocaleString()} US$</div>
                            </div>
                            <div className="p-1.5 rounded-full border border-slate-300 group-hover:border-black transition-colors"><ChevronRight size={18} /></div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-200 p-1 rounded-xl w-fit flex gap-1 shadow-inner">
                    <button onClick={() => setActiveTab('contracts')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'contracts' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Hợp đồng ({contracts.length})</button>
                    <button onClick={() => setActiveTab('revenue')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'revenue' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Doanh thu & Công số</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Lịch sử thay đổi</button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm min-h-[500px]">
                    {activeTab === 'contracts' && (
                        <div className="space-y-6">
                            {contracts.map((c, i) => {
                                let statusLabel = 'Chờ ký';
                                let badgeColor = 'bg-slate-100 text-slate-500';
                                if (c.status_id === 2) {
                                    const now = new Date();
                                    const end = new Date(c.end_date.split('/').reverse().join('-'));
                                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    if (diff < 0) { statusLabel = 'Đã hết hạn'; badgeColor = 'bg-red-50 text-red-500'; }
                                    else if (diff <= 3) { statusLabel = `Hết hạn sau ${diff} ngày`; badgeColor = 'bg-orange-50 text-orange-500'; }
                                    else { statusLabel = 'Đã ký kết'; badgeColor = 'bg-emerald-50 text-emerald-500'; }
                                }
                                return (
                                    <div key={i} className="border border-slate-100 rounded-xl p-8 hover:bg-slate-50 transition-all flex justify-between items-start shadow-sm hover:shadow-md">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-6">
                                                <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{c.code}</h4>
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>{statusLabel}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-20 gap-y-4 text-sm">
                                                <div className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-400 font-medium">Ngày ký kết:</span> <span className="font-bold text-slate-900">{c.sign_date || '-'}</span></div>
                                                <div className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-400 font-medium">Ngày bắt đầu:</span> <span className="font-bold text-slate-900">{c.start_date}</span></div>
                                                <div className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-400 font-medium">Giá trị hợp đồng:</span> <span className="font-bold text-slate-900">{c.total_value.toLocaleString()} {c.currency}</span></div>
                                                <div className="flex justify-between border-b border-slate-50 pb-1"><span className="text-slate-400 font-medium">Ngày kết thúc:</span> <span className="font-bold text-slate-900">{c.end_date}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {contracts.length === 0 && <p className="text-center text-slate-400 py-20 font-medium">Chưa có hợp đồng nào liên kết với dự án này.</p>}
                        </div>
                    )}

                    {activeTab === 'revenue' && (
                        <div className="p-6 h-[500px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={[
                                    {name: '01/2024', rev: 350000, mm: 1.5},
                                    {name: '02/2024', rev: 400000, mm: 1.8},
                                    {name: '03/2024', rev: 300000, mm: 1.2},
                                    {name: '04/2024', rev: 450000, mm: 2.1},
                                    {name: '05/2024', rev: 500000, mm: 2.0},
                                    {name: '06/2024', rev: 420000, mm: 1.9},
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                                    <YAxis hide />
                                    <RechartsTooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xl">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{payload[0].payload.name}</div>
                                                        <div className="text-sm font-bold text-slate-900 mb-1">{Number(payload[0].value).toLocaleString()} US$</div>
                                                        <div className="text-sm font-bold text-slate-500">{payload[1].value} man-month</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="rev" fill="#cbd5e1" barSize={40} radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="mm" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-8 py-2">
                            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm transition-all hover:border-slate-300">
                                <div className="font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    Thay đổi thông tin: Địa chỉ 
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                </div>
                                <div className="space-y-3 mb-8 text-sm">
                                    <div><p className="font-medium text-slate-700">Trước thay đổi:</p></div>
                                    <div><p className="font-medium text-slate-700">Sau thay đổi:</p></div>
                                </div>
                                <div className="text-sm text-slate-500 font-medium">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm transition-all hover:border-slate-300">
                                <div className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-wide">Tạo mới</div>
                                <div className="text-sm text-slate-500 font-medium">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
