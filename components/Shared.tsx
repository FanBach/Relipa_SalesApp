
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Filter, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react';
import { Contract, Project } from '../types';

export const parseDDMMYYYY = (dateStr?: string) => {
    if (!dateStr) return null;
    // Handle format dd/mm/yyyy
    if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/');
        return new Date(Number(y), Number(m) - 1, Number(d));
    }
    // Handle format yyyy-mm-dd
    if (dateStr.includes('-')) {
        return new Date(dateStr);
    }
    return null;
};

export const DateRangePicker = ({ startDate, endDate, onChange }: { startDate: string, endDate: string, onChange: (start: string, end: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDisplay = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            return `${start.getDate()}/${start.getMonth()+1} - ${end.getDate()}/${end.getMonth()+1}`;
        }
        if (startDate) {
            const start = new Date(startDate);
            return `Từ ${start.getDate()}/${start.getMonth()+1}`;
        }
        return "Tất cả thời gian";
    };

    const hasValue = startDate || endDate;

    return (
        <div className="relative" ref={containerRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 pl-3 pr-3 py-1.5 border rounded border-slate-200 hover:border-slate-300 bg-white transition-all w-full min-w-[140px] justify-between ${hasValue ? 'text-black font-medium' : 'text-slate-600'}`}
            >
                <div className="flex items-center gap-2 text-xs truncate">
                    <span>{formatDisplay()}</span>
                </div>
                {!hasValue && <CalendarIcon size={14} className="text-slate-400 flex-shrink-0"/>}
                {hasValue && <X size={14} className="text-slate-400 hover:text-red-500 flex-shrink-0" onClick={(e) => { e.stopPropagation(); onChange('', ''); }} />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 w-72 animate-fade-in">
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Từ ngày</label>
                            <input 
                                type="date" 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                value={startDate}
                                onChange={(e) => onChange(e.target.value, endDate)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Đến ngày</label>
                            <input 
                                type="date" 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                value={endDate}
                                onChange={(e) => onChange(startDate, e.target.value)}
                            />
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-slate-800"
                            >
                                Xong
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const StatusBadge = ({ status, type, contract, project, label }: { status?: number | string, type: 'client' | 'project' | 'invoice' | 'contract' | 'contract_validity' | 'generic', contract?: Contract, project?: Project, label?: string }) => {
  let colorClass = "bg-slate-100 text-slate-600";
  let displayLabel = label || "Unknown";

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (type === 'client') {
    if (status === 1) { colorClass = "bg-emerald-100 text-emerald-700"; displayLabel = "Active"; }
    else { colorClass = "bg-slate-100 text-slate-600"; displayLabel = "Inactive"; }
  } else if (type === 'project' && project) {
      const start = parseDDMMYYYY(project.start_date);
      const end = parseDDMMYYYY(project.end_date);

      if (start && start > now) { 
          colorClass = "bg-slate-100 text-slate-600"; 
          displayLabel = "Chưa thực hiện"; 
      } else if (end && end < now) { 
          colorClass = "bg-slate-200 text-slate-500"; 
          displayLabel = "Đã hoàn thành"; 
      } else { 
          colorClass = "bg-emerald-100 text-emerald-700"; 
          displayLabel = "Đang thực hiện"; 
      }

  } else if (type === 'invoice') {
    if (status === 1) { colorClass = "bg-slate-100 text-slate-600"; displayLabel = "Mới tạo"; } // Draft
    else if (status === 2) { colorClass = "bg-blue-100 text-blue-600"; displayLabel = "Đã gửi"; } // Sent/Waiting
    else if (status === 3) { colorClass = "bg-emerald-100 text-emerald-600"; displayLabel = "Đã thanh toán"; } // Paid
    else { colorClass = "bg-red-100 text-red-600"; displayLabel = "Quá hạn"; } // Overdue
  } else if (type === 'contract') {
      // Signing Status (Trạng thái ký)
      if (status === 1) { // Chờ ký
          colorClass = "bg-orange-50 text-orange-600"; displayLabel = "Chờ ký";
      } else if (status === 2) { // Đã ký
          colorClass = "bg-emerald-50 text-emerald-600"; displayLabel = "Đã ký";
      } else if (status === 3) { // Dự kiến
          colorClass = "bg-slate-100 text-slate-600"; displayLabel = "Dự kiến";
      } else {
          colorClass = "bg-red-50 text-red-600"; displayLabel = "Huỷ";
      }
  } else if (type === 'contract_validity' && contract) {
      // Validity Status (Hiệu lực) based on dates
      const start = parseDDMMYYYY(contract.start_date);
      const end = parseDDMMYYYY(contract.end_date);
      
      if (end && end < now) {
          colorClass = "bg-slate-200 text-slate-500"; displayLabel = "Đã hết hạn";
      } else if (start && end && start <= now && end >= now) {
          // Check if expiring soon (within 30 days)
          const diffTime = Math.abs(end.getTime() - now.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 30) {
             colorClass = "bg-orange-100 text-orange-700"; displayLabel = "Sắp hết hạn";
          } else {
             colorClass = "bg-green-100 text-green-700"; displayLabel = "Còn hiệu lực";
          }
      } else {
          colorClass = "bg-slate-100 text-slate-600"; displayLabel = "Chưa hiệu lực";
      }
  } else if (type === 'generic') {
      displayLabel = String(status);
      if (displayLabel === 'Đã ký' || displayLabel === 'Đã thanh toán') colorClass = "bg-emerald-50 text-emerald-600";
      else if (displayLabel === 'Chờ ký' || displayLabel === 'Chờ thanh toán') colorClass = "bg-orange-50 text-orange-600";
      else if (displayLabel === 'Dự kiến' || displayLabel === 'Mới tạo') colorClass = "bg-slate-100 text-slate-600";
      else if (displayLabel === 'Quá hạn') colorClass = "bg-red-50 text-red-600";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
      {displayLabel}
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
