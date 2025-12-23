
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight, Download, ImageIcon } from 'lucide-react';
import { Invoice, Project, Client, Contract, InvoiceNote, BankStatement } from '../types';
import { StatusBadge, FormHeader, DateRangePicker, parseDDMMYYYY } from './Shared';
import { useLocation } from 'react-router-dom';

export const InvoiceForm = ({ initialData, projects, clients, contracts, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Invoice>>(initialData || {
        invoice_no: '',
        project_id: undefined,
        client_id: undefined,
        contract_id: undefined,
        issue_date: '',
        due_date: '',
        contract_value: 0,
        deduction: 0,
        subtotal: 0,
        total_amount: 0,
        currency: 'USD',
        status_id: 1, 
        legal_entity: '',
        exchange_rate: 0,
        content_vn: '',
        content_jp: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const val = Number(formData.contract_value) || 0;
        const ded = Number(formData.deduction) || 0;
        const sub = val - ded;
        if (sub !== formData.subtotal) {
            setFormData(prev => ({ ...prev, subtotal: sub }));
        }
    }, [formData.contract_value, formData.deduction]);

    const handleProjectChange = (projectId: number) => {
        const project = projects.find((p: Project) => p.id === projectId);
        setFormData(prev => ({
            ...prev,
            project_id: projectId,
            client_id: project?.client_id || prev.client_id,
            contract_id: undefined 
        }));
    };

    const handleContractChange = (contractId: number) => {
        const contract = contracts?.find((c: Contract) => c.id === contractId);
        setFormData(prev => ({
            ...prev,
            contract_id: contractId,
            currency: contract?.currency || prev.currency,
            client_id: contract?.client_id || prev.client_id
        }));
    };

    const generateInvoiceCode = () => {
        const client = clients.find((c: Client) => c.id === formData.client_id);
        const clientCode = client?.code || 'AAA';
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const randomNN = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
        
        const code = `INV-${clientCode}-${yyyy}${mm}${dd}-${randomNN}`;
        handleChange('invoice_no', code);
    };

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

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.project_id) newErrors.project_id = "ERROR_PROJECT_REQUIRED";
        if (!formData.client_id) newErrors.client_id = "ERROR_CUSTOMER_REQUIRED";
        if (!formData.contract_id) newErrors.contract_id = "ERROR_CONTRACT_REQUIRED";
        if (!formData.legal_entity) newErrors.legal_entity = "ERROR_LEGAL_ENTITY_REQUIRED";
        if (!formData.currency) newErrors.currency = "ERROR_CURRENCY_REQUIRED";
        
        if (!formData.issue_date) newErrors.issue_date = "ERROR_ISSUE_DATE_INVALID";
        if (!formData.due_date) newErrors.due_date = "ERROR_DUE_DATE_INVALID";
        if (formData.issue_date && formData.due_date && new Date(formData.due_date) < new Date(formData.issue_date)) {
            newErrors.due_date = "ERROR_DUE_DATE_BEFORE_ISSUE_DATE";
        }

        if (Number(formData.contract_value) <= 0) newErrors.contract_value = "ERROR_CONTRACT_VALUE_INVALID";
        if (Number(formData.deduction) < 0) newErrors.deduction = "ERROR_DISCOUNT_INVALID";
        if (Number(formData.deduction) > Number(formData.contract_value)) newErrors.deduction = "ERROR_DISCOUNT_EXCEEDS_CONTRACT_VALUE";
        
        if (!formData.content_vn) newErrors.content_vn = "ERROR_CONTENT_VN_REQUIRED";
        if (formData.content_vn && formData.content_vn.length > 5000) newErrors.content_vn = "ERROR_CONTENT_TOO_LONG";
        if (formData.content_jp && formData.content_jp.length > 5000) newErrors.content_jp = "ERROR_CONTENT_TOO_LONG";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    const availableContracts = contracts?.filter((c: Contract) => 
        (!formData.project_id || c.project_id === formData.project_id) && 
        (!formData.client_id || c.client_id === formData.client_id)
    ) || [];

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl min-h-screen">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông tin đề nghị thanh toán</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Huỷ</button>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md">Lưu</button>
                </div>
            </div>

            <div className="flex gap-10">
                <div className="flex-1 max-w-3xl space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Dự án <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.project_id || ''} 
                            onChange={e => handleProjectChange(Number(e.target.value))} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.project_id ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'} ${!formData.project_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        >
                            <option value="" disabled hidden>Chọn dự án</option>
                            {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {errors.project_id && <p className="text-xs text-red-500">{errors.project_id}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Khách hàng <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.client_id || ''} 
                            onChange={e => handleChange('client_id', Number(e.target.value))} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.client_id ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'} ${!formData.client_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        >
                            <option value="" disabled hidden>Chọn khách hàng</option>
                            {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.client_id && <p className="text-xs text-red-500">{errors.client_id}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Hợp đồng <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.contract_id || ''} 
                            onChange={e => handleContractChange(Number(e.target.value))} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.contract_id ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'} ${!formData.contract_id ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        >
                            <option value="" disabled hidden>Chọn hợp đồng</option>
                            {availableContracts.map((c: Contract) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                        </select>
                        {errors.contract_id && <p className="text-xs text-red-500">{errors.contract_id}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Mã hoá đơn <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={formData.invoice_no} 
                                onChange={e => handleChange('invoice_no', e.target.value)} 
                                className="flex-1 p-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                placeholder="Mã hoá đơn"
                            />
                            <button 
                                onClick={generateInvoiceCode}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
                            >
                                Tự động
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Pháp nhân <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.legal_entity || ''} 
                            onChange={e => handleChange('legal_entity', e.target.value)} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.legal_entity ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'} ${!formData.legal_entity ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        >
                            <option value="" disabled hidden>Chọn pháp nhân</option>
                            <option value="Relipa VN" className="text-slate-900 dark:text-white">Relipa VN</option>
                            <option value="Relipa JP" className="text-slate-900 dark:text-white">Relipa JP</option>
                            <option value="Relipa Global" className="text-slate-900 dark:text-white">Relipa Global</option>
                        </select>
                        {errors.legal_entity && <p className="text-xs text-red-500">{errors.legal_entity}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Ngày xuất <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            value={formData.issue_date} 
                            onClick={(e) => e.currentTarget.showPicker()}
                            onChange={e => handleChange('issue_date', e.target.value)} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.issue_date ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'} ${!formData.issue_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        />
                        {errors.issue_date && <p className="text-xs text-red-500">{errors.issue_date}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Ngày đến hạn <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            value={formData.due_date} 
                            onClick={(e) => e.currentTarget.showPicker()}
                            onChange={e => handleChange('due_date', e.target.value)} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.due_date ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'} ${!formData.due_date ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
                        />
                        {errors.due_date && <p className="text-xs text-red-500">{errors.due_date}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Đơn vị tiền <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.currency || 'USD'} 
                            onChange={e => handleChange('currency', e.target.value)} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.currency ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'}`}
                        >
                            <option value="USD">USD</option>
                            <option value="JPY">JPY</option>
                            <option value="VND">VND</option>
                        </select>
                        {errors.currency && <p className="text-xs text-red-500">{errors.currency}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Giá trị theo hợp đồng <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={formData.contract_value} 
                                onChange={e => handleChange('contract_value', Number(e.target.value))} 
                                className={`flex-1 p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.contract_value ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'}`}
                            />
                            <div className="w-16 p-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-center text-slate-600 dark:text-slate-300">{formData.currency}</div>
                        </div>
                        {errors.contract_value && <p className="text-xs text-red-500">{errors.contract_value}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Giảm trừ công số <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={formData.deduction} 
                                onChange={e => handleChange('deduction', Number(e.target.value))} 
                                className={`flex-1 p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${errors.deduction ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'}`}
                            />
                            <div className="w-16 p-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-center text-slate-600 dark:text-slate-300">{formData.currency}</div>
                        </div>
                        {errors.deduction && <p className="text-xs text-red-500">{errors.deduction}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Giá trị trước VAT <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={formData.subtotal} 
                                readOnly 
                                className="flex-1 p-2.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm focus:outline-none text-slate-700 dark:text-white"
                            />
                            <div className="w-16 p-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-center text-slate-600 dark:text-slate-300">{formData.currency}</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Giá trị sau VAT <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={formData.total_amount} 
                                onChange={e => handleChange('total_amount', Number(e.target.value))} 
                                className="flex-1 p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:bg-slate-700 dark:text-white"
                            />
                            <div className="w-16 p-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-center text-slate-600 dark:text-slate-300">{formData.currency}</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Tỉ giá (VNĐ) <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            value={formData.exchange_rate} 
                            onChange={e => handleChange('exchange_rate', Number(e.target.value))} 
                            className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Nội dung xuất hoá đơn (VN) <span className="text-red-500">*</span></label>
                        <textarea 
                            value={formData.content_vn} 
                            onChange={e => handleChange('content_vn', e.target.value)} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 h-24 resize-none dark:bg-slate-700 dark:text-white ${errors.content_vn ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'}`}
                        ></textarea>
                        {errors.content_vn && <p className="text-xs text-red-500">{errors.content_vn}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Nội dung xuất hoá đơn (JP) <span className="text-red-500">*</span></label>
                        <textarea 
                            value={formData.content_jp} 
                            onChange={e => handleChange('content_jp', e.target.value)} 
                            className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 h-24 resize-none dark:bg-slate-700 dark:text-white ${errors.content_jp ? 'border-red-500 ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-black dark:focus:ring-white'}`}
                        ></textarea>
                        {errors.content_jp && <p className="text-xs text-red-500">{errors.content_jp}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Trạng thái <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.status_id} 
                            onChange={e => handleChange('status_id', Number(e.target.value))} 
                            className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:bg-slate-700 dark:text-white"
                        >
                            <option value={1}>Đã tạo</option>
                            <option value={2}>Đã gửi</option>
                            <option value={3}>Đã thanh toán</option>
                            <option value={4}>Quá hạn</option>
                            <option value={5}>Đã huỷ</option>
                        </select>
                    </div>
                </div>

                <div className="w-80 flex flex-col items-center">
                    <div className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-8 mb-6">
                        <ImageIcon size={64} className="text-slate-400 dark:text-slate-500 mb-4" />
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Xem trước invoice</span>
                    </div>
                    <button className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Download size={16} />
                        Tải xuống
                    </button>
                </div>
            </div>
        </div>
    );
};

export const InvoiceDetailView = ({ invoice, project, client, contract, onBack, onEdit }: any) => {
    const [activeTab, setActiveTab] = useState<'notes' | 'statement' | 'history'>('notes');
    const [notes, setNotes] = useState<InvoiceNote[]>([
        { id: 1, content: "Khách hẹn cuối tháng 5 thanh toán", created_by: "Trần Xuân Đức", created_at: "21:30:00 ngày 10/6/2024" },
        { id: 2, content: "Khách hẹn cuối tháng 5 thanh toán", created_by: "Trần Xuân Đức", created_at: "21:30:00 ngày 10/6/2024" }
    ]);

    const subTotal = invoice.subtotal || invoice.total_amount;
    const totalAmount = invoice.total_amount;
    const paidAmount = invoice.paid_amount || 0;
    const remainingAmount = totalAmount - paidAmount;

    return (
        <div className="min-h-screen pb-10 bg-slate-50 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Hoá đơn {invoice.invoice_no}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Khách hàng: {client?.name} ({client?.code})</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Xem hoá đơn</button>
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Gửi hoá đơn</button>
                    <button onClick={() => onEdit(invoice)} className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200">Chỉnh sửa</button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white">Thông tin hoá đơn</h3>
                            <StatusBadge type="invoice" status={invoice.status_id} label={invoice.status_name} />
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Mã hợp đồng:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{contract?.code || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Loại hợp đồng:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{contract?.type || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Tên dự án:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{project?.name} ({project?.code})</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Khách hàng:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{client?.name} ({client?.code})</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Pháp nhân:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{invoice.legal_entity || 'Relipa JP'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Nội dung xuất hoá đơn (JP):</span>
                                <span className="font-medium text-slate-900 dark:text-white">{invoice.content_jp || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Nội dung xuất hoá đơn (VN):</span>
                                <span className="font-medium text-slate-900 dark:text-white">{invoice.content_vn || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 dark:text-slate-400 w-48 block">Được gom vào hoá đơn:</span>
                                <span className="font-medium text-slate-900 dark:text-white">FPT-MBA-010</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Tổng quan tài chính</h3>
                        <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Giá trị trước VAT</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{subTotal?.toLocaleString()} {invoice.currency}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Đã thanh toán</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{paidAmount?.toLocaleString()} {invoice.currency}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Giá trị sau VAT</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{totalAmount?.toLocaleString()} {invoice.currency}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Còn lại</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{remainingAmount?.toLocaleString()} {invoice.currency}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tỉ giá (VNĐ)</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{invoice.exchange_rate?.toLocaleString() || '23,500'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ngày xuất</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{invoice.issue_date}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ngày đến hạn</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{invoice.due_date}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ngày thanh toán</div>
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{invoice.payment_date || invoice.issue_date}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg w-fit mb-6">
                        <button onClick={() => setActiveTab('notes')} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'notes' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Ghi chú</button>
                        <button onClick={() => setActiveTab('statement')} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'statement' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Sao kê</button>
                        <button onClick={() => setActiveTab('history')} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-600 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'}`}>Lịch sử thay đổi</button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[300px] p-6 relative">
                        {activeTab === 'notes' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Danh sách ghi chú</h4>
                                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Thêm ghi chú</button>
                                </div>
                                <div className="space-y-4 max-w-4xl mt-2">
                                    {notes.map((note) => (
                                        <div key={note.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                            <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">Nội dung: {note.content}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Bởi: {note.created_by} vào lúc {note.created_at}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'statement' && (
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                 <div className="flex-1 space-y-4 text-sm w-full">
                                     <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Ngày chứng từ:</span> <span className="font-medium text-slate-900 dark:text-white">23/6/2025</span></div>
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Số chứng từ:</span> <span className="font-medium text-slate-900 dark:text-white">MBA-C-001</span></div>
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Mã đối tượng:</span> <span className="font-medium text-slate-900 dark:text-white">FPT-001</span></div>
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Tên đối tượng:</span> <span className="font-medium text-slate-900 dark:text-white">FPT Software</span></div>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Địa chỉ:</span> <span className="font-medium text-slate-900 dark:text-white">-</span></div>
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Tài khoản nhận:</span> <span className="font-medium text-slate-900 dark:text-white">-</span></div>
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Mở tại ngân hàng:</span> <span className="font-medium text-slate-900 dark:text-white">-</span></div>
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Loại tiền:</span> <span className="font-medium text-slate-900 dark:text-white">USD</span></div>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Số tiền:</span> <span className="font-bold text-red-600 dark:text-red-400">500,000.00</span></div>
                                         <div><span className="text-slate-500 dark:text-slate-400 block text-xs mb-1">Diễn giải:</span> <span className="font-medium text-slate-900 dark:text-white">Thanh toan dot 1</span></div>
                                     </div>
                                 </div>
                                 <div className="w-full md:w-64 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-700 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                                     <ImageIcon size={48} className="text-slate-300 dark:text-slate-500 mb-2" />
                                     <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Xem sao kê</span>
                                 </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-6 max-w-3xl">
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
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center pt-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                    </div>
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-1">
                                        <div className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Tạo mới</div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const InvoicesModule = ({ data, statements, projects, clients, contracts, onAdd, onEdit, onDelete, onViewDetail }: any) => {
    const [viewMode, setViewMode] = useState<'list' | 'statement'>('list');
    const location = useLocation();
    
    // -- Invoice Filters --
    const [invoiceFilters, setInvoiceFilters] = useState({
        search: '',
        status: 'all',
        client: 'all',
        project: 'all',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (location.state?.filterSearch) {
            setInvoiceFilters(prev => ({ ...prev, search: location.state.filterSearch }));
        }
    }, [location.state]);

    // -- Statement Filters --
    const [statementFilters, setStatementFilters] = useState({
        search: '',
        status: 'all',
        objectCode: 'all',
        objectName: 'all',
        startDate: '',
        endDate: ''
    });

    // Data for dropdowns
    const invoiceStatuses = [
        { id: 1, label: 'Đã tạo' },
        { id: 2, label: 'Đã gửi' },
        { id: 3, label: 'Đã thanh toán' },
        { id: 4, label: 'Quá hạn' },
        { id: 5, label: 'Đã huỷ' }
    ];

    const uniqueObjectCodes = useMemo(() => Array.from(new Set(statements?.map((s: BankStatement) => s.object_code))).filter(Boolean), [statements]);
    const uniqueObjectNames = useMemo(() => Array.from(new Set(statements?.map((s: BankStatement) => s.object_name))).filter(Boolean), [statements]);

    // Filtering Logic
    const filteredInvoices = useMemo(() => {
        return data.filter((i: Invoice) => {
            if (invoiceFilters.search && !i.invoice_no.toLowerCase().includes(invoiceFilters.search.toLowerCase())) return false;
            if (invoiceFilters.status !== 'all' && i.status_id !== Number(invoiceFilters.status)) return false;
            if (invoiceFilters.client !== 'all' && i.client_id !== Number(invoiceFilters.client)) return false;
            if (invoiceFilters.project !== 'all' && i.project_id !== Number(invoiceFilters.project)) return false;
            
            if (invoiceFilters.startDate || invoiceFilters.endDate) {
                const date = parseDDMMYYYY(i.issue_date);
                if (date) {
                    if (invoiceFilters.startDate) {
                        const start = new Date(invoiceFilters.startDate);
                        start.setHours(0,0,0,0);
                        if (date < start) return false;
                    }
                    if (invoiceFilters.endDate) {
                        const end = new Date(invoiceFilters.endDate);
                        end.setHours(23,59,59,999);
                        if (date > end) return false;
                    }
                }
            }
            return true;
        });
    }, [data, invoiceFilters]);

    const filteredStatements = useMemo(() => {
        return statements ? statements.filter((s: BankStatement) => {
            if (statementFilters.search) {
                const term = statementFilters.search.toLowerCase();
                if (!s.document_no.toLowerCase().includes(term)) return false;
            }
            if (statementFilters.status !== 'all' && s.status !== statementFilters.status) return false;
            if (statementFilters.objectCode !== 'all' && s.object_code !== statementFilters.objectCode) return false;
            if (statementFilters.objectName !== 'all' && s.object_name !== statementFilters.objectName) return false;

            if (statementFilters.startDate || statementFilters.endDate) {
                const date = parseDDMMYYYY(s.document_date);
                if (date) {
                    if (statementFilters.startDate) {
                        const start = new Date(statementFilters.startDate);
                        start.setHours(0,0,0,0);
                        if (date < start) return false;
                    }
                    if (statementFilters.endDate) {
                        const end = new Date(statementFilters.endDate);
                        end.setHours(23,59,59,999);
                        if (date > end) return false;
                    }
                }
            }
            return true;
        }) : [];
    }, [statements, statementFilters]);

    // Check if filters are active
    const isInvoiceFiltered = invoiceFilters.search !== '' || invoiceFilters.status !== 'all' || invoiceFilters.client !== 'all' || invoiceFilters.project !== 'all' || invoiceFilters.startDate !== '' || invoiceFilters.endDate !== '';
    const isStatementFiltered = statementFilters.search !== '' || statementFilters.status !== 'all' || statementFilters.objectCode !== 'all' || statementFilters.objectName !== 'all' || statementFilters.startDate !== '' || statementFilters.endDate !== '';

    const clearInvoiceFilters = () => setInvoiceFilters({ search: '', status: 'all', client: 'all', project: 'all', startDate: '', endDate: '' });
    const clearStatementFilters = () => setStatementFilters({ search: '', status: 'all', objectCode: 'all', objectName: 'all', startDate: '', endDate: '' });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[80vh]">
            <div className="p-6">
                {/* Header Tabs */}
                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 text-lg font-bold rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Quản lý ĐNTT
                    </button>
                    <button 
                        onClick={() => setViewMode('statement')}
                        className={`px-4 py-2 text-lg font-bold rounded-lg transition-colors ${viewMode === 'statement' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Sao kê
                    </button>
                </div>

                {viewMode === 'list' ? (
                    <>
                        {/* INVOICES View */}
                        <div className="flex justify-between items-center gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm hoá đơn (Mã)..." 
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white" 
                                    value={invoiceFilters.search}
                                    onChange={(e) => setInvoiceFilters(prev => ({...prev, search: e.target.value}))}
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                                    {filteredInvoices.length} hoá đơn
                                </div>
                                <button onClick={onAdd} className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200">Thêm hoá đơn</button>
                            </div>
                        </div>

                        {/* Invoice Filters */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="p-2"><Filter size={20} className="text-slate-900 dark:text-white" /></div>
                            
                            <div className="relative">
                                <select 
                                    className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                                    value={invoiceFilters.status}
                                    onChange={(e) => setInvoiceFilters(prev => ({...prev, status: e.target.value}))}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    {invoiceStatuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select 
                                    className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                                    value={invoiceFilters.client}
                                    onChange={(e) => setInvoiceFilters(prev => ({...prev, client: e.target.value}))}
                                >
                                    <option value="all">Tất cả khách hàng</option>
                                    {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select 
                                    className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                                    value={invoiceFilters.project}
                                    onChange={(e) => setInvoiceFilters(prev => ({...prev, project: e.target.value}))}
                                >
                                    <option value="all">Tất cả dự án</option>
                                    {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            
                            <div className="w-auto">
                                <DateRangePicker 
                                    startDate={invoiceFilters.startDate} 
                                    endDate={invoiceFilters.endDate} 
                                    onChange={(start, end) => setInvoiceFilters(prev => ({ ...prev, startDate: start, endDate: end }))} 
                                />
                            </div>

                            {isInvoiceFiltered && (
                                <button onClick={clearInvoiceFilters} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 animate-fade-in">Xoá bộ lọc</button>
                            )}
                            <div className="ml-auto"><button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Tải xuống</button></div>
                        </div>

                        {/* Invoice Table */}
                        <div className="overflow-x-auto">
                            {filteredInvoices.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 dark:text-slate-400">Không tìm thấy kết quả.</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700 text-xs">
                                        <tr>
                                            <th className="py-3 px-4 w-10"><input type="checkbox" className="rounded border-slate-300 dark:border-slate-600" /></th>
                                            <th className="py-3 px-4">Mã hoá đơn</th>
                                            <th className="py-3 px-4">Mã hợp đồng</th>
                                            <th className="py-3 px-4">Dự án</th>
                                            <th className="py-3 px-4">Khách hàng</th>
                                            <th className="py-3 px-4">Ngày xuất</th>
                                            <th className="py-3 px-4">Ngày đến hạn</th>
                                            <th className="py-3 px-4">Giá trị</th>
                                            <th className="py-3 px-4">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInvoices.map((i: Invoice) => {
                                            const contract = contracts?.find((c: Contract) => c.project_id === i.project_id && c.client_id === i.client_id); 
                                            const statusLabel = i.status_name || (i.status_id === 2 ? 'Đã gửi' : i.status_id === 3 ? 'Đã thanh toán' : i.status_id === 4 ? 'Quá hạn' : 'Đã tạo');
                                            
                                            return (
                                                <tr 
                                                    key={i.id} 
                                                    className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer group transition-colors"
                                                    onClick={() => onViewDetail(i)}
                                                >
                                                    <td className="py-4 px-4 w-10" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-slate-300 dark:border-slate-600" /></td>
                                                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">{i.invoice_no}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{contract?.code || 'MBA-C-001'}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{projects.find((p: Project) => p.id === i.project_id)?.name}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{clients.find((c: Client) => c.id === i.client_id)?.name}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{i.issue_date}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{i.due_date}</td>
                                                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">{i.total_amount.toLocaleString()} {i.currency}</td>
                                                    <td className="py-4 px-4"><StatusBadge type="invoice" status={i.status_id} label={statusLabel} /></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* STATEMENTS View */}
                        <div className="flex justify-between items-center gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm sao kê (Số CT)..." 
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white" 
                                    value={statementFilters.search}
                                    onChange={(e) => setStatementFilters(prev => ({...prev, search: e.target.value}))}
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                                    {filteredStatements.length} sao kê
                                </div>
                                <button onClick={() => {}} className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200">Thêm sao kê</button>
                            </div>
                        </div>

                        {/* Statement Filters */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="p-2"><Filter size={20} className="text-slate-900 dark:text-white" /></div>
                            
                            <div className="relative">
                                <select 
                                    className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                                    value={statementFilters.status}
                                    onChange={e => setStatementFilters(prev => ({...prev, status: e.target.value}))}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="Chưa duyệt">Chưa duyệt</option>
                                    <option value="Đã duyệt">Đã duyệt</option>
                                    <option value="Chưa xác định">Chưa xác định</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                                    value={statementFilters.objectCode}
                                    onChange={e => setStatementFilters(prev => ({...prev, objectCode: e.target.value}))}
                                >
                                    <option value="all">Tất cả mã đối tượng</option>
                                    {uniqueObjectCodes.map((code: any) => <option key={code} value={code}>{code}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
                                    value={statementFilters.objectName}
                                    onChange={e => setStatementFilters(prev => ({...prev, objectName: e.target.value}))}
                                >
                                    <option value="all">Tất cả tên đối tượng</option>
                                    {uniqueObjectNames.map((name: any) => <option key={name} value={name}>{name}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            
                            <div className="w-auto">
                                <DateRangePicker 
                                    startDate={statementFilters.startDate} 
                                    endDate={statementFilters.endDate} 
                                    onChange={(start, end) => setStatementFilters(prev => ({ ...prev, startDate: start, endDate: end }))} 
                                />
                            </div>

                            {isStatementFiltered && (
                                <button onClick={clearStatementFilters} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 animate-fade-in">Xoá bộ lọc</button>
                            )}
                            <div className="ml-auto"><button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Tải xuống</button></div>
                        </div>

                        {/* Statement Table */}
                        <div className="overflow-x-auto">
                            {filteredStatements.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 dark:text-slate-400">Không tìm thấy kết quả.</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700 text-xs">
                                        <tr>
                                            <th className="py-3 px-4">Ngày chứng từ</th>
                                            <th className="py-3 px-4">Số chứng từ</th>
                                            <th className="py-3 px-4">Mã đối tượng</th>
                                            <th className="py-3 px-4">Tên đối tượng</th>
                                            <th className="py-3 px-4">Số tiền</th>
                                            <th className="py-3 px-4">Hoá đơn</th>
                                            <th className="py-3 px-4">Giá trị hoá đơn</th>
                                            <th className="py-3 px-4">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStatements.map((s: BankStatement) => {
                                            const relatedInvoice = data.find((i: Invoice) => i.id === s.invoice_id);
                                            return (
                                                <tr key={s.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{s.document_date}</td>
                                                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">{s.document_no}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{s.object_code}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{s.object_name}</td>
                                                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">{s.amount.toLocaleString()} {s.currency}</td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                                                        {relatedInvoice ? relatedInvoice.invoice_no : '-'}
                                                    </td>
                                                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                                                        {relatedInvoice ? relatedInvoice.total_amount.toLocaleString() : '-'}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <select 
                                                            className={`text-xs font-medium rounded-full px-2 py-1 border-none focus:outline-none cursor-pointer ${
                                                                s.status === 'Đã duyệt' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' :
                                                                s.status === 'Chưa duyệt' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                                                                'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                                                            }`}
                                                            value={s.status}
                                                            onChange={(e) => { e.stopPropagation(); /* Handle status change */}}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <option value="Chưa duyệt">Chưa duyệt</option>
                                                            <option value="Đã duyệt">Đã duyệt</option>
                                                            <option value="Chưa xác định">Chưa xác định</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                <div className="mt-auto p-6 flex justify-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronDown className="rotate-90 text-slate-600 dark:text-slate-400" size={14}/></button>
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-black dark:bg-white text-white dark:text-black text-xs">1</button>
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400">2</button>
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400">10</button>
                    <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronRight size={14} className="text-slate-600 dark:text-slate-400"/></button>
                </div>
            </div>
        </div>
    );
};
