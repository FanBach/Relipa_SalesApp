
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight, Download, X, Plus, Clock } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Project, Client, Contract, Invoice, ChangeLog, MonthlyData } from '../types';
import { StatusBadge, FormHeader, DateRangePicker, parseDDMMYYYY } from './Shared';
import { getMockData } from '../services/mockData';
import { RequestStartModal } from './ProjectContractFeatures';

// --- TRANG THÊM/SỬA DỰ ÁN (S004 - Add new & Edit) ---
export const ProjectForm = ({ initialData, clients, onBack, onSave }: any) => {
    const defaultData = {
        code: '',
        name: '',
        client_id: undefined,
        technology: '',
        division: '',
        start_date: '',
        end_date: '',
        status_id: 2,
        description: ''
    };

    const [formData, setFormData] = useState<Partial<Project>>({ ...defaultData, ...initialData });
    
    // State cho trường tìm kiếm khách hàng
    const [clientSearch, setClientSearch] = useState('');
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);

    // Khởi tạo giá trị text khách hàng nếu đang edit hoặc có data
    useEffect(() => {
        if (formData.client_id) {
            const selectedClient = clients.find((c: Client) => c.id === formData.client_id);
            if (selectedClient) {
                setClientSearch(selectedClient.name);
            }
        }
    }, [formData.client_id, clients]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAutoCode = () => {
        if (!formData.client_id) {
            alert("Vui lòng chọn Khách hàng trước khi sinh mã.");
            return;
        }
        if (!formData.name) {
            alert("Vui lòng nhập Tên dự án trước khi sinh mã.");
            return;
        }

        // AAA: Mã khách hàng
        const client = clients.find((c: Client) => c.id === formData.client_id);
        const clientCode = client ? client.code : 'AAA';

        // XX: 2 số cuối của năm phát sinh (lấy theo ngày bắt đầu hoặc hiện tại)
        const date = formData.start_date ? new Date(formData.start_date) : new Date();
        const yearXX = date.getFullYear().toString().slice(-2);

        // YYY: Số thứ tự dự án trong năm (Simulate random)
        const sequenceYYY = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        // BBB: 3 ký tự từ tên project
        const cleanName = formData.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const nameBBB = cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X');

        // Format: XXYYY_AAA_BBB
        const generatedCode = `${yearXX}${sequenceYYY}_${clientCode}_${nameBBB}`;
        handleChange('code', generatedCode);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl min-h-screen animate-fade-in">
            <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông tin dự án</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Huỷ</button>
                    <button onClick={() => onSave(formData)} className="px-10 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md transition-all active:scale-95">Lưu</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-8 max-w-6xl mx-auto">
                <div className="space-y-1.5 relative">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Khách hàng <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className={`w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none bg-white dark:bg-slate-700 transition-all text-slate-900 dark:text-white`}
                        placeholder="Nhập tên khách hàng để tìm kiếm..."
                        value={clientSearch}
                        onChange={(e) => {
                            setClientSearch(e.target.value);
                            setShowClientSuggestions(true);
                            if (!e.target.value) handleChange('client_id', undefined);
                        }}
                        onFocus={() => setShowClientSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                    />
                    {showClientSuggestions && (
                        <div className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {clients.filter((c: Client) => c.name.toLowerCase().includes(clientSearch.toLowerCase())).length > 0 ? (
                                clients.filter((c: Client) => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map((c: Client) => (
                                    <div
                                        key={c.id}
                                        className="p-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-900 dark:text-white"
                                        onClick={() => {
                                            handleChange('client_id', c.id);
                                            setClientSearch(c.name);
                                            setShowClientSuggestions(false);
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                ))
                            ) : (
                                <div className="p-2.5 text-sm text-slate-400">Không tìm thấy khách hàng</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên dự án <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        placeholder="Tên dự án"
                        value={formData.name || ''} 
                        onChange={e => handleChange('name', e.target.value)} 
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none dark:bg-slate-700 dark:text-white transition-all" 
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Công nghệ <span className="text-red-500">*</span></label>
                    <select 
                        className={`w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none bg-white dark:bg-slate-700 transition-all ${!formData.technology ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        value={formData.technology || ''}
                        onChange={e => handleChange('technology', e.target.value)}
                    >
                        <option value="" disabled hidden>Công nghệ</option>
                        <option value="Blockchain" className="text-slate-900 dark:text-white">Blockchain</option>
                        <option value="AI" className="text-slate-900 dark:text-white">AI</option>
                        <option value="Web" className="text-slate-900 dark:text-white">Web</option>
                        <option value="System" className="text-slate-900 dark:text-white">System</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mã dự án <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Mã dự án"
                            value={formData.code || ''} 
                            onChange={e => handleChange('code', e.target.value)}
                            className="flex-1 p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none bg-white dark:bg-slate-700 dark:text-white transition-all" 
                        />
                        <button 
                            onClick={handleAutoCode}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Tự động
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bộ phận phát triển</label>
                    <select 
                        value={formData.division || ''} 
                        onChange={e => handleChange('division', e.target.value)} 
                        className={`w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none bg-white dark:bg-slate-700 transition-all ${!formData.division ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                    >
                        <option value="" disabled hidden>Bộ phận phát triển</option>
                        <option value="Division 1" className="text-slate-900 dark:text-white">Division 1</option>
                        <option value="Division 2" className="text-slate-900 dark:text-white">Division 2</option>
                        <option value="Global" className="text-slate-900 dark:text-white">Global</option>
                    </select>
                </div>

                <div className="row-span-3 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả</label>
                    <textarea 
                        value={formData.description || ''} 
                        onChange={e => handleChange('description', e.target.value)} 
                        placeholder="Mô tả dự án ..."
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm h-[180px] resize-none focus:ring-1 focus:ring-black dark:focus:ring-white outline-none dark:bg-slate-700 dark:text-white transition-all"
                    ></textarea>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngày bắt đầu <span className="text-red-500">*</span></label>
                    <input 
                        type="date" 
                        value={formData.start_date || ''} 
                        onClick={(e) => e.currentTarget.showPicker()}
                        onChange={e => handleChange('start_date', e.target.value)} 
                        className={`w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none dark:bg-slate-700 dark:text-white transition-all ${!formData.start_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngày kết thúc <span className="text-red-500">*</span></label>
                    <input 
                        type="date" 
                        value={formData.end_date || ''} 
                        onClick={(e) => e.currentTarget.showPicker()}
                        onChange={e => handleChange('end_date', e.target.value)} 
                        className={`w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none dark:bg-slate-700 dark:text-white transition-all ${!formData.end_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
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
            const matchesSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.code.toLowerCase().includes(filters.search.toLowerCase());
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

    const isFiltered = filters.status !== 'Tất cả' || filters.tech !== 'Tất cả' || filters.div !== 'Tất cả' || filters.startDate !== '' || filters.endDate !== '';

    const clearFilters = () => setFilters({ search: '', status: 'Tất cả', tech: 'Tất cả', div: 'Tất cả', startDate: '', endDate: '' });

    const formatVN = (dateStr: string) => {
        if (!dateStr) return '-';
        if (dateStr.includes('/')) return dateStr;
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[80vh]">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý dự án</h2>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {filteredData.length} dự án
                        </div>
                        <button onClick={onAdd} className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center gap-2 shadow-sm">
                            Thêm dự án
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dự án (Tên, Mã)..." 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white" 
                            value={filters.search} 
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} 
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="p-2 text-slate-900 dark:text-white"><Filter size={20} /></div>
                    
                    <div className="relative">
                        <select 
                            value={filters.status} 
                            onChange={e => setFilters({...filters, status: e.target.value})}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                        >
                            <option>Trạng thái</option>
                            <option>Đang thực hiện</option>
                            <option>Hoàn thành</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select 
                            value={filters.tech}
                            onChange={e => setFilters({...filters, tech: e.target.value})}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                        >
                            <option>Công nghệ</option>
                            <option>Blockchain</option>
                            <option>AI</option>
                            <option>Web</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select 
                            value={filters.div}
                            onChange={e => setFilters({...filters, div: e.target.value})}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                        >
                            <option>Bộ phận</option>
                            <option>Division 1</option>
                            <option>Division 2</option>
                            <option>Global</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="w-auto">
                        <DateRangePicker 
                            startDate={filters.startDate} 
                            endDate={filters.endDate} 
                            onChange={(start, end) => setFilters(prev => ({ ...prev, startDate: start, endDate: end }))} 
                        />
                    </div>

                    {isFiltered && (
                        <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Xoá bộ lọc</button>
                    )}
                    
                    <div className="ml-auto">
                        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
                            Tải xuống
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
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
                                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group" onClick={() => onViewDetail(p)}>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{p.code}</td>
                                    <td className="py-4 pr-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{clients.find((c: Client) => c.id === p.client_id)?.name || '-'}</td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{formatVN(p.start_date)}</td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{formatVN(p.end_date)}</td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{p.division || '-'}</td>
                                    <td className="py-4 pr-4 text-center text-slate-600 dark:text-slate-400">{p.man_month || 50}</td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{p.technology || '-'}</td>
                                    <td className="py-4"><StatusBadge type="project" status={p.status_id} project={p} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center mt-6 gap-2">
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all" disabled><ChevronDown className="rotate-90 text-slate-600 dark:text-slate-400" size={14}/></button>
                    <button className="w-8 h-8 flex items-center justify-center border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded shadow-sm">1</button>
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 rounded transition-all">2</button>
                    <span className="flex items-center px-2 text-slate-300 dark:text-slate-600 font-medium">...</span>
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 rounded transition-all">10</button>
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded transition-all"><ChevronRight size={14}/></button>
                </div>
            </div>
        </div>
    );
};

// --- TRANG CHI TIẾT DỰ ÁN (S004 - View detail) ---
export const ProjectDetailView = ({ project, onBack, onEdit, onNavigate }: any) => {
    const [activeTab, setActiveTab] = useState<'contracts' | 'revenue' | 'history'>('contracts');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    const mockData = getMockData();
    const client = mockData.clients.find(c => c.id === project.client_id);
    const contracts = mockData.contracts.filter(c => c.project_id === project.id);
    const invoices = mockData.invoices.filter(i => i.project_id === project.id);

    const activeContract = contracts.find(c => c.status_id === 2) || contracts[0] || {} as Contract;

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
        <div className="min-h-screen pb-10 bg-slate-50 dark:bg-slate-900 animate-fade-in">
            {/* Header ... */}
            <div className="bg-white dark:bg-slate-800 px-8 py-5 flex justify-between items-center sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mã dự án: {project.code}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsRequestModalOpen(true)} className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Request start</button>
                    <button onClick={() => onNavigate('/contracts', { state: { createContractForProject: project.id, clientId: project.client_id } })} className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Thêm hợp đồng</button>
                    <button onClick={() => onEdit(project)} className="px-8 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md transition-all active:scale-95">Chỉnh sửa</button>
                </div>
            </div>
            
            {/* Body ... (Reusing existing body logic) */}
            <div className="px-8 max-w-[1600px] mx-auto space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm tracking-wider">Thông tin dự án</h3>
                            <StatusBadge type="project" status={project.status_id} project={project} />
                        </div>
                        
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-4"><span className="text-slate-400 dark:text-slate-500 font-medium w-40">Tên khách hàng:</span> <span className="font-bold text-slate-900 dark:text-white">{client?.name}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 dark:text-slate-500 font-medium w-40">Công nghệ:</span> <span className="font-bold text-slate-900 dark:text-white">{project.technology}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 dark:text-slate-500 font-medium w-40">Bộ phận phát triển:</span> <span className="font-bold text-slate-900 dark:text-white">{project.division}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 dark:text-slate-500 font-medium w-40">Ngày bắt đầu:</span> <span className="font-bold text-slate-900 dark:text-white">{formatVN(project.start_date)}</span></div>
                            <div className="flex items-center gap-4"><span className="text-slate-400 dark:text-slate-500 font-medium w-40">Ngày kết thúc:</span> <span className="font-bold text-slate-900 dark:text-white">{formatVN(project.end_date)}</span></div>
                            <div className="flex items-start gap-4"><span className="text-slate-400 dark:text-slate-500 font-medium w-40 mt-0.5">Mô tả:</span> <span className="font-bold text-slate-900 dark:text-white flex-1 leading-relaxed">{project.description || 'Số hoá phần mềm thanh toán mobile'}</span></div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 pl-2 uppercase text-[10px] tracking-widest text-slate-400 dark:text-slate-500">Tổng quan tài chính</h3>
                        <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 flex justify-between items-center group cursor-pointer hover:bg-white dark:hover:bg-slate-600 transition-all shadow-sm" onClick={() => onNavigate('/contracts')}>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase mb-1 tracking-wider">Tổng giá trị hợp đồng</div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white">{totalValue.toLocaleString()} US$</div>
                            </div>
                            <div className="p-1.5 rounded-full border border-slate-300 dark:border-slate-500 group-hover:border-black dark:group-hover:border-white transition-colors"><ChevronRight size={18} className="dark:text-slate-200" /></div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 flex justify-between items-center group cursor-pointer hover:bg-white dark:hover:bg-slate-600 transition-all shadow-sm" onClick={() => onNavigate('/contracts')}>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase mb-1 tracking-wider">Doanh thu (NET)</div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white">{netRevenue.toLocaleString()} US$</div>
                            </div>
                            <div className="p-1.5 rounded-full border border-slate-300 dark:border-slate-500 group-hover:border-black dark:group-hover:border-white transition-colors"><ChevronRight size={18} className="dark:text-slate-200" /></div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600 flex justify-between items-center group cursor-pointer hover:bg-white dark:hover:bg-slate-600 transition-all shadow-sm" onClick={() => onNavigate('/invoices')}>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase mb-1 tracking-wider">Công nợ</div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white">{debt.toLocaleString()} US$</div>
                            </div>
                            <div className="p-1.5 rounded-full border border-slate-300 dark:border-slate-500 group-hover:border-black dark:group-hover:border-white transition-colors"><ChevronRight size={18} className="dark:text-slate-200" /></div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-xl w-fit flex gap-1 shadow-inner">
                    <button onClick={() => setActiveTab('contracts')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'contracts' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Hợp đồng ({contracts.length})</button>
                    <button onClick={() => setActiveTab('revenue')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'revenue' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Doanh thu & Công số</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Lịch sử thay đổi</button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm min-h-[500px]">
                    {activeTab === 'contracts' && (
                        <div className="space-y-6">
                            {contracts.map((c, i) => {
                                let statusLabel = 'Chờ ký';
                                let badgeColor = 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300';
                                if (c.status_id === 2) {
                                    const now = new Date();
                                    const end = new Date(c.end_date.split('/').reverse().join('-'));
                                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    if (diff < 0) { statusLabel = 'Đã hết hạn'; badgeColor = 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'; }
                                    else if (diff <= 3) { statusLabel = `Hết hạn sau ${diff} ngày`; badgeColor = 'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400'; }
                                    else { statusLabel = 'Đã ký kết'; badgeColor = 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400'; }
                                }
                                return (
                                    <div key={i} className="border border-slate-100 dark:border-slate-700 rounded-xl p-8 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex justify-between items-start shadow-sm hover:shadow-md">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-6">
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">{c.code}</h4>
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>{statusLabel}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-20 gap-y-4 text-sm">
                                                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-1"><span className="text-slate-400 dark:text-slate-500 font-medium">Ngày ký kết:</span> <span className="font-bold text-slate-900 dark:text-white">{c.sign_date || '-'}</span></div>
                                                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-1"><span className="text-slate-400 dark:text-slate-500 font-medium">Ngày bắt đầu:</span> <span className="font-bold text-slate-900 dark:text-white">{c.start_date}</span></div>
                                                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-1"><span className="text-slate-400 dark:text-slate-500 font-medium">Giá trị hợp đồng:</span> <span className="font-bold text-slate-900 dark:text-white">{c.total_value.toLocaleString()} {c.currency}</span></div>
                                                <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-1"><span className="text-slate-400 dark:text-slate-500 font-medium">Ngày kết thúc:</span> <span className="font-bold text-slate-900 dark:text-white">{c.end_date}</span></div>
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="name" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} dy={10} stroke="#94a3b8" />
                                    {/* Primary Y-Axis for Revenue (Bar) */}
                                    <YAxis yAxisId="left" hide />
                                    {/* Secondary Y-Axis for Man-month (Line) */}
                                    <YAxis yAxisId="right" orientation="right" hide />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    {/* Assign Y-Axis IDs */}
                                    <Bar yAxisId="left" dataKey="revenue" fill="#cbd5e1" barSize={40} radius={[4, 4, 0, 0]} />
                                    <Line yAxisId="right" type="monotone" dataKey="mm" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-8 py-2">
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-500">
                                <div className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    Thay đổi thông tin: Địa chỉ
                                </div>
                                <div className="space-y-3 mb-8 text-sm">
                                    <div><p className="font-medium text-slate-700 dark:text-slate-300">Trước thay đổi:</p></div>
                                    <div><p className="font-medium text-slate-700 dark:text-slate-300">Sau thay đổi:</p></div>
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                            </div>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-500">
                                <div className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-sm tracking-wide">Tạo mới</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <RequestStartModal 
                isOpen={isRequestModalOpen} 
                onClose={() => setIsRequestModalOpen(false)} 
                contract={activeContract} 
                project={project} 
            />
        </div>
    );
};
