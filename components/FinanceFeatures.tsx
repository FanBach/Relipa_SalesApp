import React, { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Invoice, RevenueAllocation, Project, Client, User } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';

export const InvoiceForm = ({ initialData, projects, clients, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Invoice>>(initialData || {
        invoice_no: `INV-${Math.floor(Math.random() * 1000)}`,
        project_id: projects[0]?.id,
        client_id: clients[0]?.id,
        issue_date: '',
        due_date: '',
        total_amount: 0,
        currency: 'USD',
        status_id: 1 // Draft
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-8 rounded-xl min-h-screen">
            <FormHeader title={initialData ? "Sửa hoá đơn" : "Thêm hoá đơn"} onBack={onBack} onSave={() => onSave(formData)} />
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Số hoá đơn *</label>
                    <input type="text" value={formData.invoice_no} readOnly className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Dự án *</label>
                    <select value={formData.project_id} onChange={e => handleChange('project_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                         {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Khách hàng *</label>
                    <select value={formData.client_id} onChange={e => handleChange('client_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                         {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Tổng tiền *</label>
                    <div className="flex gap-2">
                         <input type="number" value={formData.total_amount} onChange={e => handleChange('total_amount', Number(e.target.value))} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm" />
                         <select value={formData.currency} onChange={e => handleChange('currency', e.target.value)} className="w-20 p-2 border border-slate-200 rounded-lg text-sm"><option>USD</option><option>JPY</option><option>VND</option></select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Ngày phát hành</label>
                    <input type="date" value={formData.issue_date} onChange={e => handleChange('issue_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Hạn thanh toán</label>
                    <input type="date" value={formData.due_date} onChange={e => handleChange('due_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Trạng thái</label>
                    <select value={formData.status_id} onChange={e => handleChange('status_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        <option value={1}>Draft</option>
                        <option value={2}>Chờ thanh toán</option>
                        <option value={3}>Đã thanh toán</option>
                        <option value={4}>Quá hạn</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export const InvoicesModule = ({ data, projects, clients, onAdd, onEdit, onDelete }: any) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý thanh toán</h2>
                <FilterBar 
                    placeholder="Tìm kiếm hoá đơn..." 
                    onAdd={onAdd} 
                    addLabel="Thêm hoá đơn" 
                    filters={{items: ['Trạng thái', 'Khách hàng', 'Thời gian', 'Xoá bộ lọc']}}
                />
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                            <th className="py-4">Số hoá đơn</th>
                            <th className="py-4">Dự án</th>
                            <th className="py-4">Khách hàng</th>
                            <th className="py-4">Ngày phát hành</th>
                            <th className="py-4">Hạn thanh toán</th>
                            <th className="py-4">Tổng tiền</th>
                            <th className="py-4">Trạng thái</th>
                            <th className="py-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((i: Invoice) => (
                            <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="py-4 font-medium">{i.invoice_no}</td>
                                <td className="py-4 text-slate-600">{projects.find((p: Project) => p.id === i.project_id)?.name}</td>
                                <td className="py-4 text-slate-600">{clients.find((c: Client) => c.id === i.client_id)?.name}</td>
                                <td className="py-4 text-slate-600">{i.issue_date}</td>
                                <td className="py-4 text-slate-600">{i.due_date}</td>
                                <td className="py-4 font-medium">{i.total_amount.toLocaleString()} {i.currency}</td>
                                <td className="py-4"><StatusBadge type="invoice" status={i.status_id} /></td>
                                <td className="py-4 flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(i); }} className="text-blue-600 hover:text-blue-800"><Edit3 size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(i.id); }} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const RevenueForm = ({ initialData, invoices, users, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<RevenueAllocation>>(initialData || {
        invoice_id: invoices[0]?.id,
        sales_user_id: users[0]?.id,
        revenue_amount: 0,
        percent_of_invoice: 100,
        allocation_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
         <div className="bg-white p-8 rounded-xl min-h-screen">
             <FormHeader title={initialData ? "Sửa ghi nhận doanh thu" : "Thêm ghi nhận doanh thu"} onBack={onBack} onSave={() => onSave(formData)} />
             <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Hoá đơn *</label>
                    <select value={formData.invoice_id} onChange={e => handleChange('invoice_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        {invoices.map((i: Invoice) => <option key={i.id} value={i.id}>{i.invoice_no} - {i.total_amount}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Salesman hưởng *</label>
                    <select value={formData.sales_user_id} onChange={e => handleChange('sales_user_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        {users.map((u: User) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Số tiền ghi nhận</label>
                     <input type="number" value={formData.revenue_amount} onChange={e => handleChange('revenue_amount', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">% trên hoá đơn</label>
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
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý doanh thu</h2>
                <FilterBar 
                    placeholder="Tìm kiếm..." 
                    onAdd={onAdd} 
                    addLabel="Ghi nhận doanh thu" 
                    filters={{items: ['Salesman', 'Thời gian', 'Xoá bộ lọc']}}
                />
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                            <th className="py-4">Mã hoá đơn</th>
                            <th className="py-4">Salesman</th>
                            <th className="py-4">Doanh thu ghi nhận</th>
                            <th className="py-4">% Hoá đơn</th>
                            <th className="py-4">Ngày ghi nhận</th>
                            <th className="py-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((r: RevenueAllocation) => (
                            <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="py-4 text-indigo-600 font-medium">{invoices.find((i: Invoice) => i.id === r.invoice_id)?.invoice_no}</td>
                                <td className="py-4 text-slate-600">{users.find((u: User) => u.id === r.sales_user_id)?.full_name}</td>
                                <td className="py-4 font-bold text-slate-800">{r.revenue_amount.toLocaleString()}</td>
                                <td className="py-4 text-slate-600">{r.percent_of_invoice}%</td>
                                <td className="py-4 text-slate-600">{r.allocation_date}</td>
                                <td className="py-4 flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(r); }} className="text-blue-600 hover:text-blue-800"><Edit3 size={16} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};