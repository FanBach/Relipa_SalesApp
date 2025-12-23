
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, X, AlertCircle } from 'lucide-react';
import { User, Permission } from '../types';

interface AccountsModuleProps {
    data: User[];
    permissions: Permission[];
    currentUser: User;
    onAdd: () => void;
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
}

// Popup xác nhận xoá tài khoản (S009 - Accounts - Remove)
export const DeleteAccountModal = ({ user, onCancel, onConfirm }: { user: User, onCancel: () => void, onConfirm: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl w-full max-w-2xl min-h-[350px] flex flex-col relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                
                {/* Nút Đóng (#5) */}
                <button 
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-1 border-2 border-black dark:border-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors dark:text-white"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        Bạn có chắc chắn muốn xoá tài khoản này không?
                    </h2>
                    
                    {/* Email tài khoản (#2) */}
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 font-medium italic">{user.email}</p>

                    <div className="flex gap-6 w-full max-w-md justify-center">
                        {/* Nút Huỷ (#3) */}
                        <button 
                            onClick={onCancel}
                            className="flex-1 px-8 py-3.5 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-base font-bold text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            Huỷ
                        </button>
                        
                        {/* Nút Xoá (#4) */}
                        <button 
                            onClick={onConfirm}
                            className="flex-1 px-8 py-3.5 bg-black dark:bg-white dark:text-black text-white rounded-2xl text-base font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg active:scale-95"
                        >
                            Xoá
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AccountForm = ({ initialData, onBack, onSave, permissions, currentUser, allUsers }: any) => {
    // Logic check quyền của người đang thao tác
    const isSuperAdmin = currentUser.role_main === 'Super Admin';
    const roles = useMemo(() => {
        const sysRoles = Array.from(new Set(permissions.map((p: Permission) => p.role))) as string[];
        // Đảm bảo luôn có các role cơ bản nếu list permission trống
        return sysRoles.length > 0 ? sysRoles : ['Super Admin', 'Sale Admin', 'Saleman', 'Account', 'Sale Manager'];
    }, [permissions]);
    
    const [formData, setFormData] = useState<Partial<User>>(initialData || {
        full_name: '',
        email: '',
        role_main: '',
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        // Kiểm tra quyền (EX008)
        if (!isSuperAdmin) {
            alert("Bạn cần quyền Super Admin để thực hiện thao tác này.");
            return false;
        }

        // Tên tài khoản (EX001, EX002)
        if (!formData.full_name?.trim()) {
            newErrors.full_name = "Tên tài khoản không được để trống";
        } else if (formData.full_name.length > 100) {
            newErrors.full_name = "Tên tài khoản không được vượt quá 100 ký tự";
        }

        // Email (Cho phép mọi domain - Cập nhật theo yêu cầu mới)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email?.trim()) {
            newErrors.email = "Địa chỉ email không được để trống";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Địa chỉ email không đúng định dạng (VD: name@domain.com)";
        } else {
            // Kiểm tra trùng lặp email (EX005)
            const isDuplicated = allUsers?.some((u: User) => 
                u.email.toLowerCase() === formData.email?.toLowerCase() && 
                u.id !== initialData?.id
            );
            if (isDuplicated) newErrors.email = "Email này đã tồn tại trong hệ thống";
        }

        // Vai trò (EX006)
        if (!formData.role_main) {
            newErrors.role_main = "Vui lòng chọn vai trò";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl w-full max-w-4xl min-h-[500px] flex flex-col relative animate-fade-in-up">
                <button onClick={onBack} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10 text-slate-900 dark:text-white"><X size={24} /></button>
                
                <div className="p-10 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{initialData?.id ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
                </div>
                
                <div className="p-10 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">Tên hiển thị <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white transition-all bg-white dark:bg-slate-700 dark:text-white ${errors.full_name ? 'border-red-500' : ''}`}
                                placeholder="Nhập tên hiển thị"
                                value={formData.full_name}
                                onChange={e => setFormData({...formData, full_name: e.target.value})}
                            />
                            {errors.full_name && <p className="text-xs text-red-500 font-bold ml-1">{errors.full_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">Email <span className="text-red-500">*</span></label>
                            <input 
                                type="email" 
                                className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none focus:border-black dark:focus:border-white transition-all bg-white dark:bg-slate-700 dark:text-white ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="name@domain.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                            {errors.email && <p className="text-xs text-red-500 font-bold ml-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">Vai trò <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select 
                                    className={`w-full p-4 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-base outline-none bg-white dark:bg-slate-700 dark:text-white appearance-none focus:border-black dark:focus:border-white transition-all ${errors.role_main ? 'border-red-500' : ''}`}
                                    value={formData.role_main}
                                    onChange={e => setFormData({...formData, role_main: e.target.value})}
                                >
                                    <option value="" disabled>Chọn vai trò</option>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                            {errors.role_main && <p className="text-xs text-red-500 font-bold ml-1">{errors.role_main}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-900 dark:text-white">Trạng thái</label>
                            <div className="flex items-center gap-4 p-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_active ? 'border-black dark:border-white' : 'border-slate-200 dark:border-slate-600'}`}>
                                        {formData.is_active && <div className="w-3 h-3 bg-black dark:bg-white rounded-full" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={!!formData.is_active} onChange={() => setFormData({...formData, is_active: true})} />
                                    <span className={`text-base font-medium ${formData.is_active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Hoạt động</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!formData.is_active ? 'border-black dark:border-white' : 'border-slate-200 dark:border-slate-600'}`}>
                                        {!formData.is_active && <div className="w-3 h-3 bg-black dark:bg-white rounded-full" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={!formData.is_active} onChange={() => setFormData({...formData, is_active: false})} />
                                    <span className={`text-base font-medium ${!formData.is_active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Vô hiệu hoá</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
                    <button onClick={onBack} className="px-8 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Huỷ</button>
                    <button onClick={handleSave} className="px-10 py-3 rounded-2xl bg-black dark:bg-white dark:text-black text-white font-bold hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg active:scale-95 transition-all">Lưu tài khoản</button>
                </div>
            </div>
        </div>
    );
};

export const AccountsModule = ({ data, permissions, currentUser, onAdd, onEdit, onDelete }: AccountsModuleProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    
    const roles = useMemo(() => {
        const sysRoles = Array.from(new Set(permissions.map(p => p.role)));
        return sysRoles.length > 0 ? sysRoles : ['Super Admin', 'Sale Admin', 'Saleman', 'Account', 'Sale Manager'];
    }, [permissions]);

    const filteredData = data.filter(u => {
        const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role_main === roleFilter;
        return matchesSearch && matchesRole;
    });

    const isSuperAdmin = currentUser.role_main === 'Super Admin';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 min-h-[80vh] p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý tài khoản</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Danh sách nhân sự và phân quyền truy cập hệ thống</p>
                </div>
                <button 
                    onClick={onAdd}
                    className={`px-8 py-3 bg-black dark:bg-white dark:text-black text-white rounded-2xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg flex items-center gap-2 ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isSuperAdmin}
                >
                    <span className="text-xl leading-none">+</span> Thêm tài khoản
                </button>
            </div>

            <div className="flex justify-between items-center mb-8 gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..." 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-sm font-medium focus:border-black dark:focus:border-white dark:text-white outline-none transition-all placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <select 
                            className="appearance-none pl-5 pr-10 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-600 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:border-black dark:focus:border-white outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">Tất cả vai trò</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-100 dark:border-slate-700">
                            <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tên hiển thị</th>
                            <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email</th>
                            <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vai trò</th>
                            <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái</th>
                            <th className="py-4 px-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((user) => (
                            <tr key={user.id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <td className="py-5 px-4">
                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{user.full_name}</div>
                                </td>
                                <td className="py-5 px-4">
                                    <div className="font-medium text-slate-500 dark:text-slate-400 text-sm">{user.email}</div>
                                </td>
                                <td className="py-5 px-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                                        {user.role_main}
                                    </span>
                                </td>
                                <td className="py-5 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                        <span className={`text-sm font-bold ${user.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onEdit(user)}
                                            className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm"
                                            disabled={!isSuperAdmin}
                                        >
                                            Sửa
                                        </button>
                                        <button 
                                            onClick={() => onDelete(user.id)}
                                            className="px-4 py-2 border-2 border-slate-100 dark:border-slate-600 text-slate-400 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900 transition-all"
                                            disabled={!isSuperAdmin}
                                        >
                                            Xoá
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                        <AlertCircle size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">Không tìm thấy tài khoản nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};
