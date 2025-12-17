
import React, { useState } from 'react';
import { User } from '../types';
import { FormHeader, FilterBar } from './Shared';

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
