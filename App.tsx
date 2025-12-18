import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getMockData } from './services/mockData';
import Dashboard from './components/Dashboard';
import { Client, Project, Invoice, Contract, User, Permission, Notification, MonthlyData, MasterCategory, RevenueAllocation, BankStatement } from './types';

// Import modular components
import { Header, Sidebar, LoginScreen } from './components/Layout';
import { ClientForm, ClientsModule, ClientDetailView } from './components/Clients';
import { ProjectForm, ProjectsModule, ProjectDetailView } from './components/Projects';
import { ContractForm, ContractsModule, ContractDetailView } from './components/Contracts';
import { InvoiceForm, InvoicesModule, InvoiceDetailView } from './components/Invoices';
import { RevenueForm, RevenueModule } from './components/Revenue';
import { LogWorkforceForm, WorkforceModule } from './components/Workforce';
import { AccountForm, AccountsModule } from './components/Accounts';
import { PermissionsModule } from './components/Permissions';
import { MasterModule } from './components/Settings';
import { NotificationsView } from './components/Notifications';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
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

  // Giả lập User hiện tại (Super Admin)
  const [currentUser, setCurrentUser] = useState<User>({
    ...initialData.users[0],
    role_main: 'Super Admin' 
  });

  const [activeModule, setActiveModule] = useState<string>(''); 
  const [editItem, setEditItem] = useState<any>(null); 
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    setEditItem(null);
    setActiveModule('');
  }, [location.pathname]);

  // --- CRUD Handlers cho Tài khoản ---
  const handleSaveAccount = (userData: User) => {
      const now = new Date();
      const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}, ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

      if (userData.id) {
          setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData, updated_at: formattedDate } : u));
      } else {
          setUsers(prev => [...prev, { ...userData, id: Date.now(), created_at: formattedDate, updated_at: formattedDate }]);
      }
      setActiveModule('');
      setEditItem(null);
  };

  const handleDeleteAccount = (id: number) => {
     // EX003: Xử lý xóa thực tế trong state
     setUsers(prev => prev.filter(u => u.id !== id));
  };

  if (!isLoggedIn) {
      return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100">
        <Sidebar isOpen={sidebarOpen} currentUser={currentUser} />
        
        <div className="flex-1 lg:ml-64 min-w-0 transition-all flex flex-col">
            <Header 
                setSidebarOpen={setSidebarOpen} 
                unreadCount={notifications.filter(n => !n.is_read).length} 
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
            />
            
            <main className="flex-1 p-8 overflow-y-auto">
                {activeModule === 'accountForm' && (
                    <AccountForm 
                        initialData={editItem} 
                        permissions={permissions}
                        currentUser={currentUser}
                        allUsers={users}
                        onBack={() => { setActiveModule(''); setEditItem(null); }} 
                        onSave={handleSaveAccount} 
                    />
                )}
                
                <Routes>
                    <Route path="/" element={<Dashboard invoices={invoices} projects={projects} contracts={contracts} clients={clients} />} />
                    <Route path="/accounts" element={
                        <AccountsModule 
                            data={users} 
                            permissions={permissions}
                            currentUser={currentUser}
                            onAdd={() => setActiveModule('accountForm')} 
                            onEdit={(u: User) => { setEditItem(u); setActiveModule('accountForm'); }}
                            onDelete={handleDeleteAccount}
                        />
                    } />
                    <Route path="/clients" element={<ClientsModule data={clients} users={users} masterData={masterData} permissions={permissions} onAdd={() => navigate('/clients')} />} />
                    <Route path="/projects" element={<ProjectsModule data={projects} clients={clients} masterData={masterData} onAdd={() => navigate('/projects')} />} />
                    <Route path="/contracts" element={<ContractsModule data={contracts} projects={projects} clients={clients} permissions={permissions} onAdd={() => navigate('/contracts')} />} />
                    <Route path="/invoices" element={<InvoicesModule data={invoices} statements={statements} projects={projects} clients={clients} contracts={contracts} onAdd={() => navigate('/invoices')} />} />
                    <Route path="/revenue" element={<RevenueModule data={allocations} invoices={invoices} users={users} onAdd={() => navigate('/revenue')} />} />
                    <Route path="/workforce" element={<WorkforceModule projects={projects} clients={clients} monthlyData={monthlyData} onLog={() => navigate('/workforce')} />} />
                    <Route path="/settings" element={<MasterModule data={masterData} />} />
                    <Route path="/permissions" element={<PermissionsModule data={permissions} />} />
                    <Route path="/notifications" element={<NotificationsView notifications={notifications} />} />
                </Routes>
            </main>
        </div>
    </div>
  );
};

export default () => <Router><App /></Router>;
