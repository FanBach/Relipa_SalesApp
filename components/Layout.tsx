
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FileText, FileBarChart, PieChart, Calculator, User as UserIcon, Settings, LogOut, Menu, Search, Bell, ArrowLeft, Sun, Moon, ShieldCheck } from 'lucide-react';
import { User } from '../types';

export const Header = ({ setSidebarOpen, unreadCount, darkMode, toggleDarkMode }: any) => {
    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 z-20 relative transition-colors">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Thanh tìm kiếm đã được loại bỏ tại đây theo yêu cầu */}
          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <button 
                onClick={toggleDarkMode} 
                className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to="/notifications" className="relative p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              )}
            </Link>
          </div>
        </header>
    )
}

export const Sidebar = ({ isOpen, currentUser }: { isOpen: boolean, currentUser: User }) => {
  const location = useLocation();
  const isSuperAdmin = currentUser.role_main === 'Super Admin';

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Khách hàng", path: "/clients" },
    { icon: Briefcase, label: "Dự án", path: "/projects" },
    { icon: FileText, label: "Hợp đồng", path: "/contracts" },
    { icon: FileBarChart, label: "Thanh toán", path: "/invoices" },
    { icon: PieChart, label: "Doanh thu", path: "/revenue" },
    { icon: Calculator, label: "Công số", path: "/workforce" },
  ];

  const settingsItems = [
      ...(isSuperAdmin ? [{ icon: UserIcon, label: "Tài khoản", path: "/accounts" }] : []),
      { icon: ShieldCheck, label: "Phân quyền", path: "/permissions" },
      { icon: Settings, label: "Master", path: "/settings" } 
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none dark:text-white">Relipa</h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Sales Management</p>
                </div>
            </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-64px-80px)]">
            <div className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quản lý</div>
            <nav className="space-y-1 px-4">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === item.path 
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                    >
                        <item.icon size={18} strokeWidth={2} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="px-6 py-4 mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cài đặt</div>
            <nav className="space-y-1 px-4 pb-8">
                {settingsItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === item.path 
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                    >
                        <item.icon size={18} strokeWidth={2} />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white font-bold">
                    {currentUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                 </div>
                 <div className="flex-1 overflow-hidden">
                     <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{currentUser.full_name}</p>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.role_main}</p>
                 </div>
                 <LogOut size={18} className="text-slate-400 cursor-pointer hover:text-red-500 dark:hover:text-red-400" />
             </div>
        </div>
    </div>
  );
};

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
    const [step, setStep] = useState<'landing' | 'microsoft'>('landing');

    if (step === 'landing') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-white p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-white to-white z-0"></div>
                
                <div className="z-10 max-w-md w-full flex flex-col items-center text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold mb-3 text-slate-900 tracking-tight">Relipa</h1>
                    <p className="text-lg text-slate-500 mb-12">Sales Management System</p>
                    
                    <button 
                        onClick={() => setStep('microsoft')}
                        className="w-full bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-[2px]">
                                <div className="w-2 h-2 bg-white/90"></div>
                                <div className="w-2 h-2 bg-white/90"></div>
                                <div className="w-2 h-2 bg-white/90"></div>
                                <div className="w-2 h-2 bg-white/90"></div>
                            </div>
                        </div>
                        <span className="text-lg">Đăng nhập với Microsoft</span>
                    </button>
                    <p className="mt-8 text-xs text-slate-400">© 2024 Relipa. All rights reserved.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex flex-1 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-slate-800 to-black opacity-50"></div>
                <div className="z-10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                    </div>
                    <span className="font-bold text-xl">Relipa</span>
                </div>
                <div className="z-10 max-w-md">
                     <h2 className="text-4xl font-bold mb-6">Quản lý hiệu quả.<br/>Tăng trưởng bền vững.</h2>
                     <p className="text-slate-400 leading-relaxed">Hệ thống quản lý bán hàng tập trung giúp tối ưu hoá quy trình, theo dõi doanh thu và công số một cách chính xác nhất.</p>
                </div>
                <div className="z-10 text-xs text-slate-500">Sales Management System v2.0</div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-white p-8 animate-slide-in-right">
                <div className="w-full max-w-md relative">
                     <button onClick={() => setStep('landing')} className="absolute -top-16 lg:-top-0 lg:-left-16 text-slate-400 hover:text-slate-900 transition-colors p-2">
                         <ArrowLeft size={24} />
                     </button>
                     
                     <div className="mb-10">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="grid grid-cols-2 gap-[1px]">
                                 <div className="w-2.5 h-2.5 bg-[#f25022]"></div>
                                 <div className="w-2.5 h-2.5 bg-[#7fba00]"></div>
                                 <div className="w-2.5 h-2.5 bg-[#00a4ef]"></div>
                                 <div className="w-2.5 h-2.5 bg-[#ffb900]"></div>
                             </div>
                             <span className="font-semibold text-slate-500 text-lg">Microsoft</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900">Đăng nhập</h3>
                     </div>
                     
                     <div className="space-y-6">
                        <input type="email" placeholder="Email, điện thoại hoặc Skype" className="w-full border-b-2 border-slate-200 pb-3 text-lg focus:outline-none focus:border-[#0067b8] transition-colors placeholder:text-slate-400" />
                        
                        <p className="text-sm text-slate-600">
                             Không có tài khoản? <span className="text-[#0067b8] hover:underline cursor-pointer">Tạo tài khoản!</span>
                        </p>
                        
                        <div className="flex justify-end pt-4">
                             <button onClick={onLogin} className="bg-[#0067b8] text-white px-8 py-3 rounded-sm text-sm font-bold hover:bg-[#005da6] transition-colors shadow-sm w-32">
                                Tiếp theo
                             </button>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};
