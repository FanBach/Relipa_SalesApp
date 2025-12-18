import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, CheckSquare, Square, MinusCircle, Search, Filter, ChevronDown, Calendar as CalendarIcon, Download, RotateCcw } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { User, Permission, MasterCategory, Project, Client, MonthlyData, Notification, Contract } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';
import { getMockData } from '../services/mockData';
import { useNavigate } from 'react-router-dom';

// Component này chỉ giữ lại các logic về Phân quyền và Master nếu cần, 
// nhưng để sạch sẽ, các phần Quản lý Tài khoản đã được chuyển sang Accounts.tsx.
// Dưới đây là các component System liên quan khác.

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