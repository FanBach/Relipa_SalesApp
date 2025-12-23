
import React, { useState, useMemo, useEffect } from 'react';
import { Edit3, ArrowLeft, X, RefreshCw, ChevronDown, ChevronRight, Search, Filter, Download, Calendar as CalendarIcon, FileText, Plus, Clock, Trash2 } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Contract, Project, Client, Invoice, Permission, User, ProjectMilestone, ContractPayer, PaymentMilestone, AllocationItem } from '../types';
import { StatusBadge, DateRangePicker, parseDDMMYYYY } from './Shared';
import { getMockData } from '../services/mockData';
import { RequestStartModal } from './ProjectContractFeatures';
import { useLocation } from 'react-router-dom';

// --- TRANG THÊM/SỬA HỢP ĐỒNG (S005 - Form) ---
export const ContractForm = ({ initialData, projects, clients, masterData, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Contract>>(initialData || {
        project_id: undefined,
        client_id: undefined,
        type: 'Project base',
        code: '',
        sign_date: '',
        note: '',
        start_date: '',
        end_date: '',
        status_id: 3, // Chờ ký
        total_value: 0,
        currency: 'USD',
        commission_fee: 0,
        discount: 0,
        other_fee: 0,
        man_month_sale: 0,
        man_month_div: 0,
        backlog_link: '',
        is_extend: false,
        is_transfer_debt: false,
        is_periodic_invoice: false,
        project_milestones: [{ name: '', start_date: '', end_date: '' }],
        payers: [{ name: '', email: '', ratio: 100 }],
        payment_milestones: [{ date: '', amount: 0, percent: 0, note: '' }],
        allocations: [],
        periodic_config: { start_date: '', cycle: 30, amount: 0, note: '' }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(e => { const n = {...e}; delete n[field]; return n; });
        }
    };

    // Logic Tự động sinh mã (#8): AAA-YYYYMMDD-NN
    const handleAutoCode = () => {
        if (!formData.client_id || !formData.start_date) {
            alert("Vui lòng chọn Khách hàng và Ngày bắt đầu trước khi tạo mã tự động.");
            return;
        }
        const client = clients.find((c: Client) => c.id === formData.client_id);
        const dateStr = formData.start_date.replace(/-/g, '');
        const code = `${client?.code || 'AAA'}-${dateStr}-01`;
        updateField('code', code);
    };

    // Logic Tự động phân bổ doanh thu (#40)
    const handleAutoAllocate = () => {
        if (!formData.start_date || !formData.end_date || !formData.total_value) {
            alert("Cần có Ngày bắt đầu, Ngày kết thúc và Giá trị hợp đồng.");
            return;
        }
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

        const newAllocations: AllocationItem[] = [];
        let curr = new Date(start.getFullYear(), start.getMonth(), 1);
        
        while (curr <= end) {
            const m = curr.getMonth() + 1;
            const y = curr.getFullYear();
            const monthStr = `${m.toString().padStart(2, '0')}/${y}`;
            
            const monthStart = new Date(y, m - 1, 1);
            const monthEnd = new Date(y, m, 0);
            const actualStart = start > monthStart ? start : monthStart;
            const actualEnd = end < monthEnd ? end : monthEnd;
            const daysInMonth = Math.ceil((actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            if (daysInMonth > 0) {
                const amount = (daysInMonth * (formData.total_value || 0)) / diffDays;
                const mm = (daysInMonth * (formData.man_month_div || 0)) / diffDays;
                newAllocations.push({ month: monthStr, amount: Math.round(amount), man_month: Number(mm.toFixed(2)) });
            }
            curr.setMonth(curr.getMonth() + 1);
        }
        updateField('allocations', newAllocations);
    };

    const totalAllocated = formData.allocations?.reduce((sum, a) => sum + a.amount, 0) || 0;
    const totalMMAllocated = formData.allocations?.reduce((sum, a) => sum + a.man_month, 0) || 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl min-h-screen animate-fade-in pb-32">
            {/* Header Form */}
            <div className="flex justify-between items-center mb-16 max-w-6xl mx-auto">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-900 dark:text-white">
                        <ArrowLeft size={32} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Thông tin hợp đồng</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={onBack} className="px-12 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-base font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Huỷ</button>
                    <button onClick={() => onSave(formData)} className="px-16 py-3 bg-black dark:bg-white dark:text-black text-white rounded-2xl text-base font-bold hover:bg-slate-800 dark:hover:bg-slate-200 shadow-2xl active:scale-95 transition-all">Lưu</button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-20">
                {/* SECTION: Thông tin cơ bản */}
                <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Tên dự án <span className="text-red-500">*</span></label>
                        <select 
                            className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-slate-50 dark:bg-slate-700 transition-all ${!formData.project_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                            value={formData.project_id || ''}
                            onChange={e => updateField('project_id', Number(e.target.value))}
                        >
                            <option value="" disabled hidden>Chọn dự án</option>
                            {projects.map((p: Project) => <option key={p.id} value={p.id} className="text-slate-900 dark:text-white">{p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Khách hàng <span className="text-red-500">*</span></label>
                        <select 
                            className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-slate-50 dark:bg-slate-700 transition-all ${!formData.client_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                            value={formData.client_id || ''}
                            onChange={e => updateField('client_id', Number(e.target.value))}
                        >
                            <option value="" disabled hidden>Chọn khách hàng</option>
                            {clients.map((c: Client) => <option key={c.id} value={c.id} className="text-slate-900 dark:text-white">{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Loại hợp đồng <span className="text-red-500">*</span></label>
                        <select 
                            className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-slate-50 dark:bg-slate-700 transition-all ${!formData.type ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                            value={formData.type}
                            onChange={e => updateField('type', e.target.value)}
                        >
                            <option value="" disabled hidden>Loại hợp đồng</option>
                            <option value="ODC" className="text-slate-900 dark:text-white">ODC</option>
                            <option value="Project base" className="text-slate-900 dark:text-white">Project based</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Mã hợp đồng <span className="text-red-500">*</span></label>
                        <div className="flex gap-3">
                            <input type="text" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white transition-all" placeholder="Mã hợp đồng" value={formData.code} onChange={e => updateField('code', e.target.value)} />
                            <button onClick={handleAutoCode} className="px-8 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">Tự động</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Ngày ký kết <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                type="date" 
                                className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white transition-all ${!formData.sign_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
                                value={formData.sign_date} 
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={e => updateField('sign_date', e.target.value)} 
                            />
                            <CalendarIcon size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                    </div>
                    <div className="row-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Ghi chú</label>
                        <textarea className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white h-full min-h-[140px] resize-none" placeholder="Ghi chú" value={formData.note} onChange={e => updateField('note', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                type="date" 
                                className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white transition-all ${!formData.start_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
                                value={formData.start_date} 
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={e => updateField('start_date', e.target.value)} 
                            />
                            <CalendarIcon size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                type="date" 
                                className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white transition-all ${!formData.end_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
                                value={formData.end_date} 
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={e => updateField('end_date', e.target.value)} 
                            />
                            <CalendarIcon size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Trạng thái ký <span className="text-red-500">*</span></label>
                        <select 
                            className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-slate-50 dark:bg-slate-700 transition-all ${!formData.status_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                            value={formData.status_id || ''}
                            onChange={e => updateField('status_id', Number(e.target.value))}
                        >
                            <option value="" disabled hidden>Chọn trạng thái ký</option>
                            <option value={1} className="text-slate-900 dark:text-white">Đã ký</option>
                            <option value={2} className="text-slate-900 dark:text-white">Dự báo</option>
                            <option value={3} className="text-slate-900 dark:text-white">Chờ ký</option>
                        </select>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Giá trị hợp đồng <span className="text-red-500">*</span></label>
                        <div className="flex gap-3">
                            <input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white" placeholder="0" value={formData.total_value} onChange={e => updateField('total_value', Number(e.target.value))} />
                            <select className="w-32 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-sm bg-slate-50 dark:bg-slate-700 dark:text-white outline-none font-bold" value={formData.currency} onChange={e => updateField('currency', e.target.value)}>
                                <option>USD</option><option>JPY</option><option>VND</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Phí hoa hồng</label>
                        <div className="flex gap-3">
                            <input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white" placeholder="0" value={formData.commission_fee} onChange={e => updateField('commission_fee', Number(e.target.value))} />
                            <div className="w-32 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 text-center font-black">{formData.currency}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Giảm giá</label>
                        <div className="flex gap-3">
                            <input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white" placeholder="0" value={formData.discount} onChange={e => updateField('discount', Number(e.target.value))} />
                            <div className="w-32 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 text-center font-black">{formData.currency}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Giảm trừ khác</label>
                        <div className="flex gap-3">
                            <input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white" placeholder="0" value={formData.other_fee} onChange={e => updateField('other_fee', Number(e.target.value))} />
                            <div className="w-32 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 text-center font-black">{formData.currency}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Man-month sale <span className="text-red-500">*</span></label>
                        <input type="number" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white" placeholder="0" value={formData.man_month_sale} onChange={e => updateField('man_month_sale', Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white ml-1">Man-month division <span className="text-red-500">*</span></label>
                        <input type="number" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base focus:border-black dark:focus:border-white outline-none bg-white dark:bg-slate-700 dark:text-white" placeholder="0" value={formData.man_month_div} onChange={e => updateField('man_month_div', Number(e.target.value))} />
                    </div>
                </div>

                {/* SECTION: Milestone (Chỉ khi Project base) */}
                <div className="space-y-8 pt-12 border-t border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">Các milestone chính <span className="text-red-500">*</span></h3>
                    <div className="space-y-6">
                        {formData.project_milestones?.map((ms, idx) => (
                            <div key={idx} className="flex items-center gap-6 group animate-fade-in">
                                <button onClick={() => {
                                    const n = [...(formData.project_milestones || [])];
                                    n.splice(idx, 1);
                                    updateField('project_milestones', n);
                                }} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"><X size={24} strokeWidth={3} /></button>
                                <input type="text" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white bg-white dark:bg-slate-700 dark:text-white" placeholder="Tên milestone (VD: Nghiệm thu)" value={ms.name} onChange={e => {
                                    const n = [...(formData.project_milestones || [])];
                                    n[idx].name = e.target.value;
                                    updateField('project_milestones', n);
                                }} />
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Từ</span>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        className={`p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white w-48 bg-white dark:bg-slate-700 ${!ms.start_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
                                        value={ms.start_date} 
                                        onClick={(e) => e.currentTarget.showPicker()}
                                        onChange={e => {
                                            const n = [...(formData.project_milestones || [])];
                                            n[idx].start_date = e.target.value;
                                            updateField('project_milestones', n);
                                        }} 
                                    />
                                    <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">đến</span>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        className={`p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white w-48 bg-white dark:bg-slate-700 ${!ms.end_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
                                        value={ms.end_date} 
                                        onClick={(e) => e.currentTarget.showPicker()}
                                        onChange={e => {
                                            const n = [...(formData.project_milestones || [])];
                                            n[idx].end_date = e.target.value;
                                            updateField('project_milestones', n);
                                        }} 
                                    />
                                    <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => updateField('project_milestones', [...(formData.project_milestones || []), { name: '', start_date: '', end_date: '' }])} className="ml-14 p-3 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white shadow-sm"><Plus size={24} strokeWidth={3}/></button>
                    </div>
                </div>

                {/* SECTION: Bộ phận & Backlog Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 pt-12 border-t border-slate-100 dark:border-slate-700 items-start">
                    <div className="space-y-8">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Bộ phận phát triển & Tỉ lệ doanh thu thực nhận</h3>
                        <div className="space-y-5">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <select className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base bg-slate-50 dark:bg-slate-700 dark:text-white outline-none"><option>Bộ phận {i}</option></select>
                                    <div className="relative w-36">
                                        <input type="text" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none text-right pr-10 font-bold bg-white dark:bg-slate-700 dark:text-white" placeholder="0" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4 h-full flex flex-col">
                        <label className="text-sm font-bold text-slate-900 dark:text-white block ml-1">Backlog contract ticket link <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white placeholder:text-slate-300 bg-white dark:bg-slate-700 dark:text-white" placeholder="https://relipa.backlog.com/..." value={formData.backlog_link} onChange={e => updateField('backlog_link', e.target.value)} />
                    </div>
                </div>

                {/* SECTION: Thông tin thanh toán */}
                <div className="space-y-12 pt-12 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Thông tin thanh toán</h3>
                        <div className="flex items-center gap-6 bg-slate-100 dark:bg-slate-700 px-6 py-2.5 rounded-2xl">
                            <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Chuyển nợ</span>
                            <button onClick={() => updateField('is_transfer_debt', !formData.is_transfer_debt)} className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${formData.is_transfer_debt ? 'bg-black dark:bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white dark:bg-black rounded-full shadow-md transition-all ${formData.is_transfer_debt ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-12 pl-10 border-l-4 border-slate-100 dark:border-slate-700">
                        {formData.payers?.map((p, idx) => (
                            <div key={idx} className="space-y-6 relative animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white"></div>
                                        Bên thanh toán {idx + 1} <span className="text-red-500">*</span>
                                    </h4>
                                    {idx > 0 && <button onClick={() => {
                                        const n = [...(formData.payers || [])];
                                        n.splice(idx, 1);
                                        updateField('payers', n);
                                    }} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2.5 rounded-xl transition-all border border-transparent hover:border-rose-100"><Trash2 size={20}/></button>}
                                </div>
                                <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỉ trọng thanh toán/hoá đơn</p>
                                        <div className="relative w-48">
                                            <input type="text" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base font-black text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-700 text-right pr-12" value={p.ratio} onChange={e => {
                                                const n = [...(formData.payers || [])];
                                                n[idx].ratio = Number(e.target.value);
                                                updateField('payers', n);
                                            }} />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Người thanh toán <span className="text-red-500">*</span></p>
                                        <div className="flex gap-4">
                                            <select className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none bg-slate-50 dark:bg-slate-700 dark:text-white transition-all focus:border-black dark:focus:border-white"><option>Chọn người thanh toán</option></select>
                                            <input type="text" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none bg-slate-50 dark:bg-slate-700 text-slate-400" placeholder="Email người thanh toán" readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => updateField('payers', [...(formData.payers || []), { name: '', email: '', ratio: 0 }])} className="flex items-center gap-3 px-8 py-3 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-black text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"><Plus size={20}/> Thêm bên thanh toán</button>
                    </div>

                    {/* SECTION: Invoice Switch */}
                    <div className="space-y-8 pt-8">
                        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-700 w-fit px-8 py-4 rounded-3xl border border-slate-100 dark:border-slate-600 shadow-sm">
                             <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">Xuất hoá đơn định kỳ</span>
                             <button onClick={() => updateField('is_periodic_invoice', !formData.is_periodic_invoice)} className={`w-16 h-8 rounded-full relative transition-all shadow-inner ${formData.is_periodic_invoice ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${formData.is_periodic_invoice ? 'right-1' : 'left-1'}`}></div>
                             </button>
                        </div>

                        {formData.is_periodic_invoice ? (
                            <div className="grid grid-cols-4 gap-8 bg-slate-50/50 dark:bg-slate-800/50 p-10 rounded-[40px] border border-slate-100 dark:border-slate-700 animate-fade-in shadow-inner relative overflow-hidden">
                                <div className="space-y-2 z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày bắt đầu <span className="text-red-500">*</span></p>
                                <input 
                                    type="date" 
                                    className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white shadow-sm bg-white dark:bg-slate-700 ${!formData.periodic_config?.start_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
                                    value={formData.periodic_config?.start_date} 
                                    onClick={(e) => e.currentTarget.showPicker()} 
                                />
                                </div>
                                <div className="space-y-2 z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chu kỳ <span className="text-red-500">*</span></p><div className="flex items-center gap-3"><input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white shadow-sm text-right pr-4 font-black bg-white dark:bg-slate-700 dark:text-white" value={formData.periodic_config?.cycle} /><span className="text-xs font-black text-slate-400 uppercase">ngày</span></div></div>
                                <div className="space-y-2 z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá trị hoá đơn</p><div className="flex items-center gap-3"><input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white shadow-sm font-black text-right pr-4 bg-white dark:bg-slate-700 dark:text-white" value={formData.periodic_config?.amount} /><span className="text-xs font-black text-slate-400 uppercase w-12">{formData.currency}</span></div></div>
                                <div className="space-y-2 z-10"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú</p><input type="text" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white shadow-sm bg-white dark:bg-slate-700 dark:text-white" placeholder="Ghi chú hoá đơn" value={formData.periodic_config?.note} /></div>
                                <div className="absolute -right-16 -bottom-16 opacity-[0.02] rotate-12 dark:text-white"><FileText size={320} /></div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                 {formData.payment_milestones?.map((pm, idx) => (
                                     <div key={idx} className="flex items-center gap-6 bg-white dark:bg-slate-800 p-6 border-2 border-slate-50 dark:border-slate-700 rounded-[32px] shadow-sm hover:shadow-md transition-all group">
                                         <button onClick={() => {
                                             const n = [...(formData.payment_milestones || [])];
                                             n.splice(idx, 1);
                                             updateField('payment_milestones', n);
                                         }} className="p-3 text-slate-200 dark:text-slate-600 group-hover:text-rose-500 transition-all"><X size={24} strokeWidth={3}/></button>
                                         <div className="relative">
                                            <input 
                                                type="date" 
                                                className={`p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none w-52 focus:border-black dark:focus:border-white bg-white dark:bg-slate-700 ${!pm.date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`} 
                                                value={pm.date} 
                                                onClick={(e) => e.currentTarget.showPicker()} 
                                            />
                                            <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" /></div>
                                         <input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none font-black text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:border-black dark:focus:border-white" placeholder="Số tiền" value={pm.amount} />
                                         <div className="flex items-center gap-3 w-40 border-2 border-slate-100 dark:border-slate-600 p-4 rounded-2xl bg-white dark:bg-slate-700"><input type="number" className="w-full text-base font-black outline-none text-right bg-transparent dark:text-white" value={pm.percent} /> <span className="text-xs font-black text-slate-400 uppercase">%</span></div>
                                         <input type="text" className="flex-[2] p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white bg-white dark:bg-slate-700 dark:text-white" placeholder="Ghi chú mốc thanh toán" value={pm.note} />
                                     </div>
                                 ))}
                                 <button onClick={() => updateField('payment_milestones', [...(formData.payment_milestones || []), { date: '', amount: 0, percent: 0, note: '' }])} className="ml-16 p-3 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:border-black dark:hover:border-white shadow-sm"><Plus size={24} strokeWidth={3}/></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION: Phân bổ doanh thu & công số */}
                <div className="space-y-12 pt-16 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Phân bổ doanh thu & công số</h3>
                            <div className="mt-6 flex flex-wrap gap-x-12 gap-y-3 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                                <div className="space-y-1"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Tổng doanh thu phân bổ</p><p className="text-base font-black text-emerald-600 dark:text-emerald-400">{totalAllocated.toLocaleString()} {formData.currency}</p></div>
                                <div className="space-y-1"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Giá trị hợp đồng</p><p className="text-base font-black text-slate-900 dark:text-white">{(formData.total_value || 0).toLocaleString()} {formData.currency}</p></div>
                                <div className="w-px h-10 bg-slate-200 dark:bg-slate-600 mx-2"></div>
                                <div className="space-y-1"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Tổng man-month phân bổ</p><p className="text-base font-black text-indigo-600 dark:text-indigo-400">{totalMMAllocated}</p></div>
                                <div className="space-y-1"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Man-month division</p><p className="text-base font-black text-slate-900 dark:text-white">{formData.man_month_div}</p></div>
                            </div>
                        </div>
                        <button onClick={handleAutoAllocate} className="px-10 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xl transition-all active:scale-95 border-2 border-black dark:border-white">Tự động phân bổ</button>
                    </div>

                    <div className="space-y-5">
                        {formData.allocations?.map((a, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-6 items-center animate-fade-in group bg-white dark:bg-slate-800 p-3 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <div className="col-span-1 flex justify-center">
                                    <button onClick={() => {
                                        const n = [...(formData.allocations || [])];
                                        n.splice(idx, 1);
                                        updateField('allocations', n);
                                    }} className="text-slate-200 dark:text-slate-600 group-hover:text-rose-500 p-2.5 transition-all"><X size={24} strokeWidth={3}/></button>
                                </div>
                                <div className="col-span-3 space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tháng <span className="text-red-500">*</span></p>
                                    <div className="relative">
                                        <input type="text" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base font-black text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-700 focus:border-black dark:focus:border-white" value={a.month} onChange={e => {
                                            const n = [...(formData.allocations || [])];
                                            n[idx].month = e.target.value;
                                            updateField('allocations', n);
                                        }} />
                                        <CalendarIcon size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="col-span-4 space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Số tiền <span className="text-red-500">*</span></p>
                                    <div className="flex items-center gap-3">
                                        <input type="number" className="flex-1 p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base font-black text-slate-900 dark:text-white outline-none focus:border-black dark:focus:border-white shadow-sm bg-white dark:bg-slate-700" value={a.amount} onChange={e => {
                                            const n = [...(formData.allocations || [])];
                                            n[idx].amount = Number(e.target.value);
                                            updateField('allocations', n);
                                        }} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase w-12">{formData.currency}</span>
                                    </div>
                                </div>
                                <div className="col-span-4 space-y-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Số man-month</p>
                                    <input type="number" step="0.01" className="w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base font-black text-slate-900 dark:text-white outline-none focus:border-black dark:focus:border-white shadow-sm bg-white dark:bg-slate-700" value={a.man_month} onChange={e => {
                                        const n = [...(formData.allocations || [])];
                                        n[idx].man_month = Number(e.target.value);
                                        updateField('allocations', n);
                                    }} />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => updateField('allocations', [...(formData.allocations || []), { month: '01/2024', amount: 0, man_month: 0 }])} className="ml-16 p-3 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:border-black dark:hover:border-white shadow-sm"><Plus size={24} strokeWidth={3}/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ContractsModule = ({ data, projects, clients, onAdd, onViewDetail }: any) => {
    // ... Contract Module remains same ...
    const [filters, setFilters] = useState({ search: '', type: 'Tất cả', validity: 'Tất cả', currency: 'Tất cả', status: 'Tất cả', startDate: '', endDate: '' });
    const location = useLocation();

    useEffect(() => {
        if (location.state?.filterSearch) {
            setFilters(prev => ({ ...prev, search: location.state.filterSearch }));
        }
    }, [location.state]);
    
    const filteredData = useMemo(() => {
        return data.filter((c: Contract) => {
            const project = projects.find((p: any) => p.id === c.project_id);
            const client = clients.find((cl: any) => cl.id === c.client_id);
            
            const matchesSearch = !filters.search || 
                c.code.toLowerCase().includes(filters.search.toLowerCase()) ||
                project?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                client?.name.toLowerCase().includes(filters.search.toLowerCase());

            const matchesType = filters.type === 'Tất cả' || c.type === filters.type;
            const matchesCurrency = filters.currency === 'Tất cả' || c.currency === filters.currency;
            
            const statusMap: Record<number, string> = { 1: 'Chờ ký', 2: 'Đã ký', 3: 'Dự kiến' };
            const matchesStatus = filters.status === 'Tất cả' || statusMap[c.status_id] === filters.status;

            let matchesDate = true;
            if (filters.startDate || filters.endDate) {
                const date = parseDDMMYYYY(c.start_date);
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

            return matchesSearch && matchesType && matchesCurrency && matchesStatus && matchesDate;
        }).sort((a: any, b: any) => b.id - a.id);
    }, [data, filters, projects, clients]);

    const handleClearFilters = () => setFilters({ search: '', type: 'Tất cả', validity: 'Tất cả', currency: 'Tất cả', status: 'Tất cả', startDate: '', endDate: '' });

    const isFiltered = filters.type !== 'Tất cả' || filters.validity !== 'Tất cả' || filters.currency !== 'Tất cả' || filters.status !== 'Tất cả' || filters.startDate !== '' || filters.endDate !== '';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[85vh] p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Quản lý hợp đồng</h2>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {filteredData.length} hợp đồng
                    </div>
                    <button onClick={onAdd} className="bg-black dark:bg-white dark:text-black text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md">
                        Thêm hợp đồng
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm hợp đồng ..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:bg-slate-800 dark:text-white transition-all" 
                            value={filters.search} 
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} 
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-10">
                <div className="p-2 text-slate-900 dark:text-white"><Filter size={20} strokeWidth={2.5} /></div>
                <div className="relative">
                    <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                        <option>Tất cả loại hợp đồng</option><option>ODC</option><option>Project base</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500" value={filters.validity} onChange={e => setFilters({...filters, validity: e.target.value})}>
                        <option>Hiệu lực</option><option>Còn hiệu lực</option><option>Sắp hết hạn</option><option>Đã hết hạn</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500" value={filters.currency} onChange={e => setFilters({...filters, currency: e.target.value})}>
                        <option>Đơn vị tiền</option><option>USD</option><option>JPY</option><option>VND</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                        <option>Trạng thái ký</option><option>Chờ ký</option><option>Đã ký</option><option>Dự kiến</option>
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
                    <button onClick={handleClearFilters} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors animate-fade-in">Xoá bộ lọc</button>
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
                            <th className="py-4 pr-4">Mã hợp đồng</th>
                            <th className="py-4 pr-4">Tên dự án</th>
                            <th className="py-4 pr-4">Khách hàng</th>
                            <th className="py-4 pr-4">Ngày bắt đầu</th>
                            <th className="py-4 pr-4">Ngày kết thúc</th>
                            <th className="py-4 pr-4">Giá trị HĐ</th>
                            <th className="py-4 pr-4">Doanh thu NET</th>
                            <th className="py-4 pr-4">Tiến độ TT</th>
                            <th className="py-4 pr-4">Loại hợp đồng</th>
                            <th className="py-4 pr-4">Trạng thái ký</th>
                            <th className="py-4">Hiệu lực</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((c: Contract) => {
                            const project = projects.find((p: any) => p.id === c.project_id);
                            const client = clients.find((cl: any) => cl.id === c.client_id);
                            return (
                                <tr key={c.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group" onClick={() => onViewDetail(c)}>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400 font-medium">{c.code}</td>
                                    <td className="py-4 pr-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{project?.name || '-'}</div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{project?.code}</div>
                                    </td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400 font-medium">{client?.name || '-'}</td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{c.start_date}</td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{c.end_date}</td>
                                    <td className="py-4 pr-4 font-bold text-slate-900 dark:text-white text-right">{c.total_value.toLocaleString()} {c.currency}</td>
                                    <td className="py-4 pr-4 font-bold text-slate-500 dark:text-slate-400 text-right">{c.net_revenue?.toLocaleString()} {c.currency}</td>
                                    <td className="py-4 pr-4">
                                        <div className="flex flex-col gap-1.5 min-w-[80px]">
                                            <span className="text-[11px] font-bold text-slate-900 dark:text-white">{c.progress || 50}%</span>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-black dark:bg-white h-full" style={{ width: `${c.progress || 50}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-4 text-slate-600 dark:text-slate-400 font-medium">{c.type}</td>
                                    <td className="py-4 pr-4"><StatusBadge type="contract" status={c.status_id} /></td>
                                    <td className="py-4"><StatusBadge type="contract_validity" contract={c} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ContractDetailView = ({ contract, project, invoices = [], onBack, onEdit, onExtend, onNavigate }: any) => {
    const [activeTab, setActiveTab] = useState<'revenue' | 'payment' | 'history'>('revenue');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    const contractInvoices = invoices.filter((i: Invoice) => i.project_id === contract.project_id); 
    const totalValue = contract.total_value;
    const paidAmount = contractInvoices.filter((i: any) => i.status_id === 3).reduce((sum: number, i: any) => sum + (i.paid_amount || 0), 0);
    const progressPercent = contract.progress || 80;

    return (
        <div className="min-h-screen pb-10 bg-slate-50 dark:bg-slate-900 animate-fade-in">
            {/* Header ... */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-5">
                    <button onClick={onBack} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all text-slate-900 dark:text-white"><ArrowLeft size={28} strokeWidth={2.5} /></button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hợp đồng {contract.code}</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">Dự án: {project?.name} ({project?.code})</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsRequestModalOpen(true)} className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Request start</button>
                    <button onClick={() => onExtend(contract)} className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Gia hạn</button>
                    <button className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Thêm hoá đơn</button>
                    <button onClick={() => onEdit(contract)} className="px-10 py-2.5 bg-black dark:bg-white dark:text-black text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md transition-all active:scale-95">Chỉnh sửa</button>
                </div>
            </div>

            {/* Body ... */}
            <div className="p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                        <div className="flex items-center gap-3 mb-10">
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest mr-4">Thông tin hợp đồng</h3>
                            <StatusBadge type="contract" status={contract.status_id} />
                            <span className="px-5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold uppercase tracking-widest">Hết hiệu lực sau 50 ngày</span>
                        </div>
                        <div className="grid grid-cols-1 gap-y-4 text-sm">
                            <div className="flex items-center"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Tên khách hàng:</span> <span className="font-bold text-slate-900 dark:text-white">FPT Software</span></div>
                            <div className="flex items-center"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Loại hợp đồng:</span> <span className="font-bold text-slate-900 dark:text-white">{contract.type}</span></div>
                            <div className="flex items-center"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Bộ phận phát triển:</span> <span className="font-bold text-slate-900 dark:text-white">Division 1 (50%), Global (50%)</span></div>
                            <div className="flex items-center"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Ngày bắt đầu:</span> <span className="font-bold text-slate-900 dark:text-white">{contract.start_date}</span></div>
                            <div className="flex items-center"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Ngày kết thúc:</span> <span className="font-bold text-slate-900 dark:text-white">{contract.end_date}</span></div>
                            <div className="flex items-center"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Ngày ký kết:</span> <span className="font-bold text-slate-900 dark:text-white">{contract.sign_date || '15/1/2023'}</span></div>
                            <div className="flex items-start"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Ghi chú:</span> <span className="font-bold text-slate-900 dark:text-white flex-1 leading-relaxed">{contract.note || '-'}</span></div>
                            <div className="flex items-start"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Người thanh toán:</span> <div className="space-y-1 font-bold text-slate-900 dark:text-white"><div>Bên 1 (100%): &nbsp; Nguyễn Văn A &nbsp; <span className="text-slate-400 dark:text-slate-500 font-medium">nguyenvana@gmail.com</span></div></div></div>
                            <div className="flex items-center"><span className="text-slate-400 dark:text-slate-500 font-bold w-48">Chuyển nợ:</span> <span className="font-bold text-slate-900 dark:text-white">{contract.is_transfer_debt ? 'Có' : 'Không'}</span></div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                         <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest mb-10">Tổng quan tài chính</h3>
                         <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm"><div className="text-[10px] text-slate-400 dark:text-slate-300 mb-2 font-bold uppercase tracking-wider">Giá trị hợp đồng</div><div className="font-black text-lg text-slate-900 dark:text-white">450.000,00 US$</div></div>
                            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl shadow-sm space-y-3"><div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider"><span>Tiến độ thanh toán</span><span className="text-slate-900 dark:text-white font-black">{progressPercent}%</span></div><div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden"><div className="bg-black dark:bg-white h-full" style={{width: `${progressPercent}%`}}></div></div></div>
                            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm"><div className="text-[10px] text-slate-400 dark:text-slate-300 mb-2 font-bold uppercase tracking-wider">Đã nhận</div><div className="font-black text-lg text-slate-900 dark:text-white">400.000,00 US$</div></div>
                            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm"><div className="text-[10px] text-slate-400 dark:text-slate-300 mb-2 font-bold uppercase tracking-wider">Còn lại</div><div className="font-black text-lg text-slate-900 dark:text-white">50.000,00 US$</div></div>
                         </div>
                         <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[11px] font-bold uppercase tracking-wider">
                            <div className="flex justify-between border-b border-slate-50 dark:border-slate-600 pb-1"><span className="text-slate-400 dark:text-slate-500">Man-month sale:</span> <span className="text-slate-900 dark:text-white">12</span></div>
                            <div className="flex justify-between border-b border-slate-50 dark:border-slate-600 pb-1"><span className="text-slate-400 dark:text-slate-500">Hoa hồng:</span> <span className="text-slate-900 dark:text-white">10.000 US$</span></div>
                            <div className="flex justify-between border-b border-slate-50 dark:border-slate-600 pb-1"><span className="text-slate-400 dark:text-slate-500">Man-month div:</span> <span className="text-slate-900 dark:text-white">12</span></div>
                            <div className="flex justify-between border-b border-slate-50 dark:border-slate-600 pb-1"><span className="text-slate-400 dark:text-slate-500">Discount:</span> <span className="text-slate-900 dark:text-white">5.000 US$</span></div>
                            <div className="pt-2"><div className="flex justify-between border-b border-slate-50 dark:border-slate-600 pb-1"><span className="text-slate-400 dark:text-slate-500">Other:</span> <span className="text-slate-900 dark:text-white">5.000 US$</span></div></div>
                         </div>
                    </div>
                </div>

                {/* Tabs ... */}
                <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-2xl w-fit flex gap-1 shadow-inner">
                    <button onClick={() => setActiveTab('revenue')} className={`px-10 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'revenue' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Doanh thu</button>
                    <button onClick={() => setActiveTab('payment')} className={`px-10 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'payment' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Hoá đơn</button>
                    <button onClick={() => setActiveTab('history')} className={`px-10 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Lịch sử thay đổi</button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px] p-10">
                    {/* ... Existing tabs content ... */}
                    {activeTab === 'revenue' && (
                        <div className="h-[450px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={[{name: '5/2024', revenue: 500000, mm: 2}, {name: '6/2024', revenue: 450000, mm: 2}, {name: '7/2024', revenue: 480000, mm: 2.5}]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontWeight="bold" dy={15} stroke="#94a3b8" />
                                    {/* Primary Y-Axis for Revenue (Bar) */}
                                    <YAxis yAxisId="left" hide />
                                    {/* Secondary Y-Axis for Man-month (Line) */}
                                    <YAxis yAxisId="right" orientation="right" hide />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    {/* Assign Y-Axis IDs */}
                                    <Bar yAxisId="left" dataKey="revenue" fill="#cbd5e1" barSize={70} radius={[12, 12, 0, 0]} />
                                    <Line yAxisId="right" type="monotone" dataKey="mm" stroke="#fff" strokeWidth={4} dot={{r: 6, fill: '#fff', strokeWidth: 3, stroke: '#000'}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {activeTab === 'payment' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="border border-slate-100 dark:border-slate-700 rounded-3xl p-8 bg-slate-50/50 dark:bg-slate-800/50 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-8 relative z-10"><h4 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-widest">Cài đặt hoá đơn</h4><span className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest">Định kỳ</span></div>
                                <div className="grid grid-cols-3 gap-16 relative z-10">
                                    <div className="space-y-1.5"><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ngày bắt đầu</p><p className="text-base font-black text-slate-900 dark:text-white">01/02/2025</p></div>
                                    <div className="space-y-1.5"><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chu kỳ</p><p className="text-base font-black text-slate-900 dark:text-white">30 ngày</p></div>
                                    <div className="space-y-1.5"><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Giá trị hoá đơn</p><p className="text-base font-black text-slate-900 dark:text-white">50.000,00 US$</p></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-8">Hoá đơn đã tạo</h4>
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50/80 dark:bg-slate-700/80 text-slate-900 dark:text-white font-bold uppercase text-[10px] tracking-widest"><tr><th className="py-5 px-6 rounded-l-2xl">Mã hoá đơn</th><th className="py-5 px-4 text-right">Giá trị hoá đơn</th><th className="py-5 px-4">Ngày xuất</th><th className="py-5 px-4">Ngày đến hạn</th><th className="py-5 px-4">Ngày thanh toán</th><th className="py-5 px-6 text-center rounded-r-2xl">Trạng thái</th></tr></thead>
                                    <tbody>{[1,2,3].map(i => <tr key={i} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><td className="py-5 px-6 font-bold text-slate-900 dark:text-white">INV-2024-001</td><td className="py-5 px-4 font-black text-slate-600 dark:text-slate-400 text-right">50.000,00 US$</td><td className="py-5 px-4 text-slate-500 dark:text-slate-400 font-medium">18/05/2025</td><td className="py-5 px-4 text-slate-500 dark:text-slate-400 font-medium">18/05/2025</td><td className="py-5 px-4 text-slate-500 dark:text-slate-400 font-medium">18/05/2025</td><td className="py-5 px-6 text-center"><StatusBadge type="invoice" status={3} /></td></tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'history' && (
                        <div className="space-y-6 max-w-3xl">
                             {/* Mock Item 1 */}
                             <div className="flex gap-4">
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-1 bg-white dark:bg-slate-800">
                                    <div className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                                        Thay đổi thông tin: Địa chỉ
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trước thay đổi: -</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Sau thay đổi: Hanoi, Vietnam</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                </div>
                             </div>

                             {/* Mock Item 2 */}
                             <div className="flex gap-4">
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-1 bg-white dark:bg-slate-800">
                                    <div className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Tạo mới</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
            <RequestStartModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} contract={contract} project={project} />
        </div>
    );
};
