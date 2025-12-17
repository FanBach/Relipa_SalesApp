
import React from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { MasterCategory } from '../types';

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
