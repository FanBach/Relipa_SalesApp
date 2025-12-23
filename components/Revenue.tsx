
import React, { useState } from 'react';
import { Search, Filter, Calendar as CalendarIcon, ChevronDown, Download } from 'lucide-react';
import { RevenueAllocation, Project, Invoice, User, MonthlyData, Permission } from '../types';
import { FormHeader } from './Shared';
import { useNavigate } from 'react-router-dom';
import { getMockData } from '../services/mockData';

export const RevenueForm = ({ initialData, invoices, users, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<RevenueAllocation>>(initialData || {
        invoice_id: invoices[0]?.id,
        sales_user_id: users[0]?.id,
        revenue_amount: 0,
        percent_of_invoice: 0,
        allocation_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl min-h-screen">
            <FormHeader title={initialData ? "Sửa phân bổ doanh thu" : "Thêm phân bổ doanh thu"} onBack={onBack} onSave={() => onSave(formData)} />
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Hoá đơn <span className="text-red-500">*</span></label>
                    <select 
                        className={`w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white ${!formData.invoice_id ? 'text-slate-400' : 'text-slate-900'}`}
                        value={formData.invoice_id} 
                        onChange={e => handleChange('invoice_id', Number(e.target.value))} 
                    >
                         {invoices.map((i: Invoice) => <option key={i.id} value={i.id} className="text-slate-900 dark:text-white">{i.invoice_no}</option>)}
                    </select>
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Salesman <span className="text-red-500">*</span></label>
                    <select 
                        className={`w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white ${!formData.sales_user_id ? 'text-slate-400' : 'text-slate-900'}`}
                        value={formData.sales_user_id} 
                        onChange={e => handleChange('sales_user_id', Number(e.target.value))} 
                    >
                         {users.map((u: User) => <option key={u.id} value={u.id} className="text-slate-900 dark:text-white">{u.full_name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Số tiền doanh thu <span className="text-red-500">*</span></label>
                     <input type="number" value={formData.revenue_amount} onChange={e => handleChange('revenue_amount', Number(e.target.value))} className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Phần trăm hoá đơn (%)</label>
                    <input type="number" value={formData.percent_of_invoice} onChange={e => handleChange('percent_of_invoice', Number(e.target.value))} className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">Ngày ghi nhận</label>
                    <input 
                        type="date" 
                        className={`w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white ${!formData.allocation_date ? 'text-slate-400' : 'text-slate-900'}`}
                        value={formData.allocation_date} 
                        onClick={(e) => e.currentTarget.showPicker()} 
                        onChange={e => handleChange('allocation_date', e.target.value)} 
                    />
                </div>
            </div>
        </div>
    );
};

export const RevenueModule = ({ data, invoices, users, onAdd, onEdit, onDelete }: any) => {
    // --- Mock Data Access (since props might not have everything) ---
    const mockData = getMockData(); // Access global mock data to ensure we have monthlyData
    const allProjects = mockData.projects;
    const allClients = mockData.clients;
    const allContracts = mockData.contracts;
    const allMonthlyData = mockData.monthlyData;
    const masterData = mockData.masterCategories;
    const permissions = mockData.permissions;

    // --- State ---
    const [filters, setFilters] = useState({
        search: '',
        year: new Date().getFullYear(),
        division: 'All',
        status: 'All', // Contract Status: All, Signed, Pending, Forecast
        currency: 'USD'
    });
    
    // Permission Check (EX001)
    const canView = permissions?.find((p: Permission) => p.module === 'Doanh thu' && p.role === 'Sale Admin')?.canView ?? true;
    
    // Error States (EX002, EX003)
    const [systemError, setSystemError] = useState(false);
    const [filterError, setFilterError] = useState('');

    const navigate = useNavigate();

    if (!canView) {
        return <div className="p-6 text-red-600 font-medium">Tài khoản chưa được cấp quyền.</div>;
    }

    if (systemError) {
        return <div className="p-6 text-red-600 font-medium">Có lỗi xảy ra, vui lòng thử lại sau.</div>;
    }

    // --- Logic ---

    // 1. Filter Projects based on inputs
    const filteredProjects = allProjects.filter((p: Project) => {
        // EX003 - Simulate validation
        if (filters.search.length > 255) {
            // This would normally setFilterError, doing it in render for simplicity of state flow
            return false; 
        }

        // Search Name/Client
        if (filters.search) {
            const term = filters.search.toLowerCase();
            const client = allClients.find(c => c.id === p.client_id);
            if (!p.name.toLowerCase().includes(term) && !client?.name.toLowerCase().includes(term)) {
                return false;
            }
        }

        // Division
        if (filters.division !== 'All' && p.division !== filters.division) return false;

        // Status (mapped from Contract status primarily, or Project status)
        // For simplicity, let's use Project status or assume a contract exists
        if (filters.status !== 'All') {
            const contract = allContracts.find(c => c.project_id === p.id);
            // Map filter text to ID or logic
            if (filters.status === 'Đã ký' && contract?.status_id !== 2) return false;
            if (filters.status === 'Chờ ký' && contract?.status_id !== 1) return false;
            if (filters.status === 'Dự kiến' && contract?.status_id !== 3) return false;
        }

        return true;
    });

    // 2. Currency Conversion Helper
    const convertCurrency = (amount: number, from: string, to: string): number => {
        // Mock rates
        const rates: Record<string, number> = {
            'USD': 1,
            'JPY': 150,
            'VND': 25000
        };
        if (!rates[from] || !rates[to]) return amount;
        return (amount / rates[from]) * rates[to];
    };

    // 3. Aggregate Monthly Data
    // We need an array of 12 months for totals
    const totalMonthlyRevenue = Array(12).fill(0);

    const tableRows = filteredProjects.map((p: Project) => {
        const client = allClients.find(c => c.id === p.client_id);
        const contract = allContracts.find(c => c.project_id === p.id);
        
        // Get revenue data for this project
        // Note: Mock data doesn't have year, we assume it matches the selected year for demo
        const monthlyRevenues = Array(12).fill(0).map((_, idx) => {
            const monthIndex = idx + 1;
            const dataPoint = allMonthlyData.find((d: MonthlyData) => 
                d.projectId === p.id && d.month === monthIndex && d.type === 'revenue'
            );
            const rawVal = dataPoint ? dataPoint.value : 0;
            // Project currency is usually in Project or Contract. Let's use Project currency.
            const val = convertCurrency(rawVal, p.currency, filters.currency);
            
            // Add to total
            totalMonthlyRevenue[idx] += val;
            
            return val;
        });

        return {
            project: p,
            client,
            contract,
            monthlyRevenues
        };
    });

    const handleFilterChange = (key: string, value: any) => {
        if (key === 'search' && value.length > 255) {
            setFilterError('Điều kiện lọc không hợp lệ.');
        } else {
            setFilterError('');
        }
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            year: new Date().getFullYear(),
            division: 'All',
            status: 'All',
            currency: 'USD'
        });
        setFilterError('');
    };

    const formatMoney = (amount: number) => {
        if (amount === 0) return '-';
        return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + filters.currency;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[80vh] flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quản lý doanh thu</h2>
                
                {/* Search & Download */}
                <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dự án hoặc khách hàng..." 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white" 
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Download size={16} /> Tải xuống
                    </button>
                </div>
                {filterError && <div className="text-red-500 text-xs mb-4">{filterError}</div>}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="p-2"><Filter size={20} className="text-slate-900 dark:text-white" /></div>
                    
                    {/* Year */}
                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                        >
                            <option value={2023}>2023</option>
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Division */}
                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                            value={filters.division}
                            onChange={(e) => handleFilterChange('division', e.target.value)}
                        >
                            <option value="All">Bộ phận</option>
                            <option value="Division 1">Division 1</option>
                            <option value="Division 2">Division 2</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="All">Trạng thái</option>
                            <option value="Đã ký">Đã ký</option>
                            <option value="Chờ ký">Chờ ký</option>
                            <option value="Dự kiến">Dự kiến</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Currency */}
                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                            value={filters.currency}
                            onChange={(e) => handleFilterChange('currency', e.target.value)}
                        >
                            <option value="USD">Đơn vị tiền gốc: USD</option>
                            <option value="JPY">Đơn vị tiền gốc: JPY</option>
                            <option value="VND">Đơn vị tiền gốc: VND</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {(filters.division !== 'All' || filters.status !== 'All' || filters.year !== new Date().getFullYear()) && (
                        <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">Xoá bộ lọc</button>
                    )}
                </div>

                {/* Data Grid */}
                <div className="flex-1 overflow-auto relative border border-slate-200 dark:border-slate-700 rounded-lg">
                    {/* Sticky Header for Totals */}
                    <div className="sticky top-0 z-20 bg-slate-200 dark:bg-slate-700 font-bold text-xs text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-600 flex min-w-max">
                        <div className="w-16 p-3 sticky left-0 bg-slate-200 dark:bg-slate-700 z-30"></div> {/* Checkbox placeholder */}
                        <div className="w-24 p-3 sticky left-16 bg-slate-200 dark:bg-slate-700 z-30"></div> {/* Client Code placeholder */}
                        <div className="w-40 p-3"></div> {/* Client Name */}
                        <div className="w-40 p-3 text-right">Tổng doanh thu</div> 
                        <div className="w-24 p-3"></div> {/* Division */}
                        <div className="w-24 p-3"></div> {/* Status */}
                        {totalMonthlyRevenue.map((val, idx) => (
                            <div key={idx} className="w-32 p-3 text-right border-l border-slate-300 dark:border-slate-600">
                                {val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {filters.currency}
                            </div>
                        ))}
                    </div>

                    {/* Table Header */}
                    <div className="bg-white dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 flex min-w-max">
                        <div className="w-16 p-3 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600" />
                        </div>
                        <div className="w-24 p-3 sticky left-16 bg-white dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700">Mã KH</div>
                        <div className="w-40 p-3 border-r border-slate-100 dark:border-slate-700">Tên khách hàng</div>
                        <div className="w-40 p-3 border-r border-slate-100 dark:border-slate-700">Dự án</div>
                        <div className="w-24 p-3 border-r border-slate-100 dark:border-slate-700">Bộ phận</div>
                        <div className="w-24 p-3 border-r border-slate-100 dark:border-slate-700">Trạng thái</div>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <div key={m} className="w-32 p-3 text-right border-r border-slate-100 dark:border-slate-700">Tháng {m}</div>
                        ))}
                    </div>

                    {/* Table Body */}
                    {tableRows.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 dark:text-slate-400">Không tìm thấy kết quả.</div>
                    ) : (
                        <div className="min-w-max">
                            {tableRows.map((row, index) => {
                                const status = row.contract?.status_id === 1 ? 'Chờ ký' : row.contract?.status_id === 2 ? 'Đã ký' : 'Dự kiến';
                                return (
                                    <div 
                                        key={row.project.id} 
                                        className="flex text-xs text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group"
                                        onClick={() => navigate('/projects')} // Item 16
                                    >
                                        <div className="w-16 p-3 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700 z-10 border-r border-slate-100 dark:border-slate-700 flex items-center">
                                            <input type="checkbox" onClick={e => e.stopPropagation()} className="rounded border-slate-300 dark:border-slate-600" />
                                        </div>
                                        <div className="w-24 p-3 sticky left-16 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700 z-10 border-r border-slate-100 dark:border-slate-700 font-medium">
                                            {row.client?.code}
                                        </div>
                                        <div className="w-40 p-3 border-r border-slate-100 dark:border-slate-700 truncate" title={row.client?.name}>
                                            {row.client?.name}
                                        </div>
                                        <div className="w-40 p-3 border-r border-slate-100 dark:border-slate-700 truncate font-medium" title={row.project.name}>
                                            {row.project.name}
                                        </div>
                                        <div className="w-24 p-3 border-r border-slate-100 dark:border-slate-700">
                                            {row.project.division}
                                        </div>
                                        <div className="w-24 p-3 border-r border-slate-100 dark:border-slate-700">
                                            {status}
                                        </div>
                                        {row.monthlyRevenues.map((val, idx) => (
                                            <div key={idx} className="w-32 p-3 text-right border-r border-slate-100 dark:border-slate-700">
                                                {formatMoney(val)}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
