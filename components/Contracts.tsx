
import React, { useState, useEffect } from 'react';
import { Edit3, ArrowLeft, X, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Contract, Project, Client, Invoice, Permission, User } from '../types';
import { StatusBadge, FormHeader, FilterBar } from './Shared';
import { getMockData } from '../services/mockData';

export const RequestStartModal = ({ isOpen, onClose, contract, project, user }: { isOpen: boolean, onClose: () => void, contract: Contract, project?: Project, user?: User }) => {
    const [formData, setFormData] = useState({
        to: 'giangnk@relipasoft.com', 
        cc: 'div@relipasoft.com, account-group@relipasoft.com',
        bcc: '',
        subject: '',
        body: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen && contract && project) {
            const isExtend = contract.is_extend;
            const subjectCode = project.code; 
            const subject = isExtend 
                ? `[SALE] Request extend dự án_${subjectCode}`
                : `[SALE] Request start dự án_${subjectCode}`;

            let body = `Dear anh/chị,\n\nCC Mọi người,\n\nEm gửi anh/chị yêu cầu start dự án theo nội dung phía dưới ạ :\n\n`;
            body += `■Tên dự án: ${project.name || '<Thiếu tên>'}\n`;
            body += `■Mã code dự án: ${project.code || '<Thiếu mã>'}\n`;
            body += `■Kiểu dự án: ${contract.type || '<Thiếu loại>'}\n`;
            
            if (contract.type === 'ODC') {
                body += `■Công số: ${contract.man_month_div || 0} MM/tháng\n\n`;
                if (contract.efforts && contract.efforts.length > 0) {
                    contract.efforts.forEach(eff => {
                        body += `+ ${eff.role} : ${eff.man_month} MM\n`;
                    });
                } else {
                    body += `+ (Chưa có chi tiết công số)\n`;
                }
            } else {
                body += `■Công số: ${contract.man_month_div || 0} MM\n`;
            }

            body += `\n■Nội dung phát triển: ${project.description || '...'}\n`;
            body += `■Ngày bắt đầu dự án: ${contract.start_date || '<Thiếu ngày bắt đầu>'}\n`;
            body += `■Ngày kết thúc dự án: ${contract.end_date || '<Thiếu ngày kết thúc>'}\n`;

            if (contract.type === 'Project base') {
                body += `\nCác mốc quan trọng:\n`;
                if (contract.project_milestones && contract.project_milestones.length > 0) {
                    contract.project_milestones.forEach(ms => {
                        body += `■ ${ms.name}: ${ms.start_date} ~ ${ms.end_date}\n`;
                    });
                } else {
                    body += `(Chưa có milestone)\n`;
                }
            }

            body += `\n■ Backlog contract ticket link: ${contract.backlog_link || '<Thiếu link>'}\n\n`;
            body += `Nhờ anh/chị cho team triển khai giúp em ạ.\nEm cảm ơn anh ạ!`;

            setFormData(prev => ({ ...prev, subject, body }));
            setErrors({});
        }
    }, [isOpen, contract, project]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.to.trim()) newErrors.to = "ERROR_EMAIL_TO_REQUIRED";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validateList = (list: string, field: string) => {
            if (!list) return;
            const emails = list.split(',').map(e => e.trim());
            for (const email of emails) {
                if (email && !emailRegex.test(email)) {
                    newErrors[field] = `Email không hợp lệ: ${email}`;
                    break;
                }
            }
        };
        validateList(formData.to, 'to');
        validateList(formData.cc, 'cc');
        validateList(formData.bcc, 'bcc');

        if (!formData.subject.trim()) newErrors.subject = "ERROR_SUBJECT_REQUIRED";
        if (formData.subject.length > 200) newErrors.subject = "ERROR_SUBJECT_TOO_LONG";

        if (!formData.body.trim()) newErrors.body = "ERROR_BODY_REQUIRED";
        if (formData.body.length > 20000) newErrors.body = "ERROR_BODY_TOO_LONG";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSend = () => {
        if (validate()) {
            setIsSending(true);
            setTimeout(() => {
                setIsSending(false);
                alert("Đã gửi email thành công!");
                onClose();
            }, 1000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Gửi mail request start dự án</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-black">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-2 text-sm font-semibold text-slate-700 text-right">Đến *</label>
                        <div className="col-span-10">
                            <input 
                                type="text" 
                                className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.to ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                                value={formData.to}
                                onChange={e => setFormData({...formData, to: e.target.value})}
                            />
                            {errors.to && <p className="text-xs text-red-500 mt-1">{errors.to}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-2 text-sm font-semibold text-slate-700 text-right">Cc</label>
                        <div className="col-span-10">
                            <input 
                                type="text" 
                                className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.cc ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                                value={formData.cc}
                                onChange={e => setFormData({...formData, cc: e.target.value})}
                            />
                            {errors.cc && <p className="text-xs text-red-500 mt-1">{errors.cc}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-2 text-sm font-semibold text-slate-700 text-right">Bcc</label>
                        <div className="col-span-10">
                            <input 
                                type="text" 
                                className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.bcc ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                                value={formData.bcc}
                                onChange={e => setFormData({...formData, bcc: e.target.value})}
                            />
                            {errors.bcc && <p className="text-xs text-red-500 mt-1">{errors.bcc}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center">
                        <label className="col-span-2 text-sm font-semibold text-slate-700 text-right">Tiêu đề *</label>
                        <div className="col-span-10">
                            <input 
                                type="text" 
                                className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errors.subject ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                                value={formData.subject}
                                onChange={e => setFormData({...formData, subject: e.target.value})}
                            />
                            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-start">
                        <label className="col-span-2 text-sm font-semibold text-slate-700 text-right mt-2">Nội dung *</label>
                        <div className="col-span-10">
                            <textarea 
                                className={`w-full p-3 border rounded-lg text-sm font-mono focus:outline-none focus:ring-1 h-64 resize-none ${errors.body ? 'border-red-500 ring-red-500' : 'border-slate-200 focus:ring-black'}`}
                                value={formData.body}
                                onChange={e => setFormData({...formData, body: e.target.value})}
                            />
                            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body}</p>}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex flex-col items-center gap-4 bg-slate-50 rounded-b-xl">
                    <p className="text-xs text-slate-500">Vui lòng kiểm tra lại nội dung mail trước khi gửi.</p>
                    <button 
                        onClick={handleSend}
                        disabled={isSending}
                        className="bg-black text-white px-12 py-3 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <>
                                <RefreshCw className="animate-spin" size={16} /> Đang gửi...
                            </>
                        ) : (
                            <>
                                Gửi <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">8</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ContractForm = ({ initialData, projects, clients, onBack, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<Contract>>(initialData || {
        code: `CTR-${Math.floor(Math.random() * 1000)}`,
        name: '',
        project_id: projects[0]?.id,
        client_id: clients[0]?.id,
        type: 'ODC',
        status_id: 3, 
        start_date: '',
        end_date: '',
        total_value: 0,
        currency: 'USD',
        sign_date: '',
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-8 rounded-xl min-h-screen">
           <FormHeader title={initialData ? "Sửa hợp đồng" : "Thêm hợp đồng"} onBack={onBack} onSave={() => onSave(formData)} />
           <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Mã hợp đồng *</label>
                  <input type="text" value={formData.code} readOnly className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" />
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Tên hợp đồng *</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Dự án *</label>
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    value={formData.project_id}
                    onChange={e => handleChange('project_id', Number(e.target.value))}
                  >
                      {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
              </div>
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
                  <label className="text-sm font-medium text-slate-900">Loại hợp đồng</label>
                  <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                      <option>ODC</option>
                      <option>Project base</option>
                  </select>
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Trạng thái</label>
                  <select value={formData.status_id} onChange={e => handleChange('status_id', Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                      <option value={1}>Chờ ký</option>
                      <option value={2}>Đã ký</option>
                      <option value={3}>Dự báo</option>
                  </select>
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Ngày bắt đầu</label>
                  <input type="date" value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Ngày kết thúc</label>
                  <input type="date" value={formData.end_date} onChange={e => handleChange('end_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Giá trị hợp đồng</label>
                  <div className="flex gap-2">
                       <input type="number" value={formData.total_value} onChange={e => handleChange('total_value', Number(e.target.value))} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm" />
                       <select value={formData.currency} onChange={e => handleChange('currency', e.target.value)} className="w-20 p-2 border border-slate-200 rounded-lg text-sm"><option>USD</option><option>JPY</option><option>VND</option></select>
                  </div>
              </div>
              <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900">Ngày ký</label>
                  <input type="date" value={formData.sign_date} onChange={e => handleChange('sign_date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" />
              </div>
           </div>
        </div>
    );
};

export const ContractDetailView = ({ contract, project, invoices = [], onBack, onEdit, onExtend, onNavigate }: any) => {
    const [activeTab, setActiveTab] = useState<'revenue' | 'payment' | 'history'>('revenue');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    const mockData = getMockData();
    const contractInvoices = invoices.filter((i: Invoice) => i.project_id === contract.project_id); 
    
    const totalValue = contract.total_value;
    const commission = contract.commission_fee || 0;
    const discount = contract.discount || 0;
    const otherFee = contract.other_fee || 0;
    const paidAmount = contractInvoices.filter((i: any) => i.status_id === 3).reduce((sum: number, i: any) => sum + (i.paid_amount || 0), 0);
    const remainingAmount = totalValue - paidAmount;
    const progressPercent = totalValue ? Math.round((paidAmount / totalValue) * 100) : 0;

    const getValidityLabel = () => {
        if (!contract.end_date) return '';
        const end = new Date(contract.end_date.split('/').reverse().join('-'));
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return `Đã hết hạn ${Math.abs(diffDays)} ngày`;
        return `Hết hiệu lực sau ${diffDays} ngày`;
    };

    return (
        <div className="min-h-screen pb-10 bg-slate-50 relative">
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            Hợp đồng {contract.code}
                        </h1>
                        <p className="text-sm text-slate-500">Dự án: {project?.name} ({project?.code})</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Request start
                    </button>
                    <button onClick={() => onExtend(contract)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Gia hạn</button>
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Thêm hoá đơn</button>
                    <button onClick={() => onEdit(contract)} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800">Chỉnh sửa</button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="font-bold text-slate-900">Thông tin hợp đồng</h3>
                            <StatusBadge type="contract" status={contract.status_id} />
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">{getValidityLabel()}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                            <div className="col-span-2 lg:col-span-1 space-y-4">
                                <div><span className="text-slate-500 block text-xs mb-1">Tên khách hàng:</span> <span className="font-medium text-slate-900">FPT Software</span></div>
                                <div><span className="text-slate-500 block text-xs mb-1">Loại hợp đồng:</span> <span className="font-medium text-slate-900">{contract.type}</span></div>
                                <div><span className="text-slate-500 block text-xs mb-1">Bộ phận phát triển:</span> <span className="font-medium text-slate-900">Division 1 (50%), Global (50%)</span></div>
                                <div><span className="text-slate-500 block text-xs mb-1">Ngày bắt đầu:</span> <span className="font-medium text-slate-900">{contract.start_date}</span></div>
                                <div><span className="text-slate-500 block text-xs mb-1">Ngày kết thúc:</span> <span className="font-medium text-slate-900">{contract.end_date}</span></div>
                                <div><span className="text-slate-500 block text-xs mb-1">Ngày ký kết:</span> <span className="font-medium text-slate-900">{contract.sign_date || '-'}</span></div>
                                <div><span className="text-slate-500 block text-xs mb-1">Ghi chú:</span> <span className="font-medium text-slate-900">{contract.note || '-'}</span></div>
                            </div>
                            <div className="col-span-2 lg:col-span-1 space-y-4">
                                <div><span className="text-slate-500 block text-xs mb-1">Người thanh toán:</span> <span className="font-medium text-slate-900">Nguyễn Văn A</span></div>
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">Bên 1 (100%):</span> 
                                    <div className="flex gap-4">
                                        <span className="font-medium text-slate-900">Nguyễn Văn A</span>
                                        <span className="text-slate-500">nguyenvana@gmail.com</span>
                                    </div>
                                </div>
                                <div><span className="text-slate-500 block text-xs mb-1">Chuyển nợ:</span> <span className="font-medium text-slate-900">{contract.is_transfer_debt ? 'Có' : 'Không'}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                         <h3 className="font-bold text-slate-900 mb-4">Tổng quan tài chính</h3>
                         
                         <div className="grid grid-cols-2 gap-4 mb-4">
                             <div className="col-span-1 bg-slate-50 p-3 rounded-lg">
                                 <div className="text-xs text-slate-500 mb-1">Giá trị hợp đồng</div>
                                 <div className="font-bold text-slate-900">{totalValue.toLocaleString()} {contract.currency}</div>
                             </div>
                             <div className="col-span-1 bg-slate-50 p-3 rounded-lg">
                                 <div className="flex justify-between items-center mb-1">
                                     <span className="text-xs text-slate-500">Tiến độ thanh toán</span>
                                     <span className="text-xs font-bold">{progressPercent}%</span>
                                 </div>
                                 <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                     <div className="bg-black h-1.5 rounded-full" style={{width: `${progressPercent}%`}}></div>
                                 </div>
                             </div>
                             <div className="col-span-1 bg-slate-50 p-3 rounded-lg">
                                 <div className="text-xs text-slate-500 mb-1">Đã nhận</div>
                                 <div className="font-bold text-slate-900">{paidAmount.toLocaleString()} {contract.currency}</div>
                             </div>
                             <div className="col-span-1 bg-slate-50 p-3 rounded-lg">
                                 <div className="text-xs text-slate-500 mb-1">Còn lại</div>
                                 <div className="font-bold text-slate-900">{remainingAmount.toLocaleString()} {contract.currency}</div>
                             </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
                             <div className="space-y-2">
                                 <div>Man-month sale: {contract.man_month_sale}</div>
                                 <div>Man-month div: {contract.man_month_div}</div>
                                 {contract.efforts?.map((e: any, i: number) => (
                                     <div key={i} className="text-slate-500">{e.role}: {e.man_month}/tháng</div>
                                 )) || (
                                     <>
                                        <div className="text-slate-500">BA: 1.0/tháng</div>
                                        <div className="text-slate-500">DEV: 2.0/tháng</div>
                                        <div className="text-slate-500">Tester: 1.0/tháng</div>
                                     </>
                                 )}
                             </div>
                             <div className="space-y-2 text-right">
                                 <div>Hoa hồng: {commission.toLocaleString()} {contract.currency}</div>
                                 <div>Discount: {discount.toLocaleString()} {contract.currency}</div>
                                 <div>Other: {otherFee.toLocaleString()} {contract.currency}</div>
                             </div>
                         </div>
                    </div>
                </div>

                <div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
                        <button onClick={() => setActiveTab('revenue')} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'revenue' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Doanh thu</button>
                        <button onClick={() => setActiveTab('payment')} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'payment' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Hoá đơn</button>
                        <button onClick={() => setActiveTab('history')} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Lịch sử thay đổi</button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                        {activeTab === 'revenue' && (
                            <div className="p-6 h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={[
                                        {name: '5/2024', revenue: 500000, mm: 2},
                                        {name: '6/2024', revenue: 450000, mm: 2},
                                        {name: '7/2024', revenue: 480000, mm: 2.5},
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                                        <RechartsTooltip />
                                        <Bar yAxisId="left" dataKey="revenue" fill="#cbd5e1" barSize={60} radius={[4, 4, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="mm" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div className="p-6 space-y-8">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-lg text-slate-900">
                                            {contract.is_periodic_invoice ? 'Cài đặt hoá đơn' : 'Cài đặt hoá đơn'}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            {contract.is_periodic_invoice && <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">Định kỳ</span>}
                                            <button className="text-slate-400 hover:text-black"><Edit3 size={16}/></button>
                                        </div>
                                    </div>
                                    
                                    {contract.is_periodic_invoice ? (
                                        <div className="bg-slate-50 p-6 rounded-lg grid grid-cols-4 gap-8">
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1">Ngày bắt đầu</div>
                                                <div className="font-medium text-slate-900">{contract.periodic_config?.start_date || '01/02/2025'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1">Chu kỳ</div>
                                                <div className="font-medium text-slate-900">{contract.periodic_config?.cycle || 30} ngày</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1">Giá trị hoá đơn</div>
                                                <div className="font-medium text-slate-900">{contract.periodic_config?.amount?.toLocaleString() || '50,000.00'} {contract.currency}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                                                    <tr>
                                                        <th className="py-3 px-4">Mốc thanh toán</th>
                                                        <th className="py-3 px-4">Giá trị hoá đơn</th>
                                                        <th className="py-3 px-4">Tỉ lệ thanh toán</th>
                                                        <th className="py-3 px-4">Ghi chú</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(contract.payment_milestones?.length ? contract.payment_milestones : [
                                                        {date: '12/6/2025', amount: 50000, percent: 20, note: 'Thanh toán ban đầu'},
                                                        {date: '12/6/2025', amount: 50000, percent: 50, note: 'Thanh toán khi bàn giao testnet'},
                                                        {date: '12/6/2025', amount: 50000, percent: 30, note: 'Thanh toán khi bàn giao xong mainnet'}
                                                    ]).map((ms: any, i: number) => (
                                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 last:border-0">
                                                            <td className="py-3 px-4 text-slate-600">{ms.date}</td>
                                                            <td className="py-3 px-4 font-medium">{ms.amount.toLocaleString()} {contract.currency}</td>
                                                            <td className="py-3 px-4 text-slate-600">{ms.percent}%</td>
                                                            <td className="py-3 px-4 text-slate-600">{ms.note}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h4 className="font-bold text-lg text-slate-900">Hoá đơn đã tạo</h4>
                                        <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{contractInvoices.length}</span>
                                    </div>
                                    
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white text-slate-900 font-bold border-b border-slate-200 text-xs uppercase">
                                                <tr>
                                                    <th className="py-3 px-4">Mã hoá đơn</th>
                                                    <th className="py-3 px-4">Giá trị hoá đơn</th>
                                                    <th className="py-3 px-4">Ngày xuất</th>
                                                    <th className="py-3 px-4">Ngày đến hạn</th>
                                                    <th className="py-3 px-4">Ngày thanh toán</th>
                                                    <th className="py-3 px-4">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contractInvoices.map((inv: Invoice) => (
                                                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                                                        <td className="py-3 px-4 font-medium text-slate-900">{inv.invoice_no}</td>
                                                        <td className="py-3 px-4 text-slate-600">{inv.total_amount.toLocaleString()} {inv.currency}</td>
                                                        <td className="py-3 px-4 text-slate-600">{inv.issue_date}</td>
                                                        <td className="py-3 px-4 text-slate-600">{inv.due_date}</td>
                                                        <td className="py-3 px-4 text-slate-600">{inv.status_id === 3 ? '18/05/2025' : '-'}</td>
                                                        <td className="py-3 px-4"><StatusBadge type="invoice" status={inv.status_id} /></td>
                                                    </tr>
                                                ))}
                                                {contractInvoices.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="py-8 text-center text-slate-400">Chưa có hoá đơn nào được tạo.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {contractInvoices.length > 0 && (
                                        <div className="flex justify-center mt-4 gap-2">
                                            <button className="w-8 h-8 border rounded hover:bg-slate-50 flex items-center justify-center"><ChevronDown className="rotate-90" size={14}/></button>
                                            <button className="w-8 h-8 border rounded bg-black text-white flex items-center justify-center text-xs">1</button>
                                            <button className="w-8 h-8 border rounded hover:bg-slate-50 flex items-center justify-center text-xs">2</button>
                                            <button className="w-8 h-8 border rounded hover:bg-slate-50 flex items-center justify-center text-xs">10</button>
                                            <button className="w-8 h-8 border rounded hover:bg-slate-50 flex items-center justify-center"><ChevronRight size={14}/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="p-6">
                                <div className="space-y-6 max-w-3xl">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">2</div>
                                        </div>
                                        <div className="border border-slate-200 rounded-lg p-4 flex-1">
                                            <div className="font-bold text-sm mb-2 flex items-center gap-2">
                                                Thay đổi thông tin: Địa chỉ <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            </div>
                                            <div className="text-xs text-slate-500 mb-1">Trước thay đổi: -</div>
                                            <div className="text-xs text-slate-500 mb-2">Sau thay đổi: </div>
                                            <div className="text-[10px] text-slate-400">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">1</div>
                                        </div>
                                        <div className="border border-slate-200 rounded-lg p-4 flex-1">
                                            <div className="font-bold text-sm mb-1">Tạo mới</div>
                                            <div className="text-[10px] text-slate-400">Bởi: Trần Xuân Đức vào lúc 21:30:00 ngày 10/6/2024</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RequestStartModal 
                isOpen={isRequestModalOpen} 
                onClose={() => setIsRequestModalOpen(false)} 
                contract={contract}
                project={project}
            />
        </div>
    );
};

export const ContractsModule = ({ data, projects, clients, permissions, onAdd, onEdit, onDelete, onViewDetail }: any) => {
    const canView = permissions?.find((p: Permission) => p.module === 'Hợp đồng' && p.role === 'Sale Admin')?.canView ?? true;
    
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        type: 'all',
    });

    if (!canView) {
        return <div className="p-6 text-red-600 font-medium">Tài khoản chưa được cấp quyền.</div>;
    }

    const filteredData = data.filter((c: Contract) => {
        if (filters.search) {
             const lowerSearch = filters.search.toLowerCase();
             if (!c.code.toLowerCase().includes(lowerSearch) && !c.name.toLowerCase().includes(lowerSearch)) return false;
        }
        if (filters.status !== 'all' && String(c.status_id) !== filters.status) return false;
        if (filters.type !== 'all' && c.type !== filters.type) return false;
        return true;
    }).sort((a: Contract, b: Contract) => b.id - a.id);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[80vh]">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quản lý hợp đồng</h2>
                <FilterBar 
                    placeholder="Tìm kiếm hợp đồng..." 
                    onAdd={onAdd}
                    addLabel="Thêm hợp đồng"
                    filters={{
                        items: [
                           <select key="status" className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600 focus:outline-none" value={filters.status} onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}>
                               <option value="all">Trạng thái</option>
                               <option value="1">Chờ ký</option>
                               <option value="2">Đã ký</option>
                               <option value="3">Dự báo</option>
                           </select>,
                           <select key="type" className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600 focus:outline-none" value={filters.type} onChange={e => setFilters(prev => ({...prev, type: e.target.value}))}>
                               <option value="all">Loại hợp đồng</option>
                               <option value="ODC">ODC</option>
                               <option value="Project base">Project base</option>
                           </select>
                        ],
                        onSearch: (val: string) => setFilters(prev => ({...prev, search: val}))
                    }}
                />
                
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                            <th className="py-4">Mã hợp đồng</th>
                            <th className="py-4">Dự án</th>
                            <th className="py-4">Khách hàng</th>
                            <th className="py-4">Loại</th>
                            <th className="py-4">Ngày ký</th>
                            <th className="py-4">Giá trị</th>
                            <th className="py-4">Trạng thái</th>
                            <th className="py-4">Hiệu lực</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((c: Contract) => (
                            <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => onViewDetail && onViewDetail(c)}>
                                <td className="py-4 font-medium">{c.code}</td>
                                <td className="py-4 text-slate-600">{projects.find((p: Project) => p.id === c.project_id)?.name || '-'}</td>
                                <td className="py-4 text-slate-600">{clients.find((cl: Client) => cl.id === c.client_id)?.name || '-'}</td>
                                <td className="py-4 text-slate-600">{c.type}</td>
                                <td className="py-4 text-slate-600">{c.sign_date || '-'}</td>
                                <td className="py-4 font-medium">{c.total_value.toLocaleString()} {c.currency}</td>
                                <td className="py-4"><StatusBadge type="contract" status={c.status_id} /></td>
                                <td className="py-4"><StatusBadge type="contract_validity" contract={c} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
