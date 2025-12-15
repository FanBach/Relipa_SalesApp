import React from 'react';
import { ArrowLeft, Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { Contract, Project } from '../types';

export const StatusBadge = ({ status, type, contract, project }: { status: number | string, type: 'client' | 'project' | 'invoice' | 'contract' | 'generic', contract?: Contract, project?: Project }) => {
  let colorClass = "bg-slate-100 text-slate-600";
  let label = "Unknown";

  if (type === 'client') {
    if (status === 1) { colorClass = "bg-emerald-100 text-emerald-700"; label = "Active"; }
    else { colorClass = "bg-slate-100 text-slate-600"; label = "Inactive"; }
  } else if (type === 'project' && project) {
      const now = new Date();
      // Assumes dd/mm/yyyy format
      const [d1, m1, y1] = project.start_date.split('/');
      const start = new Date(Number(y1), Number(m1)-1, Number(d1));
      const [d2, m2, y2] = project.end_date.split('/');
      const end = new Date(Number(y2), Number(m2)-1, Number(d2));

      if (start > now) { colorClass = "bg-gray-100 text-gray-600"; label = "Chưa thực hiện"; }
      else if (end < now) { colorClass = "bg-emerald-100 text-emerald-700"; label = "Đã hoàn thành"; }
      else { colorClass = "bg-blue-100 text-blue-700"; label = "Đang thực hiện"; }

  } else if (type === 'invoice') {
    if (status === 1) { colorClass = "bg-slate-100 text-slate-600"; label = "Draft"; }
    else if (status === 2) { colorClass = "bg-blue-100 text-blue-600"; label = "Chờ thanh toán"; }
    else if (status === 3) { colorClass = "bg-emerald-100 text-emerald-600"; label = "Đã thanh toán"; }
    else { colorClass = "bg-red-100 text-red-600"; label = "Quá hạn"; }
  } else if (type === 'contract' && contract) {
      const now = new Date();
      const [d1, m1, y1] = contract.start_date.split('/');
      const start = new Date(Number(y1), Number(m1)-1, Number(d1));
      const [d2, m2, y2] = contract.end_date.split('/');
      const end = new Date(Number(y2), Number(m2)-1, Number(d2));
      
      // Logic from Spec S003
      if (!contract.accepted_date) {
          colorClass = "bg-slate-200 text-slate-600"; label = "Chờ ký";
      } else if (contract.accepted_date && start > now) {
          colorClass = "bg-blue-100 text-blue-700"; label = "Đã ký kết";
      } else if (end < now) {
          colorClass = "bg-red-100 text-red-700"; label = "Đã hết hạn";
      } else {
          // Active contract, show days remaining
          const diffTime = Math.abs(end.getTime() - now.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          colorClass = "bg-orange-100 text-orange-700"; label = `Hết hạn sau ${diffDays} ngày`;
      }
  } else if (type === 'generic') {
      label = String(status);
      if (label === 'Đã ký') colorClass = "bg-emerald-50 text-emerald-600";
      else if (label === 'Chờ ký') colorClass = "bg-orange-50 text-orange-600";
      else if (label === 'Dự kiến') colorClass = "bg-slate-100 text-slate-600";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
      {label}
    </span>
  );
};

export const FormHeader = ({ title, onBack, onSave }: any) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
        <ArrowLeft size={24} className="text-slate-700" />
      </button>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    </div>
    <div className="flex gap-3">
       <button onClick={onBack} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Huỷ</button>
       <button onClick={onSave} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800">Lưu</button>
    </div>
  </div>
);

export const FilterBar = ({ placeholder, onAdd, addLabel, filters, extraButtons, searchError }: any) => (
    <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder={placeholder} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" onChange={(e) => filters.onSearch && filters.onSearch(e.target.value)} />
            </div>
            <div className="flex gap-3">
                {extraButtons}
                {onAdd && (
                    <button onClick={onAdd} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
                        {addLabel}
                    </button>
                )}
            </div>
        </div>
        {searchError && <div className="text-red-500 text-xs">{searchError}</div>}
        <div className="flex flex-wrap items-center gap-3">
             <div className="p-2"><Filter size={20} /></div>
             {filters.items?.map((f: any, i: number) => (
                 <React.Fragment key={i}>
                    {f}
                 </React.Fragment>
             ))}
             
        </div>
    </div>
);