
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getMockData } from './services/mockData';
import Dashboard from './components/Dashboard';
import { Client, Project, Invoice, Contract, User, Permission, Notification, MonthlyData, MasterCategory, RevenueAllocation, BankStatement } from './types';

import { Header, Sidebar, LoginScreen } from './components/Layout';
import { ClientForm, ClientsModule, ClientDetailView } from './components/Clients';
import { ProjectForm, ProjectsModule, ProjectDetailView } from './components/Projects';
import { ContractForm, ContractsModule, ContractDetailView } from './components/Contracts';
import { InvoiceForm, InvoicesModule, InvoiceDetailView } from './components/Invoices';
import { RevenueModule } from './components/Revenue';
import { LogWorkforceForm, WorkforceModule } from './components/Workforce';
import { AccountsModule } from './components/Accounts';
import { PermissionsModule } from './components/Permissions';
import { MasterModule } from './components/Settings';
import { NotificationsView } from './components/Notifications';

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const initialData = getMockData();
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [contracts, setContracts] = useState<Contract[]>(initialData.contracts);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [statements] = useState<BankStatement[]>(initialData.statements);
  const [users] = useState<User[]>(initialData.users);
  const [notifications] = useState<Notification[]>(initialData.notifications);
  const [monthlyData] = useState<MonthlyData[]>(initialData.monthlyData);
  const [permissions] = useState<Permission[]>(initialData.permissions);
  const [masterData] = useState<MasterCategory[]>(initialData.masterCategories);

  const [currentUser] = useState<User>({ ...initialData.users[0], role_main: 'Super Admin' });
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    setViewMode('list');
    setSelectedItem(null);
  }, [location.pathname]);

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  // Logic lưu dữ liệu chung cho các module
  const handleSave = (moduleName: string, formData: any) => {
      if (moduleName === 'project') {
          if (formData.id) {
              setProjects(prev => prev.map(p => p.id === formData.id ? { ...p, ...formData } : p));
          } else {
              const newProject = { 
                  ...formData, 
                  id: projects.length + 1,
                  status_id: 2 // Default Active
              };
              setProjects(prev => [newProject, ...prev]);
          }
      } else if (moduleName === 'client') {
          if (formData.id) {
              setClients(prev => prev.map(c => c.id === formData.id ? { ...c, ...formData } : c));
          } else {
              setClients(prev => [{ ...formData, id: clients.length + 1 }, ...prev]);
          }
      }
      setViewMode('list');
      setSelectedItem(null);
  };

  const renderModule = (moduleName: string, ListComp: any, DetailComp: any, FormComp: any, dataProps: any) => {
    if (viewMode === 'form') return <FormComp {...dataProps} initialData={selectedItem} onBack={() => setViewMode('list')} onSave={(data: any) => handleSave(moduleName, data)} />;
    if (viewMode === 'detail' && selectedItem) return <DetailComp {...dataProps} {...(moduleName === 'client' ? {client: selectedItem} : moduleName === 'project' ? {project: selectedItem} : moduleName === 'contract' ? {contract: selectedItem} : {invoice: selectedItem})} onBack={() => setViewMode('list')} onEdit={() => setViewMode('form')} onNavigate={navigate} />;
    return <ListComp {...dataProps} onAdd={() => { setSelectedItem(null); setViewMode('form'); }} onViewDetail={(item: any) => { setSelectedItem(item); setViewMode('detail'); }} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} currentUser={currentUser} />
      <div className="flex-1 lg:ml-64 min-w-0 transition-all flex flex-col">
        <Header setSidebarOpen={setSidebarOpen} unreadCount={notifications.filter(n => !n.is_read).length} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard invoices={invoices} projects={projects} contracts={contracts} clients={clients} />} />
            <Route path="/clients" element={renderModule('client', ClientsModule, ClientDetailView, ClientForm, { data: clients, users, masterData, projects, contracts, invoices, permissions })} />
            <Route path="/projects" element={renderModule('project', ProjectsModule, ProjectDetailView, ProjectForm, { data: projects, clients, masterData, contracts })} />
            <Route path="/contracts" element={renderModule('contract', ContractsModule, ContractDetailView, ContractForm, { data: contracts, projects, clients, invoices, permissions })} />
            <Route path="/invoices" element={renderModule('invoice', InvoicesModule, InvoiceDetailView, InvoiceForm, { data: invoices, statements, projects, clients, contracts })} />
            <Route path="/revenue" element={<RevenueModule invoices={invoices} users={users} />} />
            <Route path="/workforce" element={viewMode === 'form' ? <LogWorkforceForm onBack={() => setViewMode('list')} divisions={['Division 1', 'Division 2', 'Global']} /> : <WorkforceModule projects={projects} clients={clients} monthlyData={monthlyData} onLog={() => setViewMode('form')} />} />
            <Route path="/accounts" element={<AccountsModule data={users} permissions={permissions} currentUser={currentUser} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} />} />
            <Route path="/permissions" element={<PermissionsModule data={permissions} />} />
            <Route path="/settings" element={<MasterModule data={masterData} />} />
            <Route path="/notifications" element={<NotificationsView notifications={notifications} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default () => <Router><AppContent /></Router>;
