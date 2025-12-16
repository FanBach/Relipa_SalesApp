import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getMockData } from './services/mockData';
import Dashboard from './components/Dashboard';
import { Client, Project, Invoice, Contract, User, Permission, Notification, MonthlyData, MasterCategory, RevenueAllocation, BankStatement } from './types';

// Import refactored components
import { Header, Sidebar, LoginScreen } from './components/Layout';
import { ClientForm, ClientsModule, ClientDetailView } from './components/ClientFeatures';
import { ProjectForm, ProjectsModule, ProjectDetailView, ContractForm, ContractsModule, ContractDetailView } from './components/ProjectContractFeatures';
import { InvoiceForm, InvoicesModule, InvoiceDetailView, RevenueForm, RevenueModule } from './components/FinanceFeatures';
import { AccountForm, AccountsModule, PermissionsModule, MasterModule, LogWorkforceForm, WorkforceModule, NotificationsView } from './components/SystemFeatures';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for data (initialized from mockData)
  const initialData = getMockData();
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [contracts, setContracts] = useState<Contract[]>(initialData.contracts);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [statements, setStatements] = useState<BankStatement[]>(initialData.statements);
  const [allocations, setAllocations] = useState<RevenueAllocation[]>(initialData.allocations);
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [notifications, setNotifications] = useState<Notification[]>(initialData.notifications);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(initialData.monthlyData);
  const [permissions, setPermissions] = useState<Permission[]>(initialData.permissions);
  const [masterData, setMasterData] = useState<MasterCategory[]>(initialData.masterCategories);

  // View State Management to handle "Add/Edit" modes
  const [activeModule, setActiveModule] = useState<string>(''); 
  const [editItem, setEditItem] = useState<any>(null); // If null, it's add mode. If set, it's edit.
  
  // Specific state for viewing Details
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Reset edit state when route changes
  useEffect(() => {
    setEditItem(null);
    setActiveModule('');
    setViewingClient(null);
    setViewingProject(null);
    setViewingContract(null);
    setViewingInvoice(null);
  }, [location.pathname]);

  // --- CRUD Handlers ---

  const handleSaveClient = (clientData: Client) => {
    if (clientData.id) {
        setClients(prev => prev.map(c => c.id === clientData.id ? clientData : c));
        if (viewingClient && viewingClient.id === clientData.id) {
            setViewingClient(clientData);
        }
    } else {
        setClients(prev => [...prev, { ...clientData, id: Date.now() }]);
    }
    setActiveModule('');
    setEditItem(null);
  };

  const handleDeleteClient = (id: number) => {
      if (window.confirm("Bạn có chắc chắn muốn xoá khách hàng này?")) {
          setClients(prev => prev.filter(c => c.id !== id));
      }
  };

  const handleSaveProject = (projectData: Project) => {
      if (projectData.id) {
          setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
          if (viewingProject && viewingProject.id === projectData.id) {
              setViewingProject(projectData);
          }
      } else {
          setProjects(prev => [...prev, { ...projectData, id: Date.now() }]);
      }
      setActiveModule('');
      setEditItem(null);
  };

  const handleDeleteProject = (id: number) => {
      if (window.confirm("Bạn có chắc chắn muốn xoá dự án này?")) {
          setProjects(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleSaveContract = (contractData: Contract) => {
    if (contractData.id) {
        setContracts(prev => prev.map(c => c.id === contractData.id ? contractData : c));
        if (viewingContract && viewingContract.id === contractData.id) {
            setViewingContract(contractData);
        }
    } else {
        setContracts(prev => [...prev, { ...contractData, id: Date.now() }]);
    }
    setActiveModule('');
    setEditItem(null);
  };

  const handleExtendContract = (contract: Contract) => {
      // Logic for extending: clone data but reset ID and dates
      const clonedData = { 
          ...contract, 
          id: undefined, 
          code: '', // Reset code or maybe generate new? UC says "form tạo mới"
          start_date: '', 
          end_date: '', 
          sign_date: '',
          accepted_date: '',
          status_id: 1 // Reset to pending
      };
      setEditItem(clonedData);
      setActiveModule('contractForm');
  };

  const handleDeleteContract = (id: number) => {
      if(window.confirm("Bạn có chắc chắn xoá hợp đồng này?")) {
          setContracts(prev => prev.filter(c => c.id !== id));
      }
  }

  const handleSaveInvoice = (invoiceData: Invoice) => {
      if (invoiceData.id) {
          setInvoices(prev => prev.map(i => i.id === invoiceData.id ? invoiceData : i));
          if (viewingInvoice && viewingInvoice.id === invoiceData.id) {
              setViewingInvoice(invoiceData);
          }
      } else {
          setInvoices(prev => [...prev, { ...invoiceData, id: Date.now() }]);
      }
      setActiveModule('');
      setEditItem(null);
  }

  const handleDeleteInvoice = (id: number) => {
      if(window.confirm("Bạn có chắc chắn xoá hoá đơn này?")) {
          setInvoices(prev => prev.filter(i => i.id !== id));
      }
  }

  const handleSaveAllocation = (allocationData: RevenueAllocation) => {
      if (allocationData.id) {
          setAllocations(prev => prev.map(a => a.id === allocationData.id ? allocationData : a));
      } else {
          setAllocations(prev => [...prev, { ...allocationData, id: Date.now() }]);
      }
      setActiveModule('');
      setEditItem(null);
  }

  const handleDeleteAllocation = (id: number) => {
      if(window.confirm("Bạn có chắc chắn xoá ghi nhận doanh thu này?")) {
          setAllocations(prev => prev.filter(a => a.id !== id));
      }
  }

  const handleSaveAccount = (userData: User) => {
      if (userData.id) {
          setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
      } else {
          setUsers(prev => [...prev, { ...userData, id: Date.now() }]);
      }
      setActiveModule('');
      setEditItem(null);
  };

  const handleDeleteAccount = (id: number) => {
     setUsers(prev => prev.filter(u => u.id !== id));
  };

  // --- Permission Handlers ---

  const handleUpdatePermission = (id: number, field: 'canView' | 'canAdd' | 'canEdit') => {
      setPermissions(prev => prev.map(p => 
          p.id === id ? { ...p, [field]: !p[field] } : p
      ));
  };

  const handleAddRole = (newRole: string) => {
      if (!newRole.trim()) return;
      
      const modules = Array.from(new Set(permissions.map(p => p.module)));
      
      const newPermissions = modules.map((module, index) => ({
          id: Date.now() + index, 
          role: newRole,
          module: module,
          canView: false,
          canAdd: false,
          canEdit: false
      }));

      setPermissions(prev => [...prev, ...newPermissions]);
  };

  const handleDeleteRole = (roleToDelete: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá vai trò '${roleToDelete}' và tất cả quyền hạn liên quan?`)) {
        setPermissions(prev => prev.filter(p => p.role !== roleToDelete));
    }
  };

  const handleSavePermissions = () => {
      alert("Đã lưu cấu hình phân quyền thành công!");
  };


  // --- Render Logic ---

  if (!isLoggedIn) {
      return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className="flex-1 lg:ml-64 min-w-0 transition-all flex flex-col">
            <Header setSidebarOpen={setSidebarOpen} unreadCount={notifications.filter(n => !n.is_read).length} />
            
            <main className="flex-1 p-8 overflow-y-auto">
                {activeModule === 'clientForm' ? (
                    <ClientForm 
                        initialData={editItem} 
                        onBack={() => { setActiveModule(''); setEditItem(null); }} 
                        onSave={handleSaveClient}
                        masterData={masterData}
                        users={users}
                        clients={clients}
                        permissions={permissions}
                    />
                ) : activeModule === 'projectForm' ? (
                    <ProjectForm 
                        initialData={editItem} 
                        clients={clients} 
                        onBack={() => { setActiveModule(''); setEditItem(null); }} 
                        onSave={handleSaveProject} 
                    />
                ) : activeModule === 'contractForm' ? (
                    <ContractForm 
                        initialData={editItem} 
                        projects={projects}
                        clients={clients}
                        onBack={() => { setActiveModule(''); setEditItem(null); }} 
                        onSave={handleSaveContract} 
                    />
                ) : activeModule === 'invoiceForm' ? (
                    <InvoiceForm 
                        initialData={editItem} 
                        projects={projects}
                        clients={clients}
                        onBack={() => { setActiveModule(''); setEditItem(null); }} 
                        onSave={handleSaveInvoice} 
                    />
                ) : activeModule === 'revenueForm' ? (
                    <RevenueForm 
                        initialData={editItem} 
                        invoices={invoices}
                        users={users}
                        onBack={() => { setActiveModule(''); setEditItem(null); }} 
                        onSave={handleSaveAllocation} 
                    />
                ) : activeModule === 'accountForm' ? (
                    <AccountForm 
                        initialData={editItem} 
                        onBack={() => { setActiveModule(''); setEditItem(null); }} 
                        onSave={handleSaveAccount} 
                    />
                ) : activeModule === 'logWorkforce' ? (
                    <LogWorkforceForm onBack={() => setActiveModule('')} />
                ) : (
                    <Routes>
                        <Route path="/" element={<Dashboard invoices={invoices} projects={projects} contracts={contracts} />} />
                        <Route path="/clients" element={
                            viewingClient ? (
                                <ClientDetailView 
                                    client={viewingClient}
                                    projects={projects}
                                    contracts={contracts}
                                    invoices={invoices}
                                    users={users}
                                    onBack={() => setViewingClient(null)}
                                    onEdit={(c: Client) => { setEditItem(c); setActiveModule('clientForm'); }}
                                    onAddProject={() => { setEditItem({ client_id: viewingClient.id }); setActiveModule('projectForm'); }}
                                    onNavigate={(module: string) => { setViewingClient(null); navigate(`/${module}`); }}
                                />
                            ) : (
                                <ClientsModule 
                                    data={clients} 
                                    users={users}
                                    masterData={masterData}
                                    permissions={permissions}
                                    onAdd={() => setActiveModule('clientForm')} 
                                    onEdit={(item: Client) => { setEditItem(item); setActiveModule('clientForm'); }}
                                    onDelete={handleDeleteClient}
                                    onViewDetail={(item: Client) => setViewingClient(item)}
                                />
                            )
                        } />
                        <Route path="/projects" element={
                            viewingProject ? (
                                <ProjectDetailView 
                                    project={viewingProject}
                                    onBack={() => setViewingProject(null)}
                                    onEdit={(p: Project) => { setEditItem(p); setActiveModule('projectForm'); }}
                                    onNavigate={(path) => { setViewingProject(null); navigate(path); }}
                                />
                            ) : (
                                <ProjectsModule 
                                    data={projects} 
                                    clients={clients}
                                    masterData={masterData}
                                    onAdd={() => setActiveModule('projectForm')}
                                    onEdit={(item: Project) => { setEditItem(item); setActiveModule('projectForm'); }}
                                    onDelete={handleDeleteProject}
                                    onViewDetail={(item: Project) => setViewingProject(item)}
                                />
                            )
                        } />
                        <Route path="/contracts" element={
                            viewingContract ? (
                                <ContractDetailView 
                                    contract={viewingContract}
                                    project={projects.find(p => p.id === viewingContract.project_id)}
                                    invoices={invoices}
                                    onBack={() => setViewingContract(null)}
                                    onEdit={(c: Contract) => { setEditItem(c); setActiveModule('contractForm'); }}
                                    onExtend={handleExtendContract}
                                    onNavigate={(path) => { setViewingContract(null); navigate(path); }}
                                />
                            ) : (
                                <ContractsModule 
                                    data={contracts} 
                                    projects={projects} 
                                    clients={clients}
                                    permissions={permissions}
                                    onAdd={() => setActiveModule('contractForm')}
                                    onEdit={(item: Contract) => { setEditItem(item); setActiveModule('contractForm'); }}
                                    onDelete={handleDeleteContract}
                                    onViewDetail={(item: Contract) => setViewingContract(item)}
                                />
                            )
                        } />
                         <Route path="/invoices" element={
                            viewingInvoice ? (
                                <InvoiceDetailView
                                    invoice={viewingInvoice}
                                    project={projects.find(p => p.id === viewingInvoice.project_id)}
                                    client={clients.find(c => c.id === viewingInvoice.client_id)}
                                    contract={contracts.find(c => c.project_id === viewingInvoice.project_id && c.client_id === viewingInvoice.client_id)} // Simplistic matching
                                    onBack={() => setViewingInvoice(null)}
                                    onEdit={(i: Invoice) => { setEditItem(i); setActiveModule('invoiceForm'); }}
                                />
                            ) : (
                                <InvoicesModule 
                                    data={invoices}
                                    statements={statements}
                                    projects={projects}
                                    clients={clients}
                                    contracts={contracts}
                                    onAdd={() => setActiveModule('invoiceForm')} 
                                    onEdit={(item: Invoice) => { setEditItem(item); setActiveModule('invoiceForm'); }}
                                    onDelete={handleDeleteInvoice}
                                    onViewDetail={(item: Invoice) => setViewingInvoice(item)}
                                />
                            )
                        } />
                        <Route path="/revenue" element={
                            <RevenueModule 
                                data={allocations}
                                invoices={invoices}
                                users={users}
                                onAdd={() => setActiveModule('revenueForm')}
                                onEdit={(item: RevenueAllocation) => { setEditItem(item); setActiveModule('revenueForm'); }}
                                onDelete={handleDeleteAllocation}
                            />
                        } />
                        <Route path="/accounts" element={
                            <AccountsModule 
                                data={users} 
                                onAdd={() => setActiveModule('accountForm')} 
                                onDelete={handleDeleteAccount}
                            />
                        } />
                        <Route path="/workforce" element={
                            <WorkforceModule 
                                projects={projects} 
                                clients={clients} 
                                monthlyData={monthlyData} 
                                onLog={() => setActiveModule('logWorkforce')} 
                            />
                        } />
                        <Route path="/settings" element={<MasterModule data={masterData} />} />
                        <Route path="/permissions" element={
                            <PermissionsModule 
                                data={permissions} 
                                onUpdatePermission={handleUpdatePermission}
                                onAddRole={handleAddRole}
                                onDeleteRole={handleDeleteRole}
                                onSave={handleSavePermissions}
                            />
                        } />
                        <Route path="/notifications" element={<NotificationsView notifications={notifications} />} />
                        <Route path="*" element={<div className="text-center text-slate-400 mt-20">Select a module from the sidebar</div>} />
                    </Routes>
                )}
            </main>
        </div>
    </div>
  );
};

const AppWrapper = () => (
    <Router>
        <App />
    </Router>
);

export default AppWrapper;