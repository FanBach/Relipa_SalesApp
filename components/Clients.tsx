
import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusCircle, X, CheckSquare, Calendar as CalendarIcon, ChevronDown, ChevronRight, Edit3, Filter, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Client, Project, Contract, Invoice, ChangeLog, User, MasterCategory, Permission } from '../types';
import { StatusBadge, FormHeader, FilterBar, DateRangePicker, parseDDMMYYYY } from './Shared';
import { getMockData } from '../services/mockData';

// ClientForm
export const ClientForm = ({ initialData, onBack, onSave, masterData, users, clients, permissions = [] }: { 
    initialData?: Client, 
    onBack: () => void, 
    onSave: (data: any) => void, 
    masterData: MasterCategory[], 
    users: User[],
    clients: Client[],
    permissions: Permission[]
}) => {
    const canCreate = permissions?.find(p => p.module === 'Khách hàng' && p.role === 'Sale Admin')?.canAdd ?? true;
    const isEdit = !!initialData?.id;
    
    const [formData, setFormData] = useState<Partial<Client>>(initialData || {
        code: '',
        name: '',
        tax_code: '',
        type: '',
        representative: '',
        lead_source: '',
        address: '',
        lead_get_id: undefined,
        first_signed_date: '',
        owner_sales_id: undefined,
        noted: '',
        status_id: 1,
        created_at: new Date().toLocaleDateString('en-GB'),
        payers: [{ name: '', email: '' }]
    });

    const [isAutoCode, setIsAutoCode] = useState(!isEdit);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isAutoCode && formData.name) {
            const cleanName = formData.name.replace(/[^a-zA-Z]/g, '');
            const auto = cleanName.substring(0, 3).toUpperCase();
            setFormData(prev => ({ ...prev, code: auto }));
        }
    }, [formData.name, isAutoCode]);

    if (!canCreate && !isEdit) {
        return <div className="bg-white dark:bg-slate-800 p-8 rounded-xl min-h-screen text-red-600 font-bold">Tài khoản chưa được cấp quyền.</div>;
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handlePayerChange = (index: number, field: 'name' | 'email', value: string) => {
        const newPayers = [...(formData.payers || [])];
        newPayers[index] = { ...newPayers[index], [field]: value };
        setFormData(prev => ({ ...prev, payers: newPayers }));
        
        const errorKey = `payer_${index}_${field}`;
        if (errors[errorKey]) {
             setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const addPayer = () => {
        setFormData(prev => ({ ...prev, payers: [...(prev.payers || []), { name: '', email: '' }] }));
    };

    const removePayer = (index: number) => {
        setFormData(prev => ({ ...prev, payers: (prev.payers || []).filter((_, i) => i !== index) }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name) newErrors.name = "Trường bắt buộc.";
        if (!formData.code) newErrors.code = "Trường bắt buộc.";
        if (!formData.type) newErrors.type = "Trường bắt buộc.";
        if (!formData.representative) newErrors.representative = "Trường bắt buộc.";
        if (!formData.lead_source) newErrors.lead_source = "Trường bắt buộc.";
        if (!formData.address) newErrors.address = "Trường bắt buộc.";
        if (!formData.lead_get_id) newErrors.lead_get_id = "Trường bắt buộc.";
        if (!formData.first_signed_date) newErrors.first_signed_date = "Trường bắt buộc.";
        if (!formData.owner_sales_id) newErrors.owner_sales_id = "Trường bắt buộc.";

        if (formData.name && formData.name.length > 255) newErrors.name = "Không được vượt quá 255 ký tự.";
        if (formData.tax_code && formData.tax_code.length > 15) newErrors.tax_code = "Không được vượt quá 15 ký tự.";
        if (formData.representative && formData.representative.length > 255) newErrors.representative = "Không được vượt quá 255 ký tự.";
        if (formData.address && formData.address.length > 500) newErrors.address = "Không được vượt quá 500 ký tự.";
        if (formData.noted && formData.noted.length > 1000) newErrors.noted = "Không được vượt quá 1000 ký tự.";

        if (formData.code && formData.code.length !== 3) newErrors.code = "Mã khách hàng chỉ gồm 3 ký tự chữ.";

        if (formData.code) {
            const exists = clients.some(c => c.code === formData.code && c.id !== initialData?.id);
            if (exists) newErrors.code = "Mã khách hàng đã tồn tại.";
        }

        if (!formData.payers || formData.payers.length === 0) {
            newErrors.payers = "Cần ít nhất 1 người thanh toán.";
        } else {
            formData.payers.forEach((p, idx) => {
                if (!p.name) newErrors[`payer_${idx}_name`] = "Trường bắt buộc.";
                if (p.name.length > 100) newErrors[`payer_${idx}_name`] = "Tối đa 100 ký tự.";
                
                if (!p.email) {
                    newErrors[`payer_${idx}_email`] = "Trường bắt buộc.";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
                    newErrors[`payer_${idx}_email`] = "Email không hợp lệ.";
                } else if (p.email.length > 255) {
                    newErrors[`payer_${idx}_email`] = "Tối đa 255 ký tự.";
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveClick = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl min-h-screen">
         <FormHeader title="Thông tin khách hàng" onBack={onBack} onSave={handleSaveClick} />
         {errors.system && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded mb-4 text-sm">{errors.system}</div>}
         
         <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Tên khách hàng <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.name ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'}`}
                    placeholder="Tên khách hàng" 
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Mã khách hàng <span className="text-red-500">*</span></label>
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            value={formData.code} 
                            onChange={e => handleChange('code', e.target.value)}
                            disabled={isAutoCode}
                            className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:border-slate-600 ${isAutoCode ? 'bg-slate-100 text-slate-500 dark:bg-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-700 dark:text-white'} ${errors.code ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'}`}
                            placeholder="Mã KH (3 ký tự)"
                        />
                        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <button 
                            onClick={() => setIsAutoCode(!isAutoCode)} 
                            className={`w-5 h-5 border rounded flex items-center justify-center ${isAutoCode ? 'bg-black border-black text-white dark:bg-white dark:text-black' : 'border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600'}`}
                        >
                            {isAutoCode && <CheckSquare size={14} />}
                        </button>
                        <span className="text-sm text-slate-700 dark:text-slate-300 select-none cursor-pointer" onClick={() => setIsAutoCode(!isAutoCode)}>Tự động tạo mã KH</span>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Mã số thuế</label>
                <input 
                    type="text" 
                    value={formData.tax_code} 
                    onChange={e => handleChange('tax_code', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.tax_code ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'}`}
                    placeholder="Mã số thuế"
                />
                {errors.tax_code && <p className="text-xs text-red-500">{errors.tax_code}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Loại khách hàng <span className="text-red-500">*</span></label>
                <select 
                    value={formData.type || ''} 
                    onChange={e => handleChange('type', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:border-slate-600 ${errors.type ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'} ${!formData.type ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                >
                    <option value="" disabled hidden>Loại khách hàng</option>
                    {masterData.find(m => m.id === 'client_type')?.items.map(item => (
                        <option key={item} value={item} className="text-slate-900">{item}</option>
                    ))}
                </select>
                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Người đại diện <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={formData.representative}
                    onChange={e => handleChange('representative', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.representative ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'}`}
                    placeholder="Người đại diện"
                />
                {errors.representative && <p className="text-xs text-red-500">{errors.representative}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Lead source <span className="text-red-500">*</span></label>
                <select 
                    value={formData.lead_source || ''}
                    onChange={e => handleChange('lead_source', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:bg-slate-700 dark:border-slate-600 ${!formData.lead_source ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                >
                    <option value="" disabled hidden>Lead source</option>
                    {masterData.find(m => m.id === 'lead_source')?.items.map(item => (
                        <option key={item} value={item} className="text-slate-900">{item}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                 <label className="text-sm font-medium text-slate-900 dark:text-white">Địa chỉ <span className="text-red-500">*</span></label>
                 <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.address ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'}`}
                    placeholder="Địa chỉ"
                 />
                 {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Lead get <span className="text-red-500">*</span></label>
                <select 
                    value={formData.lead_get_id || ''}
                    onChange={e => handleChange('lead_get_id', Number(e.target.value))}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:border-slate-600 ${errors.lead_get_id ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'} ${!formData.lead_get_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                >
                    <option value="" disabled hidden>Lead get</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id} className="text-slate-900">{u.full_name}</option>
                    ))}
                </select>
                {errors.lead_get_id && <p className="text-xs text-red-500">{errors.lead_get_id}</p>}
            </div>

            <div className="space-y-1">
                 <label className="text-sm font-medium text-slate-900 dark:text-white">Ngày ký đầu <span className="text-red-500">*</span></label>
                 <div className="relative">
                    <input 
                        type="date" 
                        value={formData.first_signed_date}
                        onChange={e => handleChange('first_signed_date', e.target.value)}
                        className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.first_signed_date ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'}`}
                    />
                 </div>
                 {errors.first_signed_date && <p className="text-xs text-red-500">{errors.first_signed_date}</p>}
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Salesman <span className="text-red-500">*</span></label>
                <select 
                    value={formData.owner_sales_id || ''}
                    onChange={e => handleChange('owner_sales_id', Number(e.target.value))}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none dark:bg-slate-700 dark:border-slate-600 ${errors.owner_sales_id ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'} ${!formData.owner_sales_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                >
                    <option value="" disabled hidden>Salesman</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id} className="text-slate-900">{u.full_name}</option>
                    ))}
                </select>
                {errors.owner_sales_id && <p className="text-xs text-red-500">{errors.owner_sales_id}</p>}
            </div>

            <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-white">Ghi chú</label>
                <textarea 
                    value={formData.noted}
                    onChange={e => handleChange('noted', e.target.value)}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:ring-1 focus:outline-none resize-none h-20 dark:bg-slate-700 dark:text-white dark:border-slate-600 ${errors.noted ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black dark:focus:ring-white'}`}
                    placeholder="Ghi chú ..."
                />
                {errors.noted && <p className="text-xs text-red-500">{errors.noted}</p>}
            </div>

            <div className="col-span-2 mt-4">
                <label className="text-sm font-bold text-slate-900 dark:text-white block mb-3">Người thanh toán <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                    {formData.payers?.map((payer, index) => (
                        <div key={index} className="flex gap-4 items-start">
                            <button onClick={() => removePayer(index)} className="p-2 mt-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500">
                                <X size={20} />
                            </button>
                            <div className="flex-1 space-y-1">
                                <input 
                                    type="text" 
                                    value={payer.name} 
                                    onChange={e => handlePayerChange(index, 'name', e.target.value)}
                                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:bg-slate-700 dark:text-white dark:border-slate-600`}
                                    placeholder="Tên người thanh toán" 
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <input 
                                    type="text" 
                                    value={payer.email} 
                                    onChange={e => handlePayerChange(index, 'email', e.target.value)}
                                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:bg-slate-700 dark:text-white dark:border-slate-600`}
                                    placeholder="Email người thanh toán" 
                                />
                            </div>
                        </div>
                    ))}
                    {errors.payers && <p className="text-xs text-red-500 ml-10 mb-2">{errors.payers}</p>}
                    <button onClick={addPayer} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded border border-black dark:border-white text-black dark:text-white mt-2 ml-10">
                        <PlusCircle size={20} />
                    </button>
                </div>
            </div>
         </div>
      </div>
    );
};

// ClientsModule
export const ClientsModule = ({ data, onAdd, onEdit, onDelete, onViewDetail, masterData, users, permissions }: any) => {
    const canView = permissions?.find((p: Permission) => p.module === 'Khách hàng' && p.role === 'Sale Admin')?.canView ?? true;

    const [filters, setFilters] = useState({
        type: 'all',
        salesman: 'all',
        source: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });
    
    const [systemError, setSystemError] = useState(false);
    const [searchError, setSearchError] = useState('');

    if (!canView) {
        return <div className="p-6 text-red-600 font-medium">Tài khoản chưa được cấp quyền.</div>;
    }

    if (systemError) {
        return <div className="p-6 text-red-600 font-medium">Có lỗi xảy ra, vui lòng thử lại sau.</div>;
    }

    const handleFilterChange = (key: string, value: string) => {
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
        setFilters({ type: 'all', salesman: 'all', source: 'all', startDate: '', endDate: '', search: '' });
        setSearchError('');
    };

    const isFiltered = filters.type !== 'all' || filters.salesman !== 'all' || filters.source !== 'all' || filters.startDate !== '' || filters.endDate !== '';

    const filteredData = data.filter((c: Client) => {
        if (filters.type !== 'all' && c.type !== filters.type) return false;
        if (filters.salesman !== 'all') {
             const salesman = users.find((u: User) => u.id === c.owner_sales_id);
             if (salesman?.full_name !== filters.salesman) return false;
        }
        if (filters.source !== 'all' && c.lead_source !== filters.source) return false;
        
        if (filters.startDate || filters.endDate) {
             const date = parseDDMMYYYY(c.first_signed_date);
             if (date) {
                 if (filters.startDate) {
                     const start = new Date(filters.startDate);
                     start.setHours(0,0,0,0);
                     if (date < start) return false;
                 }
                 if (filters.endDate) {
                     const end = new Date(filters.endDate);
                     end.setHours(23,59,59,999);
                     if (date > end) return false;
                 }
             } else {
                 return false;
             }
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (!c.name.toLowerCase().includes(searchLower) && !c.code.toLowerCase().includes(searchLower)) {
                return false;
            }
        }

        return true;
    }).sort((a: Client, b: Client) => {
        return b.id - a.id; 
    });


  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[80vh]">
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý khách hàng</h2>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {filteredData.length} khách hàng
                    </div>
                    <button onClick={onAdd} className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center gap-2">
                        Thêm khách hàng
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm khách hàng (Tên, Mã KH)..." 
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white" 
                        value={filters.search} 
                        onChange={(e) => handleFilterChange('search', e.target.value)} 
                    />
                </div>
            </div>
            {searchError && <div className="text-red-500 text-xs mb-4">{searchError}</div>}

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="p-2 text-slate-900 dark:text-white"><Filter size={20} /></div>
                
                <div className="relative">
                    <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500" value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
                        <option value="all">Tất cả loại KH</option>
                        {masterData?.find((c: any) => c.id === 'client_type')?.items.map((it: string) => <option key={it} value={it}>{it}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500" value={filters.salesman} onChange={e => handleFilterChange('salesman', e.target.value)}>
                        <option value="all">Tất cả salesman</option>
                        {users?.map((u: User) => <option key={u.id} value={u.full_name}>{u.full_name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500" value={filters.source} onChange={e => handleFilterChange('source', e.target.value)}>
                        <option value="all">Tất cả nguồn</option>
                         {masterData?.find((c: any) => c.id === 'lead_source')?.items.map((it: string) => <option key={it} value={it}>{it}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="w-auto">
                    <DateRangePicker 
                        startDate={filters.startDate} 
                        endDate={filters.endDate} 
                        onChange={(start, end) => {
                            setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
                        }} 
                    />
                </div>

                {isFiltered && (
                    <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Xoá bộ lọc</button>
                )}
                
                <div className="ml-auto">
                    <button onClick={() => alert("Đang tải xuống danh sách khách hàng...")} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        Tải xuống
                    </button>
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">Không tìm thấy kết quả.</div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="py-4">Mã KH</th>
                            <th className="py-4">Tên khách hàng</th>
                            <th className="py-4">Loại KH</th>
                            <th className="py-4">Ngày ký đầu</th>
                            <th className="py-4">Salesman</th>
                            <th className="py-4">Nguồn lead</th>
                            <th className="py-4">Địa chỉ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((c: Client) => {
                            const salesmanName = users.find((u: User) => u.id === c.owner_sales_id)?.full_name || '-';
                            return (
                                <tr 
                                    key={c.id} 
                                    className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                                    onClick={() => onViewDetail(c)}
                                >
                                    <td className="py-4 text-slate-600 dark:text-slate-300">{c.code}</td>
                                    <td className="py-4 font-medium dark:text-white">{c.name}</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400">{c.type}</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400">{c.first_signed_date}</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400">{salesmanName}</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400">{c.lead_source}</td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{c.address}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            )}
            
            <div className="flex justify-center mt-6 gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50" disabled><ChevronDown className="rotate-90 text-slate-600 dark:text-slate-400" size={14}/></button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-black dark:bg-white text-white dark:text-black text-xs">1</button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400">2</button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400">...</button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400">10</button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronRight size={14} className="text-slate-600 dark:text-slate-400"/></button>
            </div>
        </div>
    </div>
  );
};

// ClientDetailView
export const ClientDetailView = ({ client, projects, contracts, invoices, users, onBack, onEdit, onAddProject, onChangeTab, onNavigate }: any) => {
    const [activeTab, setActiveTab] = useState<'projects' | 'contracts' | 'revenue' | 'history'>('projects');
    
    const clientProjects = projects.filter((p: Project) => p.client_id === client.id);
    const clientContracts = contracts.filter((c: Contract) => c.client_id === client.id);
    const clientInvoices = invoices.filter((i: Invoice) => i.client_id === client.id);
    const changeLogs = getMockData().changeLogs.filter((l: ChangeLog) => l.record_id === client.id && l.table_name === 'clients') || [];
    
    const totalContractValue = clientContracts.reduce((sum: number, c: Contract) => sum + c.total_value, 0);
    const netRevenue = clientContracts.reduce((sum: number, c: Contract) => sum + (c.net_revenue || 0), 0);
    const amountAfterVat = clientInvoices.reduce((sum: number, i: Invoice) => sum + (i.amount_after_vat || 0), 0);
    const paidAmount = clientInvoices.reduce((sum: number, i: Invoice) => sum + (i.paid_amount || 0), 0);
    const currentDebt = amountAfterVat - paidAmount;
    
    const salesmanName = users.find((u: User) => u.id === client.owner_sales_id)?.full_name || '-';
    const leadGetName = users.find((u: User) => u.id === client.lead_get_id)?.full_name || '-';

    return (
        <div className="min-h-screen pb-10">
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <ArrowLeft size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{client.name}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Mã khách hàng: {client.code}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => onNavigate('/projects', { state: { createProjectForClient: client.id } })} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Thêm dự án</button>
                    <button onClick={() => onEdit(client)} className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200">Chỉnh sửa</button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Thông tin khách hàng</h3>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Người đại diện:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.recipient_name || client.representative}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Ngày ký đầu:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.first_signed_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Địa chỉ:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px] truncate">{client.address}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Loại:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Kênh trao đổi:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.channel}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 block mb-2">Người thanh toán ({client.payers?.length || (client.payer_name ? 1 : 0)}):</span>
                                    <div className="space-y-2">
                                        {client.payers && client.payers.length > 0 ? (
                                            client.payers.map((p: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-700 last:border-0 py-1">
                                                    <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{p.email}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-700 last:border-0 py-1">
                                                <span className="font-bold text-slate-900 dark:text-white">{client.payer_name}</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{client.payer_email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Lead source:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.lead_source}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Lead get:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{leadGetName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Salesman:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{salesmanName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Pháp nhân cũ:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.origin_client_id || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Mã số thuế:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.tax_code || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Ghi chú:</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right">{client.noted || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full">
                         <h3 className="font-bold text-slate-900 dark:text-white mb-6">Tổng quan tài chính</h3>
                         <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onClick={() => onNavigate('/contracts', { state: { filterSearch: client.name } })}>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Tổng giá trị hợp đồng</div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{totalContractValue.toLocaleString()} US$</div>
                                </div>
                                <ChevronRight size={20} className="text-slate-400" />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onClick={() => onNavigate('/contracts', { state: { filterSearch: client.name } })}>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Doanh thu (NET)</div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{netRevenue.toLocaleString()} US$</div>
                                </div>
                                <ChevronRight size={20} className="text-slate-400" />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onClick={() => onNavigate('/invoices', { state: { filterSearch: client.name } })}>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Công nợ</div>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">{currentDebt.toLocaleString()} US$</div>
                                </div>
                                <ChevronRight size={20} className="text-slate-400" />
                            </div>
                         </div>
                    </div>
                </div>

                <div>
                     <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex mb-6">
                         <button onClick={() => setActiveTab('projects')} className={`py-2 px-6 text-sm font-medium rounded-md transition-all ${activeTab === 'projects' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                             Dự án ({clientProjects.length})
                         </button>
                         <button onClick={() => setActiveTab('contracts')} className={`py-2 px-6 text-sm font-medium rounded-md transition-all ${activeTab === 'contracts' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                             Hợp đồng ({clientContracts.length})
                         </button>
                         <button onClick={() => setActiveTab('revenue')} className={`py-2 px-6 text-sm font-medium rounded-md transition-all ${activeTab === 'revenue' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                             Doanh thu
                         </button>
                         <button onClick={() => setActiveTab('history')} className={`py-2 px-6 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                             Lịch sử thay đổi
                         </button>
                     </div>

                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[300px] p-6">
                         {activeTab === 'projects' && (
                             <div className="space-y-4">
                                 {clientProjects.map((p: Project) => {
                                     const pContracts = contracts.filter((c: Contract) => c.project_id === p.id);
                                     const pRevenue = pContracts.reduce((sum: number, c: Contract) => sum + c.total_value, 0);

                                     return (
                                     <div key={p.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 hover:shadow-md transition-all">
                                         <div className="flex justify-between items-start mb-4">
                                             <span className="font-bold text-slate-900 dark:text-white text-lg">{p.name}</span>
                                             <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status_id === 2 ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>
                                                 {p.status_id === 2 ? 'Đang triển khai' : 'Hoàn thành'}
                                             </span>
                                         </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700 dark:text-slate-400">
                                             <div className="space-y-2">
                                                 <div className="flex gap-2"><span className="font-semibold text-slate-900 dark:text-white w-32 shrink-0">Mã dự án:</span> <span>{p.code}</span></div>
                                                 <div className="flex gap-2"><span className="font-semibold text-slate-900 dark:text-white w-32 shrink-0">Bộ phận phát triển:</span> <span>{p.div_id || p.division}</span></div>
                                                 <div className="flex gap-2"><span className="font-semibold text-slate-900 dark:text-white w-32 shrink-0">Doanh thu:</span> <span>{pRevenue.toLocaleString()} {p.currency}</span></div>
                                             </div>
                                             <div className="space-y-2">
                                                 <div className="flex gap-2"><span className="font-semibold text-slate-900 dark:text-white w-32 shrink-0">Ngày bắt đầu:</span> <span>{p.start_date}</span></div>
                                                 <div className="flex gap-2"><span className="font-semibold text-slate-900 dark:text-white w-32 shrink-0">Ngày kết thúc:</span> <span>{p.end_date}</span></div>
                                             </div>
                                         </div>
                                     </div>
                                 )})}
                                 {clientProjects.length === 0 && <p className="text-center text-slate-400 py-10">Chưa có dự án nào.</p>}
                             </div>
                         )}

                         {activeTab === 'contracts' && (
                             <div className="space-y-4">
                                 {clientContracts.map((c: Contract) => {
                                     let statusLabel = 'Dự kiến';
                                     if (c.status_id === 1) statusLabel = 'Đang trao đổi';
                                     else if (c.status_id === 2) {
                                         const now = new Date();
                                         const end = new Date(c.end_date.split('/').reverse().join('-'));
                                         const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                         if (diff < 0) statusLabel = 'Đã hết hạn';
                                         else if (diff <= 3) statusLabel = `Hết hạn sau ${diff} ngày`;
                                         else statusLabel = 'Đã ký';
                                     }

                                     return (
                                     <div key={c.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                         <div className="flex-1">
                                             <div className="flex items-center gap-3 mb-2">
                                                 <span className="font-bold text-slate-900 dark:text-white text-lg">{c.code}</span>
                                                 <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">
                                                     {statusLabel}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400 max-w-lg">
                                                 <div>Ngày ký kết: <span className="font-medium text-slate-900 dark:text-white">{c.sign_date || '-'}</span></div>
                                                 <div>Giá trị hợp đồng: <span className="font-medium text-slate-900 dark:text-white">{c.total_value.toLocaleString()} {c.currency}</span></div>
                                             </div>
                                         </div>
                                         <div className="text-right text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                             <div>Ngày bắt đầu: <span className="font-medium text-slate-900 dark:text-white">{c.start_date}</span></div>
                                             <div>Ngày kết thúc: <span className="font-medium text-slate-900 dark:text-white">{c.end_date}</span></div>
                                         </div>
                                     </div>
                                 )})}
                                 {clientContracts.length === 0 && <p className="text-center text-slate-400 py-10">Chưa có hợp đồng nào.</p>}
                             </div>
                         )}
                         
                         {activeTab === 'revenue' && (
                             <div className="h-80">
                                 <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={[
                                        { name: '1/2024', uv: 0 },
                                        { name: '2/2024', uv: 0 },
                                        { name: '3/2024', uv: 400000 },
                                        { name: '4/2024', uv: 0 },
                                        { name: '5/2024', uv: 500000 },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <RechartsTooltip 
                                            cursor={{fill: 'transparent'}} 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl">
                                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{label}</p>
                                                            <p className="text-sm font-bold text-black dark:text-white">
                                                                Doanh thu: {Number(payload[0].value).toLocaleString()} US$
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="uv" fill="#e2e8f0" activeBar={{ fill: '#64748b' }} barSize={40} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                         )}

                         {activeTab === 'history' && (
                             <div className="space-y-6 max-w-3xl">
                                {changeLogs.length > 0 ? changeLogs.map((log: ChangeLog) => (
                                    <div key={log.id} className="flex gap-4">
                                        <div className="flex flex-col items-center pt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                        </div>
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-1">
                                            {log.action_type === 'create' ? (
                                                <>
                                                    <div className="font-bold text-sm mb-2 text-slate-900 dark:text-white">Tạo mới</div>
                                                    <div className="text-[10px] text-slate-400">Bởi: {log.changed_by} vào lúc {log.changed_at}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                                                        Thay đổi thông tin: {log.column_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trước thay đổi: {log.old_value}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Sau thay đổi: {log.new_value}</div>
                                                    <div className="text-[10px] text-slate-400">Bởi: {log.changed_by} vào lúc {log.changed_at}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center pt-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                            </div>
                                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-1">
                                                <div className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                                                    Thay đổi thông tin: Địa chỉ
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trước thay đổi: -</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Sau thay đổi: </div>
                                                <div className="text-[10px] text-slate-400">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center pt-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                            </div>
                                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-1">
                                                <div className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Tạo mới</div>
                                                <div className="text-[10px] text-slate-400">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                             </div>
                         )}
                     </div>
                </div>
            </div>
        </div>
    );
};
