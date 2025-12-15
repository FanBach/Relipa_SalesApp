import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, CheckSquare, Square, MinusCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { User, Permission, MasterCategory, Project, Client, MonthlyData, Notification } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';

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

export const LogWorkforceForm = ({ onBack }: any) => (
    <div className="bg-white p-8 rounded-xl min-h-screen flex gap-8">
        <div className="flex-1">
             <FormHeader title="Log công số thực tế" onBack={onBack} onSave={onBack} />
             <div className="grid grid-cols-2 gap-6 mb-8 max-w-xl">
                 <div className="space-y-1">
                     <label className="text-sm font-medium">Bộ phận</label>
                     <select className="w-full p-2 border rounded-lg text-sm"><option>Division 1</option></select>
                 </div>
                 <div className="space-y-1">
                     <label className="text-sm font-medium">Năm</label>
                     <select className="w-full p-2 border rounded-lg text-sm"><option>2025</option></select>
                 </div>
             </div>
             <div className="grid grid-cols-2 gap-4 max-w-2xl">
                 {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                     <div key={m} className="space-y-1">
                        <label className="text-sm text-slate-600">Man-month tháng {m} *</label>
                        <input type="number" className="w-full p-2 border rounded-lg text-sm" placeholder="0" />
                     </div>
                 ))}
             </div>
        </div>
        <div className="w-80 border rounded-xl p-4 bg-slate-50">
            <h3 className="font-bold mb-4">Lịch sử thay đổi</h3>
            <div className="space-y-4">
                <div className="bg-white p-3 rounded border shadow-sm text-sm">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">Tạo mới</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</p>
                </div>
            </div>
        </div>
    </div>
);

export const WorkforceModule = ({ projects, clients, monthlyData, onLog }: any) => {
    // Sample chart data
    const chartData = [
        { name: 'Jan', plan: 10, actual: 8 },
        { name: 'Feb', plan: 12, actual: 11 },
        { name: 'Mar', plan: 15, actual: 16 },
        { name: 'Apr', plan: 10, actual: 10 },
        { name: 'May', plan: 8, actual: 8 },
        { name: 'Jun', plan: 10, actual: 9 },
    ];

    const getMonthlyValue = (projectId: number, month: number, type: 'plan' | 'actual') => {
        return monthlyData.find((d: MonthlyData) => d.projectId === projectId && d.month === month && d.type === type)?.value || '-';
    };

    return (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý công số</h2>
                <FilterBar 
                    placeholder="Tìm kiếm dự án hoặc khách hàng..." 
                    onAdd={() => {}}
                    addLabel=""
                    filters={{items: ['Năm', 'Bộ phận', 'Trạng thái', 'Xoá bộ lọc']}}
                    extraButtons={
                        <button onClick={onLog} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
                            Log công số
                        </button>
                    }
                />

                <div className="h-64 border rounded-xl p-4 mb-6 bg-slate-50 relative">
                    <p className="font-bold text-sm mb-2">Công số tháng</p>
                    <ResponsiveContainer width="100%" height="90%" minWidth={0}>
                         <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="actual" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
                            <Area type="monotone" dataKey="plan" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                            <tr>
                                <th className="py-4 px-2">Mã KH</th>
                                <th className="py-4 px-2">Tên khách hàng</th>
                                <th className="py-4 px-2">Dự án</th>
                                <th className="py-4 px-2">Bộ phận</th>
                                <th className="py-4 px-2">Trạng thái</th>
                                <th className="py-4 px-2">Loại</th>
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <th key={m} className="py-4 px-2">Tháng {m}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p: Project) => {
                                const clientName = clients.find((c: Client) => c.id === p.client_id)?.name;
                                return (
                                    <React.Fragment key={p.id}>
                                        <tr className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="py-3 px-2 text-slate-600" rowSpan={2}>FPT-001</td>
                                            <td className="py-3 px-2 font-medium" rowSpan={2}>{clientName}</td>
                                            <td className="py-3 px-2 text-slate-600" rowSpan={2}>{p.name}</td>
                                            <td className="py-3 px-2 text-slate-600" rowSpan={2}>{p.division}</td>
                                            <td className="py-3 px-2" rowSpan={2}><StatusBadge type="generic" status="Đã ký" /></td>
                                            <td className="py-3 px-2 font-medium text-slate-500">Plan</td>
                                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <td key={m} className="py-3 px-2 text-center text-slate-600">{getMonthlyValue(p.id, m, 'plan')}</td>)}
                                        </tr>
                                        <tr className="border-b border-slate-100 hover:bg-slate-50 bg-slate-50/50">
                                            <td className="py-3 px-2 font-medium text-indigo-600">Actual</td>
                                             {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <td key={m} className="py-3 px-2 text-center font-medium text-slate-800">{getMonthlyValue(p.id, m, 'actual')}</td>)}
                                        </tr>
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
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