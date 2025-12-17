
import React from 'react';
import { Notification } from '../types';

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
