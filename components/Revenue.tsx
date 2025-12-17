
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
        <div className="bg-white p-8 rounded-xl min-h-screen">
            <FormHeader title={initialData ? "Sửa phân bổ doanh thu" : "Thêm phân bổ doanh thu"} onBack={onBack} onSave={() => onSave(formData)} />
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Hoá đơn *</label>
                    <select value={formData.invoice_id} onChange={e => handleChange('invoice_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                         {invoices.map((i: Invoice) => <option key={i.id} value={i.id}>{i.invoice_no}</option>)}
                    </select>
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Salesman *</label>
                    <select value={formData.sales_user_id} onChange={e => handleChange('sales_user_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                         {users.map((u: User) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Số tiền doanh thu *</label>
                     <input type="number" value={formData.revenue_amount} onChange={e => handleChange('revenue_amount', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Phần trăm hoá đơn (%)</label>
                    <input type="number" value={formData.percent_of_invoice} onChange={e => handleChange('percent_of_invoice', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Ngày ghi nhận</label>
                    <input type="date" value={formData.allocation_date} onChange={e => handleChange('allocation_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
            </div>
        </div>
    );
};

export const RevenueModule = ({ data, invoices, users, onAdd, onEdit, onDelete }: any) => {
    const mockData = getMockData(); 
    const allProjects = mockData.projects;
    const allClients = mockData.clients;
    const allContracts = mockData.contracts;
    const allMonthlyData = mockData.monthlyData;
    const permissions = mockData.permissions;

    const [filters, setFilters] = useState({
        search: '',
        year: new Date().getFullYear(),
        division: 'All',
        status: 'All', 
        currency: 'USD'
    });
    
    const canView = permissions?.find((p: Permission) => p.module === 'Doanh thu' && p.role === 'Sale Admin')?.canView ?? true;
    
    const [systemError, setSystemError] = useState(false);
    const [filterError, setFilterError] = useState('');

    const navigate = useNavigate();

    if (!canView) {
        return <div className="p-6 text-red-600 font-medium">Tài khoản chưa được cấp quyền.</div>;
    }

    if (systemError) {
        return <div className="p-6 text-red-600 font-medium">Có lỗi xảy ra, vui lòng thử lại sau.</div>;
    }

    const filteredProjects = allProjects.filter((p: Project) => {
        if (filters.search.length > 255) {
            return false; 
        }

        if (filters.search) {
            const term = filters.search.toLowerCase();
            const client = allClients.find(c => c.id === p.client_id);
            if (!p.name.toLowerCase().includes(term) && !client?.name.toLowerCase().includes(term)) {
                return false;
            }
        }

        if (filters.division !== 'All' && p.division !== filters.division) return false;

        if (filters.status !== 'All') {
            const contract = allContracts.find(c => c.project_id === p.id);
            if (filters.status === 'Đã ký' && contract?.status_id !== 2) return false;
            if (filters.status === 'Chờ ký' && contract?.status_id !== 1) return false;
            if (filters.status === 'Dự kiến' && contract?.status_id !== 3) return false;
        }

        return true;
    });

    const convertCurrency = (amount: number, from: string, to: string): number => {
        const rates: Record<string, number> = {
            'USD': 1,
            'JPY': 150,
            'VND': 25000
        };
        if (!rates[from] || !rates[to]) return amount;
        return (amount / rates[from]) * rates[to];
    };

    const totalMonthlyRevenue = Array(12).fill(0);

    const tableRows = filteredProjects.map((p: Project) => {
        const client = allClients.find(c => c.id === p.client_id);
        const contract = allContracts.find(c => c.project_id === p.id);
        
        const monthlyRevenues = Array(12).fill(0).map((_, idx) => {
            const monthIndex = idx + 1;
            const dataPoint = allMonthlyData.find((d: MonthlyData) => 
                d.projectId === p.id && d.month === monthIndex && d.type === 'revenue'
            );
            const rawVal = dataPoint ? dataPoint.value : 0;
            const val = convertCurrency(rawVal, p.currency, filters.currency);
            
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh] flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý doanh thu</h2>
                
                <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dự án hoặc khách hàng..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black" 
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                        <Download size={16} /> Tải xuống
                    </button>
                </div>
                {filterError && <div className="text-red-500 text-xs mb-4">{filterError}</div>}

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="p-2"><Filter size={20} className="text-slate-900" /></div>
                    
                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300"
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                        >
                            <option value={2023}>2023</option>
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300"
                            value={filters.division}
                            onChange={(e) => handleFilterChange('division', e.target.value)}
                        >
                            <option value="All">Bộ phận</option>
                            <option value="Division 1">Division 1</option>
                            <option value="Division 2">Division 2</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300"
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

                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300"
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
                        <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50">Xoá bộ lọc</button>
                    )}
                </div>

                <div className="flex-1 overflow-auto relative border border-slate-200 rounded-lg">
                    <div className="sticky top-0 z-20 bg-slate-200 font-bold text-xs text-slate-900 border-b border-slate-300 flex min-w-max">
                        <div className="w-16 p-3 sticky left-0 bg-slate-200 z-30"></div> 
                        <div className="w-24 p-3 sticky left-16 bg-slate-200 z-30"></div> 
                        <div className="w-40 p-3"></div> 
                        <div className="w-40 p-3 text-right">Tổng doanh thu</div> 
                        <div className="w-24 p-3"></div> 
                        <div className="w-24 p-3"></div> 
                        {totalMonthlyRevenue.map((val, idx) => (
                            <div key={idx} className="w-32 p-3 text-right border-l border-slate-300">
                                {val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {filters.currency}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white font-bold text-xs text-slate-900 border-b border-slate-200 flex min-w-max">
                        <div className="w-16 p-3 sticky left-0 bg-white z-10 border-r border-slate-100">
                            <input type="checkbox" className="rounded border-slate-300" />
                        </div>
                        <div className="w-24 p-3 sticky left-16 bg-white z-10 border-r border-slate-100">Mã KH</div>
                        <div className="w-40 p-3 border-r border-slate-100">Tên khách hàng</div>
                        <div className="w-40 p-3 border-r border-slate-100">Dự án</div>
                        <div className="w-24 p-3 border-r border-slate-100">Bộ phận</div>
                        <div className="w-24 p-3 border-r border-slate-100">Trạng thái</div>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <div key={m} className="w-32 p-3 text-right border-r border-slate-100">Tháng {m}</div>
                        ))}
                    </div>

                    {tableRows.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">Không tìm thấy kết quả.</div>
                    ) : (
                        <div className="min-w-max">
                            {tableRows.map((row, index) => {
                                const status = row.contract?.status_id === 1 ? 'Chờ ký' : row.contract?.status_id === 2 ? 'Đã ký' : 'Dự kiến';
                                return (
                                    <div 
                                        key={row.project.id} 
                                        className="flex text-xs text-slate-700 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors group"
                                        onClick={() => navigate('/projects')} 
                                    >
                                        <div className="w-16 p-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 flex items-center">
                                            <input type="checkbox" onClick={e => e.stopPropagation()} className="rounded border-slate-300" />
                                        </div>
                                        <div className="w-24 p-3 sticky left-16 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 font-medium">
                                            {row.client?.code}
                                        </div>
                                        <div className="w-40 p-3 border-r border-slate-100 truncate" title={row.client?.name}>
                                            {row.client?.name}
                                        </div>
                                        <div className="w-40 p-3 border-r border-slate-100 truncate font-medium" title={row.project.name}>
                                            {row.project.name}
                                        </div>
                                        <div className="w-24 p-3 border-r border-slate-100">
                                            {row.project.division}
                                        </div>
                                        <div className="w-24 p-3 border-r border-slate-100">
                                            {status}
                                        </div>
                                        {row.monthlyRevenues.map((val, idx) => (
                                            <div key={idx} className="w-32 p-3 text-right border-r border-slate-100">
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
