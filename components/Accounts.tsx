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
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl min-h-[350px] flex flex-col relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                
                {/* Nút Đóng (#5) */}
                <button 
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-1 border-2 border-black rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                        Bạn có chắc chắn muốn xoá tài khoản này không?
                    </h2>
                    
                    {/* Email tài khoản (#2) */}
                    <p className="text-xl text-slate-600 mb-12 font-medium italic">{user.email}</p>

                    <div className="flex gap-6 w-full max-w-md justify-center">
                        {/* Nút Huỷ (#3) */}
                        <button 
                            onClick={onCancel}
                            className="flex-1 px-8 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-400 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            Huỷ
                        </button>
                        
                        {/* Nút Xoá (#4) */}
                        <button 
                            onClick={onConfirm}
                            className="flex-1 px-8 py-3.5 bg-black text-white rounded-2xl text-base font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
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
            const isDuplicated = allUsers.some((u: User) => 
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
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl min-h-[500px] flex flex-col relative animate-fade-in-up">
                {/* Nút Đóng (#7) */}
                <button 
                    onClick={onBack}
                    className="absolute top-8 right-8 p-1 border-2 border-black rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>

                <div className="p-12 flex-1 flex flex-col">
                    <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">Thông tin tài khoản</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto w-full">
                        {/* Tên tài khoản (#3) */}
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-slate-900 ml-1">Tên tài khoản *</label>
                            <input 
                                type="text" 
                                value={formData.full_name} 
                                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl text-base focus:outline-none transition-all placeholder:text-slate-300 ${errors.full_name ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-black'}`}
                                placeholder="Nhập tên tài khoản"
                            />
                            {errors.full_name && (
                                <p className="absolute -bottom-6 left-1 text-[10px] text-red-500 font-medium flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.full_name}
                                </p>
                            )}
                        </div>

                        {/* Địa chỉ email (#4) */}
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-slate-900 ml-1">Địa chỉ email *</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                className={`w-full px-5 py-3.5 border-2 rounded-2xl text-base focus:outline-none transition-all placeholder:text-slate-300 ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-black'}`}
                                placeholder="someone@example.com"
                            />
                            {errors.email && (
                                <p className="absolute -bottom-6 left-1 text-[10px] text-red-500 font-medium flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Vai trò (#5) */}
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-slate-900 ml-1">Vai trò *</label>
                            <div className="relative">
                                <select 
                                    value={formData.role_main} 
                                    onChange={e => setFormData({...formData, role_main: e.target.value})} 
                                    className={`w-full px-5 py-3.5 border-2 rounded-2xl text-base focus:outline-none bg-white appearance-none cursor-pointer transition-all ${errors.role_main ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-black'} ${!formData.role_main ? 'text-slate-300' : 'text-slate-900'}`}
                                >
                                    <option value="" disabled>Chọn vai trò</option>
                                    {roles.map(r => <option key={r} value={r} className="text-slate-900">{r}</option>)}
                                </select>
                                <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {errors.role_main && (
                                <p className="absolute -bottom-6 left-1 text-[10px] text-red-500 font-medium flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.role_main}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Nút Lưu (#6) */}
                    <div className="mt-auto pt-16 flex justify-center">
                        <button 
                            onClick={handleSave}
                            className="bg-black text-white px-20 py-4 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 duration-200"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AccountsModule = ({ data, permissions, currentUser, onAdd, onEdit, onDelete }: AccountsModuleProps) => {
    const isAuthorized = currentUser.role_main === 'Super Admin';
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Quản lý trạng thái xóa
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const availableRoles = useMemo(() => {
        const sysRoles = Array.from(new Set(permissions.map(p => p.role)));
        return sysRoles.length > 0 ? sysRoles : ['Super Admin', 'Sale Admin', 'Saleman', 'Account', 'Sale Manager'];
    }, [permissions]);

    const filteredData = useMemo(() => {
        return data.filter(u => {
            const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role_main === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [data, searchTerm, roleFilter]);

    const itemsPerPage = 20;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredData, currentPage]);

    // Xử lý mở Modal xóa
    const handleDeleteClick = (e: React.MouseEvent, user: User) => {
        e.preventDefault();
        e.stopPropagation(); // QUAN TRỌNG: Ngăn chặn click vào row để mở Edit
        
        if (!isAuthorized) {
            alert("Chỉ Super Admin mới có quyền xóa tài khoản.");
            return;
        }
        
        // Theo Spec: Disable với các tài khoản Super Admin (không cho xóa chính mình hoặc admin khác)
        if (user.role_main === 'Super Admin') {
            alert("Không thể xóa tài khoản có vai trò Super Admin.");
            return;
        }

        setUserToDelete(user);
    };

    // Xử lý xác nhận xóa thực sự
    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDelete(userToDelete.id);
            setUserToDelete(null);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center gap-4">
                <AlertCircle className="text-red-500 w-12 h-12" />
                <p className="text-red-600 font-bold text-lg">Tài khoản của bạn chưa được cấp quyền quản lý (Super Admin).</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh] flex flex-col animate-fade-in relative">
            
            {/* Modal xác nhận xóa */}
            {userToDelete && (
                <DeleteAccountModal 
                    user={userToDelete} 
                    onCancel={() => setUserToDelete(null)} 
                    onConfirm={handleConfirmDelete} 
                />
            )}

            <div className="p-8 flex-1">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Quản lý tài khoản</h2>
                
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="relative flex-1 min-w-[300px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tài khoản ..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="px-5 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold">
                        {filteredData.length} tài khoản
                    </div>

                    <div className="relative min-w-[180px]">
                        <select 
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-full text-sm text-slate-700 font-medium focus:outline-none cursor-pointer hover:border-slate-400 transition-colors"
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">Tất cả vai trò</option>
                            {availableRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <button 
                        onClick={onAdd}
                        className="ml-auto bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                    >
                        Thêm tài khoản
                    </button>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="text-slate-900 font-bold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="py-4 px-2">Tên tài khoản</th>
                                <th className="py-4 px-2">Email</th>
                                <th className="py-4 px-2 text-center">Vai trò</th>
                                <th className="py-4 px-2">Tạo lúc</th>
                                <th className="py-4 px-2">Cập nhật lần cuối</th>
                                <th className="py-4 w-24"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((user) => {
                                    const isSuper = user.role_main === 'Super Admin';
                                    return (
                                        <tr 
                                            key={user.id} 
                                            className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer group transition-colors"
                                            onClick={() => onEdit(user)}
                                        >
                                            <td className="py-5 px-2 text-sm font-semibold text-slate-900">{user.full_name}</td>
                                            <td className="py-5 px-2 text-sm text-slate-500">{user.email}</td>
                                            <td className="py-5 px-2 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isSuper ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    {user.role_main}
                                                </span>
                                            </td>
                                            <td className="py-5 px-2 text-sm text-slate-400">{user.created_at || '10:00 AM, 21/05/2025'}</td>
                                            <td className="py-5 px-2 text-sm text-slate-400">{user.updated_at || '10:00 AM, 21/05/2025'}</td>
                                            <td className="py-5 text-right px-2">
                                                <button 
                                                    onClick={(e) => handleDeleteClick(e, user)}
                                                    disabled={isSuper}
                                                    className={`px-5 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                                                        isSuper 
                                                        ? 'border-slate-100 text-slate-200 cursor-not-allowed opacity-50' 
                                                        : 'border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                                                    }`}
                                                >
                                                    Xoá
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Search size={40} className="opacity-20" />
                                            <p className="font-bold text-lg uppercase tracking-wider">Không tìm thấy tài khoản nào phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="p-8 border-t border-slate-100 flex justify-center items-center gap-3">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ChevronDown className="rotate-90 text-slate-600" size={18} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-11 h-11 rounded-xl text-sm font-bold transition-all border ${
                                currentPage === page 
                                ? 'bg-black text-white border-black shadow-lg scale-105' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ChevronRight className="text-slate-600" size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};
