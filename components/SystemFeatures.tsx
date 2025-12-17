import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, CheckSquare, Square, MinusCircle, Search, Filter, ChevronDown, Calendar as CalendarIcon, Download, RotateCcw } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { User, Permission, MasterCategory, Project, Client, MonthlyData, Notification, Contract } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';
import { getMockData } from '../services/mockData';
import { useNavigate } from 'react-router-dom';

export const AccountForm = ({ initialData, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<User>>(initialData || {
        full_name: '',
        email: '',
        role_main: 'Salesman',
        is_active: true,
        created_at: new Date().toLocaleDateString('en-GB')
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-8 rounded-xl min-h-screen">
            <FormHeader title={initialData ? "Sửa tài khoản" : "Thêm tài khoản"} onBack={onBack} onSave={() => onSave(formData)} />
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Tên hiển thị *</label>
                    <input type="text" value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Email *</label>
                    <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Vai trò *</label>
                    <select value={formData.role_main} onChange={e => handleChange('role_main', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        <option>Sale Admin</option>
                        <option>Salesman</option>
                        <option>Account</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export const AccountsModule = ({ data, onAdd, onDelete }: any) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý tài khoản</h2>
                <FilterBar 
                    placeholder="Tìm kiếm..." 
                    onAdd={onAdd}
                    addLabel="Thêm tài khoản"
                    filters={{items: ['6 tài khoản', 'Tất cả vai trò']}}
                />
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                            <th className="py-4">Tên tài khoản</th>
                            <th className="py-4">Email</th>
                            <th className="py-4">Vai trò</th>
                            <th className="py-4">Tạo lúc</th>
                            <th className="py-4">Cập nhật lần cuối</th>
                            <th className="py-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((u: User) => (
                            <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="py-4 font-medium">{u.full_name}</td>
                                <td className="py-4 text-slate-600">{u.email}</td>
                                <td className="py-4 text-slate-600">{u.role_main}</td>
                                <td className="py-4 text-slate-600">{u.created_at}</td>
                                <td className="py-4 text-slate-600">{u.updated_at}</td>
                                <td className="py-4 text-right">
                                     <button className="px-3 py-1 border rounded hover:bg-slate-50 text-xs mr-2 text-red-600 border-red-200" onClick={(e) => { e.stopPropagation(); onDelete(u.id); }}>Xoá</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const PermissionsModule = ({ data, onUpdatePermission, onAddRole, onDeleteRole, onSave }: any) => {
    const roles = Array.from(new Set(data.map((p: Permission) => p.role))) as string[];
    const [activeRole, setActiveRole] = useState(roles[0]);
    const [newRoleName, setNewRoleName] = useState('');

    useEffect(() => {
        if (!roles.includes(activeRole) && roles.length > 0) {
            setActiveRole(roles[roles.length - 1]);
        }
    }, [roles, activeRole]);

    const handleAddRoleClick = () => {
        if (newRoleName.trim()) {
            onAddRole(newRoleName);
            setNewRoleName('');
            setActiveRole(newRoleName);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Quản lý phân quyền</h2>
                    <div className="flex gap-2">
                         <button onClick={onSave} className="px-4 py-2 bg-black text-white rounded-lg text-sm">Lưu thay đổi</button>
                    </div>
                 </div>

                 <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                         <label className="block text-sm font-bold text-slate-900">Vai trò: {activeRole}</label>
                         <button 
                            onClick={() => onDeleteRole(activeRole)}
                            className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-red-50"
                         >
                            <Trash2 size={14} /> Xoá vai trò này
                         </button>
                     </div>
                     <div className="flex gap-2 flex-wrap">
                        {roles.map((r) => (
                            <button 
                                key={r} 
                                onClick={() => setActiveRole(r)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeRole === r ? 'bg-black text-white border-black' : 'bg-white text-slate-600 border-slate-200 hover:border-black'}`}
                            >
                                {r}
                            </button>
                        ))}
                     </div>
                 </div>

                 <div className="max-w-2xl">
                     <table className="w-full text-left">
                         <thead>
                             <tr className="border-b border-white">
                                 <th className="py-2 pl-4">Module</th>
                                 <th className="py-2 text-center">Xem</th>
                                 <th className="py-2 text-center">Thêm</th>
                                 <th className="py-2 text-center">Sửa</th>
                             </tr>
                         </thead>
                         <tbody>
                             {data.filter((p: Permission) => p.role === activeRole).map((p: Permission) => (
                                 <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                                     <td className="py-4 pl-4 text-slate-700 font-medium">{p.module}</td>
                                     <td className="py-4 text-center">
                                         <button 
                                            onClick={() => onUpdatePermission(p.id, 'canView')}
                                            className={`p-1 rounded hover:bg-slate-100 transition-colors ${p.canView ? 'text-black' : 'text-slate-300'}`}
                                         >
                                            {p.canView ? <CheckSquare size={20} /> : <Square size={20} />}
                                         </button>
                                     </td>
                                     <td className="py-4 text-center">
                                         <button 
                                            onClick={() => onUpdatePermission(p.id, 'canAdd')}
                                            className={`p-1 rounded hover:bg-slate-100 transition-colors ${p.canAdd ? 'text-black' : 'text-slate-300'}`}
                                         >
                                            {p.canAdd ? <CheckSquare size={20} /> : <Square size={20} />}
                                         </button>
                                     </td>
                                     <td className="py-4 text-center">
                                         <button 
                                            onClick={() => onUpdatePermission(p.id, 'canEdit')}
                                            className={`p-1 rounded hover:bg-slate-100 transition-colors ${p.canEdit ? 'text-black' : 'text-slate-300'}`}
                                         >
                                            {p.canEdit ? <CheckSquare size={20} /> : <Square size={20} />}
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                     
                     <div className="mt-8 pt-4 border-t border-slate-200">
                         <div className="flex items-center gap-2 mb-4">
                             <PlusCircle size={20} className="text-slate-400" />
                             <span className="font-bold">Thêm vai trò mới</span>
                         </div>
                         <div className="flex gap-2 max-w-sm">
                            <input 
                                type="text" 
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                                placeholder="Nhập tên vai trò (VD: Director)"
                            />
                            <button 
                                onClick={handleAddRoleClick}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                                disabled={!newRoleName.trim()}
                            >
                                Thêm
                            </button>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export const MasterModule = ({ data }: any) => {
    return (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Quản lý master</h2>
                    <div className="flex gap-2">
                         <button className="px-4 py-2 border rounded-lg text-sm">Huỷ</button>
                         <button className="px-4 py-2 bg-slate-300 text-white rounded-lg text-sm cursor-not-allowed">Lưu</button>
                    </div>
                 </div>

                 <div className="space-y-8 max-w-3xl">
                     {data.map((cat: MasterCategory) => (
                         <div key={cat.id}>
                             <h3 className="font-bold text-slate-900 mb-2">{cat.name}</h3>
                             <div className="pl-4 space-y-2">
                                 {cat.items.map((item: string) => (
                                     <div key={item} className="flex items-center gap-2 group">
                                         <MinusCircle size={18} className="text-slate-300 group-hover:text-red-500 cursor-pointer" />
                                         <input type="text" defaultValue={item} className="border border-slate-200 rounded px-3 py-1.5 text-sm w-64" />
                                     </div>
                                 ))}
                                  <div className="flex items-center gap-2">
                                     <PlusCircle size={18} className="text-slate-800 cursor-pointer" />
                                     <span className="text-sm text-slate-500 italic">Thêm {cat.name.toLowerCase()}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
         </div>
    );
};

export const LogWorkforceForm = ({ onBack, divisions = [], onSave }: any) => {
    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState({
        division: '',
        year: currentYear,
        months: Array.from({length: 12}, () => '0')
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleMonthChange = (index: number, value: string) => {
        const newMonths = [...formData.months];
        newMonths[index] = value;
        setFormData(prev => ({...prev, months: newMonths}));
        
        // Clear specific month error
        const key = `month_${index}`;
        if (errors[key]) {
             setErrors(prev => {
                 const newErrors = {...prev};
                 delete newErrors[key];
                 return newErrors;
             });
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
             setErrors(prev => {
                 const newErrors = {...prev};
                 delete newErrors[field];
                 return newErrors;
             });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        // EX001
        if (!formData.division) newErrors.division = "ERROR_DEPARTMENT_REQUIRED";
        
        // EX002, EX003, EX004
        if (!formData.year) newErrors.year = "ERROR_YEAR_REQUIRED";
        else if (formData.year < 1900) newErrors.year = "ERROR_YEAR_INVALID";
        else if (formData.year > currentYear + 1) newErrors.year = "ERROR_YEAR_OUT_OF_RANGE";

        // EX005, EX006, EX007
        formData.months.forEach((m, idx) => {
            if (m === '') {
                newErrors[`month_${idx}`] = "ERROR_MANMONTH_REQUIRED";
            } else {
                const val = parseFloat(m);
                if (isNaN(val)) {
                    newErrors[`month_${idx}`] = "ERROR_MANMONTH_INVALID_FORMAT";
                } else if (val < 0) {
                    newErrors[`month_${idx}`] = "ERROR_MANMONTH_NEGATIVE";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveClick = () => {
        if (validate()) {
            if (onSave) onSave(formData);
            else onBack(); 
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl min-h-screen flex gap-8">
            <div className="flex-1">
                 <FormHeader title="Log công số thực tế" onBack={onBack} onSave={handleSaveClick} />
                 
                 <div className="grid grid-cols-2 gap-6 mb-8 max-w-xl">
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-900">Bộ phận</label>
                         <select 
                            className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.division ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                            value={formData.division}
                            onChange={(e) => handleChange('division', e.target.value)}
                         >
                            <option value="">Chọn bộ phận</option>
                            {divisions.map((d: string) => <option key={d} value={d}>{d}</option>)}
                         </select>
                         {errors.division && <p className="text-xs text-red-500">{errors.division}</p>}
                     </div>
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-900">Năm</label>
                         <select 
                            className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.year ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                            value={formData.year}
                            onChange={(e) => handleChange('year', Number(e.target.value))}
                         >
                            <option value={currentYear}>{currentYear}</option>
                            <option value={currentYear + 1}>{currentYear + 1}</option>
                            <option value={currentYear - 1}>{currentYear - 1}</option>
                         </select>
                         {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-3xl">
                     {formData.months.map((val, idx) => (
                         <div key={idx} className="space-y-1">
                            <label className="text-sm font-medium text-slate-900">Man-month tháng {idx + 1} *</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors[`month_${idx}`] ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                                placeholder="Man-month" 
                                value={val}
                                onChange={(e) => handleMonthChange(idx, e.target.value)}
                            />
                            {errors[`month_${idx}`] && <p className="text-xs text-red-500">{errors[`month_${idx}`]}</p>}
                         </div>
                     ))}
                 </div>
            </div>

            {/* History Section */}
            <div className="w-96 border border-slate-200 rounded-xl p-6 bg-white shadow-sm h-fit">
                <h3 className="font-bold text-slate-900 mb-6">Lịch sử thay đổi</h3>
                <div className="space-y-6 relative">
                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                    
                    {/* Item 1 */}
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold z-10 border-4 border-white">2</div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                                Thay đổi thông tin: Địa chỉ 
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="text-slate-500">Trước thay đổi: -</div>
                                <div className="text-slate-500">Sau thay đổi: 10</div>
                                <div className="text-slate-400 pt-2 border-t border-slate-200 mt-2">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                            </div>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold z-10 border-4 border-white">1</div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="font-bold text-sm text-slate-900 mb-2">Tạo mới</div>
                            <div className="text-xs text-slate-400 pt-1">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WorkforceModule = ({ projects, clients, monthlyData, onLog }: any) => {
    // Access mock data for contracts and permissions
    const mockData = getMockData();
    const contracts = mockData.contracts;
    const permissions = mockData.permissions;
    const navigate = useNavigate();

    // Permission Check (EX001)
    const canView = permissions?.find((p: Permission) => p.module === 'Doanh thu' && p.role === 'Sale Admin')?.canView ?? true; // Using 'Doanh thu' permission for now or 'Công số' if added

    // --- State ---
    const [filters, setFilters] = useState({
        search: '',
        year: new Date().getFullYear(),
        division: 'All',
        status: 'All'
    });
    const [searchError, setSearchError] = useState('');
    const [systemError, setSystemError] = useState(false);

    if (!canView) {
        return <div className="p-6 text-red-600 font-medium">Tài khoản chưa được cấp quyền.</div>;
    }
    if (systemError) {
        return <div className="p-6 text-red-600 font-medium">Có lỗi xảy ra, vui lòng thử lại sau.</div>;
    }

    // --- Logic ---
    const handleFilterChange = (key: string, value: any) => {
        if (key === 'search') {
            if (value.length > 255) {
                setSearchError('Điều kiện lọc không hợp lệ.');
            } else {
                setSearchError('');
            }
        }
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            year: new Date().getFullYear(),
            division: 'All',
            status: 'All'
        });
        setSearchError('');
    };

    // Filter Logic
    const filteredItems = contracts.map(c => {
        const project = projects.find((p: Project) => p.id === c.project_id);
        const client = clients.find((cl: Client) => cl.id === c.client_id);
        return {
            contract: c,
            project,
            client
        };
    }).filter(item => {
        // Year filter (based on allocations or contract period?) - Assuming display for selected year
        // Division
        if (filters.division !== 'All' && item.project?.division !== filters.division) return false;
        // Status (Contract status)
        if (filters.status !== 'All') {
            const statusMap: Record<number, string> = { 1: 'Chờ ký', 2: 'Đã ký', 3: 'Dự kiến' };
            if (statusMap[item.contract.status_id] !== filters.status) return false;
        }
        // Search
        if (filters.search) {
            const term = filters.search.toLowerCase();
            if (!item.project?.name.toLowerCase().includes(term) && !item.client?.name.toLowerCase().includes(term)) return false;
        }
        return true;
    });

    // Chart Data Aggregation
    const chartData = Array.from({length: 12}, (_, i) => {
        const month = i + 1;
        // Sold MM (MM đã bán) -> Sum of allocations from filtered contracts
        const soldMM = filteredItems.reduce((sum, item) => {
            // Check allocations for this year and month
            // Assuming allocation format "M/YYYY"
            const alloc = item.contract.allocations?.find(a => {
                const [mStr, yStr] = a.month.split('/');
                return Number(mStr) === month && Number(yStr) === filters.year;
            });
            return sum + (alloc?.man_month || 0);
        }, 0);

        // Actual MM (MM thực tế) -> Sum from monthlyData (Project Logs)
        // We aggregate projects involved in filteredItems
        const relevantProjectIds = new Set(filteredItems.map(i => i.project?.id).filter(Boolean));
        const actualMM = monthlyData
            .filter((d: MonthlyData) => relevantProjectIds.has(d.projectId) && d.month === month && d.type === 'actual')
            .reduce((sum: number, d: MonthlyData) => sum + d.value, 0);

        return {
            name: `Tháng ${month}`,
            shortName: `${month}/${filters.year}`,
            sold: soldMM,
            actual: actualMM
        };
    });

    // Get available divisions for LogWorkforceForm
    const divOptions = Array.from(new Set(projects.map((p: Project) => p.division).filter(Boolean)));

    return (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh] flex flex-col">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý công số</h2>
                
                {/* Header Actions */}
                <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dự án hoặc khách hàng" 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            <Download size={16} /> Tải xuống
                        </button>
                        <button onClick={onLog} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
                            Log công số
                        </button>
                    </div>
                </div>
                {searchError && <div className="text-red-500 text-xs mb-4">{searchError}</div>}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="p-2"><Filter size={20} className="text-slate-900" /></div>
                    
                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300"
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
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

                    {(filters.division !== 'All' || filters.status !== 'All' || filters.year !== new Date().getFullYear()) && (
                        <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50">Xoá bộ lọc</button>
                    )}
                </div>

                {/* Chart Section */}
                <div className="h-72 border border-slate-200 rounded-xl p-4 mb-8 bg-white relative">
                    <p className="font-bold text-sm mb-4 text-slate-900">Công số tháng</p>
                    <ResponsiveContainer width="100%" height="90%" minWidth={0}>
                            <ComposedChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} />
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0) return payload[0].payload.shortName;
                                    return label;
                                }}
                                formatter={(value, name) => [value, name === 'sold' ? 'MM đã bán' : 'MM thực tế']}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="sold" name="MM đã bán" fill="#e2e8f0" barSize={40} radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="actual" name="MM thực tế" stroke="#1e293b" strokeWidth={2} dot={{r: 3, fill: '#1e293b'}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">Không tìm thấy kết quả.</div>
                    ) : (
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-4 px-2 sticky left-0 bg-white z-10">Mã KH</th>
                                    <th className="py-4 px-2">Tên khách hàng</th>
                                    <th className="py-4 px-2">Dự án</th>
                                    <th className="py-4 px-2">Bộ phận</th>
                                    <th className="py-4 px-2">Trạng thái</th>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <th key={m} className="py-4 px-2 text-center">Tháng {m}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(({ contract, project, client }, idx) => {
                                    // Get Monthly Values from Contract Allocations
                                    const monthlyValues = Array.from({length: 12}, (_, i) => {
                                        const m = i + 1;
                                        const alloc = contract.allocations?.find(a => {
                                            const [mStr, yStr] = a.month.split('/');
                                            return Number(mStr) === m && Number(yStr) === filters.year;
                                        });
                                        return alloc ? alloc.man_month : 0;
                                    });

                                    return (
                                        <tr 
                                            key={contract.id} 
                                            className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer group transition-colors"
                                            onClick={() => navigate('/contracts')} // EX: Navigate to detail
                                        >
                                            <td className="py-3 px-2 text-slate-600 font-medium sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10">{client?.code}</td>
                                            <td className="py-3 px-2 font-medium text-slate-900">{client?.name}</td>
                                            <td className="py-3 px-2 text-slate-600">{project?.name}</td>
                                            <td className="py-3 px-2 text-slate-600">{project?.division}</td>
                                            <td className="py-3 px-2">
                                                <StatusBadge type="contract" status={contract.status_id} />
                                            </td>
                                            {monthlyValues.map((val, i) => (
                                                <td key={i} className="py-3 px-2 text-center text-slate-600">
                                                    {val > 0 ? val : ''}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export const NotificationsView = ({ notifications }: any) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
             <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Thông báo</h2>
                <div className="space-y-4 max-w-4xl">
                    {notifications.map((n: Notification) => (
                        <div key={n.id} className={`p-4 rounded-lg border flex items-start gap-4 ${n.is_read ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-300'}`}>
                            <div className={`mt-1 w-3 h-3 rounded-full ${n.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-900 font-medium">{n.title}</p>
                                <p className="text-sm text-slate-600">{n.content}</p>
                                <p className="text-xs text-slate-500 mt-1">2 giờ trước</p>
                            </div>
                            {!n.is_read && <div className="w-3 h-3 bg-black rounded-full"></div>}
                            {n.is_read && <div className="w-3 h-3 border border-slate-300 rounded-full"></div>}
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};