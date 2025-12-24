
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Download } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Project, Client, MonthlyData, Permission } from '../types';
import { StatusBadge, FormHeader } from './Shared';
import { getMockData } from '../services/mockData';
import { useNavigate } from 'react-router-dom';

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
        
        if (!formData.division) newErrors.division = "ERROR_DEPARTMENT_REQUIRED";
        
        if (!formData.year) newErrors.year = "ERROR_YEAR_REQUIRED";
        else if (formData.year < 1900) newErrors.year = "ERROR_YEAR_INVALID";
        else if (formData.year > currentYear + 1) newErrors.year = "ERROR_YEAR_OUT_OF_RANGE";

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
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl min-h-screen flex gap-8">
            <div className="flex-1">
                 <FormHeader title="Log công số thực tế" onBack={onBack} onSave={handleSaveClick} />
                 
                 <div className="grid grid-cols-2 gap-6 mb-8 max-w-xl">
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-900 dark:text-white">Bộ phận</label>
                         <select 
                            className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.division ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'} ${!formData.division ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                            value={formData.division}
                            onChange={(e) => handleChange('division', e.target.value)}
                         >
                            <option value="" disabled hidden>Chọn bộ phận</option>
                            {divisions.map((d: string) => <option key={d} value={d} className="text-slate-900 dark:text-white">{d}</option>)}
                         </select>
                         {errors.division && <p className="text-xs text-red-500">{errors.division}</p>}
                     </div>
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-900 dark:text-white">Năm</label>
                         <select 
                            className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.year ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'}`}
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
                            <label className="text-sm font-medium text-slate-900 dark:text-white">Man-month tháng {idx + 1} <span className="text-red-500">*</span></label>
                            <input 
                                type="number" 
                                step="0.01"
                                className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors[`month_${idx}`] ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'}`}
                                placeholder="Man-month" 
                                value={val}
                                onChange={(e) => handleMonthChange(idx, e.target.value)}
                            />
                            {errors[`month_${idx}`] && <p className="text-xs text-red-500">{errors[`month_${idx}`]}</p>}
                         </div>
                     ))}
                 </div>
            </div>

            <div className="w-96 border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm h-fit">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Lịch sử thay đổi</h3>
                <div className="space-y-6 relative">                    
                    <div className="relative">
                        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                            <div className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                Thay đổi thông tin: Địa chỉ
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="text-slate-500 dark:text-slate-400">Trước thay đổi: -</div>
                                <div className="text-slate-500 dark:text-slate-400">Sau thay đổi: 10</div>
                                <div className="text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-600 mt-2">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                            <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">Tạo mới</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 pt-1">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const WorkforceModule = ({ projects, clients, monthlyData, onLog }: any) => {
    // ... WorkforceModule list view (no changes) ...
    // Returning existing structure
    const mockData = getMockData();
    const contracts = mockData.contracts;
    const permissions = mockData.permissions;
    const navigate = useNavigate();

    const canView = permissions?.find((p: Permission) => p.module === 'Doanh thu' && p.role === 'Sale Admin')?.canView ?? true; 

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

    const filteredItems = contracts.map(c => {
        const project = projects.find((p: Project) => p.id === c.project_id);
        const client = clients.find((cl: Client) => cl.id === c.client_id);
        return {
            contract: c,
            project,
            client
        };
    }).filter(item => {
        if (filters.division !== 'All' && item.project?.division !== filters.division) return false;
        if (filters.status !== 'All') {
            const statusMap: Record<number, string> = { 1: 'Chờ ký', 2: 'Đã ký', 3: 'Dự kiến' };
            if (statusMap[item.contract.status_id] !== filters.status) return false;
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            if (!item.project?.name.toLowerCase().includes(term) && !item.client?.name.toLowerCase().includes(term)) return false;
        }
        return true;
    });

    const chartData = Array.from({length: 12}, (_, i) => {
        const month = i + 1;
        const soldMM = filteredItems.reduce((sum, item) => {
            const alloc = item.contract.allocations?.find(a => {
                const [mStr, yStr] = a.month.split('/');
                return Number(mStr) === month && Number(yStr) === filters.year;
            });
            return sum + (alloc?.man_month || 0);
        }, 0);

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

    return (
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[80vh] flex flex-col">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quản lý công số</h2>
                
                <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dự án hoặc khách hàng" 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                            <Download size={16} /> Tải xuống
                        </button>
                        <button onClick={onLog} className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200">
                            Log công số
                        </button>
                    </div>
                </div>
                {searchError && <div className="text-red-500 text-xs mb-4">{searchError}</div>}

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="p-2"><Filter size={20} className="text-slate-900 dark:text-white" /></div>
                    
                    <div className="relative">
                        <select 
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
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

                    {(filters.division !== 'All' || filters.status !== 'All' || filters.year !== new Date().getFullYear()) && (
                        <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">Xoá bộ lọc</button>
                    )}
                </div>

                <div className="h-72 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-8 bg-white dark:bg-slate-800 relative">
                    <p className="font-bold text-sm mb-4 text-slate-900 dark:text-white">Công số tháng</p>
                    <ResponsiveContainer width="100%" height="90%" minWidth={0}>
                            <ComposedChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
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

                <div className="overflow-x-auto">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">Không tìm thấy kết quả.</div>
                    ) : (
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="py-4 px-2 sticky left-0 bg-white dark:bg-slate-800 z-10">Mã KH</th>
                                    <th className="py-4 px-2">Tên khách hàng</th>
                                    <th className="py-4 px-2">Dự án</th>
                                    <th className="py-4 px-2">Bộ phận</th>
                                    <th className="py-4 px-2">Trạng thái</th>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <th key={m} className="py-4 px-2 text-center">Tháng {m}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(({ contract, project, client }, idx) => {
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
                                            className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer group transition-colors"
                                            onClick={() => navigate('/contracts')} 
                                        >
                                            <td className="py-3 px-2 text-slate-600 dark:text-slate-400 font-medium sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700 transition-colors z-10">{client?.code}</td>
                                            <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">{client?.name}</td>
                                            <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{project?.name}</td>
                                            <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{project?.division}</td>
                                            <td className="py-3 px-2">
                                                <StatusBadge type="contract" status={contract.status_id} />
                                            </td>
                                            {monthlyValues.map((val, i) => (
                                                <td key={i} className="py-3 px-2 text-center text-slate-600 dark:text-slate-400">
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
