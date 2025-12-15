import React, { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Project, Contract, Client } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';

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

export const ProjectsModule = ({ data, clients, onAdd, onEdit, onDelete }: any) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý dự án</h2>
            <FilterBar 
                placeholder="Tìm kiếm dự án..." 
                onAdd={onAdd} 
                addLabel="Thêm dự án" 
                filters={{items: ['Trạng thái', 'Công nghệ', 'Bộ phận', 'Tất cả thời gian', 'Xoá bộ lọc']}}
            />
             <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                    <tr>
                        <th className="py-4">Mã dự án</th>
                        <th className="py-4">Tên dự án</th>
                        <th className="py-4">Khách hàng</th>
                        <th className="py-4">Ngày bắt đầu</th>
                        <th className="py-4">Ngày kết thúc</th>
                        <th className="py-4">Bộ phận</th>
                        <th className="py-4">Công nghệ</th>
                        <th className="py-4">Trạng thái</th>
                        <th className="py-4">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((p: Project) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-4 text-slate-600">{p.code}</td>
                            <td className="py-4 font-medium">{p.name}</td>
                            <td className="py-4 text-slate-600">{clients.find((c: Client) => c.id === p.client_id)?.name}</td>
                            <td className="py-4 text-slate-600">{p.start_date}</td>
                            <td className="py-4 text-slate-600">{p.end_date}</td>
                            <td className="py-4 text-slate-600">{p.division}</td>
                            <td className="py-4 text-slate-600">{p.technology}</td>
                            <td className="py-4"><StatusBadge type="project" status={p.status_id} project={p} /></td>
                            <td className="py-4 flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(p); }} className="text-blue-600 hover:text-blue-800"><Edit3 size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export const ContractForm = ({ initialData, projects, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Contract>>(initialData || {
        code: `HĐ-${Math.floor(Math.random() * 1000)}`,
        name: '',
        project_id: projects[0]?.id,
        total_value: 0,
        currency: 'USD',
        status_id: 1,
        type: 'ODC',
        start_date: '',
        end_date: ''
    });
    
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-8 rounded-xl min-h-screen">
            <FormHeader title={initialData ? "Sửa hợp đồng" : "Thêm hợp đồng"} onBack={onBack} onSave={() => onSave(formData)} />
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Dự án *</label>
                  <select value={formData.project_id} onChange={e => handleChange('project_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                      {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Tên hợp đồng</label>
                    <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Giá trị hợp đồng *</label>
                    <div className="flex gap-2">
                        <input type="number" value={formData.total_value} onChange={e => handleChange('total_value', Number(e.target.value))} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm" />
                        <select className="w-20 p-2 border border-slate-200 rounded-lg text-sm"><option>USD</option><option>JPY</option><option>VND</option></select>
                    </div>
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">Loại hợp đồng</label>
                    <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                        <option>ODC</option><option>Project Base</option>
                    </select>
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

export const ContractsModule = ({ data, projects, clients, onAdd, onEdit, onDelete, onViewDetail }: any) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý hợp đồng</h2>
            <FilterBar 
                placeholder="Tìm kiếm hợp đồng..." 
                onAdd={onAdd} 
                addLabel="Thêm hợp đồng" 
                filters={{items: ['Loại hợp đồng', 'Hiệu lực', 'Đơn vị tiền', 'Trạng thái ký', 'Xoá bộ lọc']}}
            />
             <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                    <tr>
                        <th className="py-4">Mã hợp đồng</th>
                        <th className="py-4">Tên dự án</th>
                        <th className="py-4">Khách hàng</th>
                        <th className="py-4">Ngày bắt đầu</th>
                        <th className="py-4">Giá trị HĐ</th>
                        <th className="py-4">Trạng thái</th>
                        <th className="py-4">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((c: Contract) => (
                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => onViewDetail(c)}>
                            <td className="py-4 text-slate-600">{c.code}</td>
                            <td className="py-4">
                                <div className="font-medium">{projects.find((p: Project) => p.id === c.project_id)?.name}</div>
                            </td>
                            <td className="py-4 text-slate-600">{clients.find((cl: Client) => cl.id === c.client_id)?.name}</td>
                            <td className="py-4 text-slate-600">{c.start_date}</td>
                            <td className="py-4 font-medium">{c.total_value.toLocaleString()} {c.currency}</td>
                            <td className="py-4"><StatusBadge type="contract" status={c.status_id} contract={c} /></td>
                             <td className="py-4 flex gap-2" onClick={e => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(c); }} className="text-blue-600 hover:text-blue-800"><Edit3 size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};