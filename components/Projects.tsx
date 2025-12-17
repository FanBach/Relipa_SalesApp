
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Search, Filter, Calendar as CalendarIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Project, Client, Contract } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';
import { getMockData } from '../services/mockData';

export const ProjectForm = ({ initialData, clients, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Project>>(initialData || {
        code: `PRJ-${Math.floor(Math.random() * 1000)}`,
        name: '',
        client_id: clients[0]?.id,
        technology: 'Web',
        division: 'Division 1',
        start_date: '',
        end_date: '',
        status_id: 2,
        description: ''
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-8 rounded-xl min-h-screen">
           <FormHeader title={initialData ? "Sửa dự án" : "Thêm dự án"} onBack={onBack} onSave={() => onSave(formData)} />
           <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Khách hàng *</label>
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    value={formData.client_id}
                    onChange={e => handleChange('client_id', Number(e.target.value))}
                  >
                      {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Tên dự án *</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Công nghệ *</label>
                  <select value={formData.technology} onChange={e => handleChange('technology', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                      <option>Web</option><option>Mobile</option><option>Blockchain</option><option>AI</option>
                  </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900">Mã dự án *</label>
                <input type="text" value={formData.code} readOnly className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
            </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Bộ phận phát triển</label>
                  <select value={formData.division} onChange={e => handleChange('division', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm"><option>Division 1</option><option>Division 2</option></select>
              </div>
              <div className="row-span-3 space-y-1">
                   <label className="text-sm font-medium text-slate-900">Mô tả</label>
                   <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm h-full"></textarea>
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Ngày bắt đầu *</label>
                  <input type="date" value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Ngày kết thúc *</label>
                  <input type="date" value={formData.end_date} onChange={e => handleChange('end_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
           </div>
        </div>
    );
};

export const ProjectsModule = ({ data, clients, masterData, onAdd, onEdit, onDelete, onViewDetail }: any) => {
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        technology: 'all',
        division: 'all',
        startDate: '',
        endDate: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const parseDate = (dateStr: string) => {
        const [d, m, y] = dateStr.split('/');
        return new Date(Number(y), Number(m) - 1, Number(d));
    };

    const getProjectStatus = (p: Project) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const start = parseDate(p.start_date);
        const end = parseDate(p.end_date);
        if (start > now) return "Chưa thực hiện";
        if (end < now) return "Đã hoàn thành";
        return "Đang thực hiện";
    };

    const clearFilters = () => {
        setFilters({ search: '', status: 'all', technology: 'all', division: 'all', startDate: '', endDate: '' });
    };

    const filteredData = data.filter((p: Project) => {
        if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.status !== 'all') {
            const status = getProjectStatus(p);
            if (status !== filters.status) return false;
        }
        if (filters.technology !== 'all' && p.technology !== filters.technology) return false;
        if (filters.division !== 'all' && p.division !== filters.division) return false;
        if (filters.startDate && filters.endDate) {
            const filterStart = new Date(filters.startDate);
            const filterEnd = new Date(filters.endDate);
            const projStart = parseDate(p.start_date);
            const projEnd = parseDate(p.end_date);
            const overlapStart = new Date(Math.max(filterStart.getTime(), projStart.getTime()));
            const overlapEnd = new Date(Math.min(filterEnd.getTime(), projEnd.getTime()));
            if (overlapStart > overlapEnd) return false;
        }
        return true;
    }).sort((a: Project, b: Project) => b.id - a.id);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const techOptions = masterData?.find((m: any) => m.id === 'tech')?.items || [];
    const divOptions = Array.from(new Set(data.map((p: Project) => p.division).filter(Boolean)));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh] flex flex-col">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý dự án</h2>
                <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" placeholder="Tìm kiếm dự án ..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black" value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} />
                        </div>
                        <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 whitespace-nowrap">{filteredData.length} dự án</div>
                    </div>
                    <button onClick={onAdd} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">Thêm dự án</button>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="p-2"><Filter size={20} className="text-slate-900" /></div>
                    <div className="relative">
                        <select className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300" value={filters.status} onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}>
                            <option value="all">Trạng thái</option>
                            <option value="Chưa thực hiện">Chưa thực hiện</option>
                            <option value="Đang thực hiện">Đang thực hiện</option>
                            <option value="Đã hoàn thành">Đã hoàn thành</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300" value={filters.technology} onChange={(e) => setFilters(prev => ({...prev, technology: e.target.value}))}>
                            <option value="all">Công nghệ</option>
                            {techOptions.map((t: string) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300" value={filters.division} onChange={(e) => setFilters(prev => ({...prev, division: e.target.value}))}>
                            <option value="all">Bộ phận</option>
                            {divOptions.map((d: any) => <option key={d} value={String(d)}>{d}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300">
                        <CalendarIcon size={14} className="text-slate-400"/>
                        <span className="text-xs text-slate-400">Tất cả thời gian</span>
                        <input type="date" className="text-xs text-slate-600 focus:outline-none w-4 bg-transparent opacity-0 absolute w-32 cursor-pointer" onChange={e => setFilters(prev => ({...prev, startDate: e.target.value}))} />
                    </div>
                    <button onClick={clearFilters} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50">Xoá bộ lọc</button>
                    <div className="ml-auto"><button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50">Tải xuống</button></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-slate-900 font-bold border-b border-slate-200 text-xs">
                            <tr>
                                <th className="py-3 pr-4">Mã dự án</th>
                                <th className="py-3 pr-4">Tên dự án</th>
                                <th className="py-3 pr-4">Khách hàng</th>
                                <th className="py-3 pr-4">Ngày bắt đầu</th>
                                <th className="py-4 pr-4">Ngày kết thúc</th>
                                <th className="py-3 pr-4">Bộ phận</th>
                                <th className="py-3 pr-4">Man-month</th>
                                <th className="py-3 pr-4">Công nghệ</th>
                                <th className="py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((p: Project) => (
                                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer group" onClick={() => onViewDetail && onViewDetail(p)}>
                                    <td className="py-4 pr-4 text-slate-600">{p.code}</td>
                                    <td className="py-4 pr-4 font-medium text-slate-900">{p.name}</td>
                                    <td className="py-4 pr-4 text-slate-600">{clients.find((c: Client) => c.id === p.client_id)?.name}</td>
                                    <td className="py-4 pr-4 text-slate-600">{p.start_date}</td>
                                    <td className="py-4 pr-4 text-slate-600">{p.end_date}</td>
                                    <td className="py-4 pr-4 text-slate-600">{p.division}</td>
                                    <td className="py-4 pr-4 text-slate-600">{p.man_month}</td>
                                    <td className="py-4 pr-4 text-slate-600">{p.technology}</td>
                                    <td className="py-4"><StatusBadge type="project" status={p.status_id} project={p} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="mt-auto p-6 border-t border-slate-100 flex justify-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronDown className="rotate-90" size={14}/></button>
                    {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center border rounded text-xs font-medium ${currentPage === page ? 'bg-red-500 border-red-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>{page}</button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={14}/></button>
                </div>
            )}
        </div>
    );
};

export const ProjectDetailView = ({ project, onBack, onEdit, onNavigate }: any) => {
    const mockData = getMockData();
    const client = mockData.clients.find(c => c.id === project.client_id);
    const contracts = mockData.contracts.filter(c => c.project_id === project.id);
    
    return (
        <div className="min-h-screen pb-10">
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={24} className="text-slate-700" /></button>
                    <div><h1 className="text-2xl font-bold text-slate-900">{project.name}</h1><p className="text-sm text-slate-500">Mã dự án: {project.code}</p></div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Request start</button>
                    <button onClick={() => onEdit(project)} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800">Chỉnh sửa</button>
                </div>
            </div>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
                        <StatusBadge type="project" status={project.status_id} project={project} />
                        <h3 className="font-bold text-slate-900 mb-6 mt-2">Thông tin dự án</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
                            <div><span className="text-slate-500 block mb-1">Tên khách hàng:</span> <span className="font-medium text-slate-900">{client?.name}</span></div>
                            <div><span className="text-slate-500 block mb-1">Công nghệ:</span> <span className="font-medium text-slate-900">{project.technology}</span></div>
                            <div><span className="text-slate-500 block mb-1">Bộ phận:</span> <span className="font-medium text-slate-900">{project.division}</span></div>
                            <div><span className="text-slate-500 block mb-1">Ngày bắt đầu:</span> <span className="font-medium text-slate-900">{project.start_date}</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                         <h3 className="font-bold text-slate-900 mb-4">Tổng quan tài chính</h3>
                         <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center cursor-pointer" onClick={() => onNavigate('/contracts')}>
                                <div><div className="text-xs text-slate-500 mb-1 font-medium">Hợp đồng</div><div className="font-bold text-lg">{contracts.length}</div></div>
                                <ArrowRight size={18} className="text-slate-400" />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
