import React, { useState, useEffect } from 'react';
import PersonaSwitcher from './components/PersonaSwitcher';
import ManagerFeedbackPortal from './components/ManagerFeedbackPortal';
import EmployeeFeedbackPortal from './components/EmployeeFeedbackPortal';
import HRCompliancePortal from './components/HRCompliancePortal';
import HierarchyVisualizer from './components/HierarchyVisualizer';
import DataModelInspector from './components/DataModelInspector';

import { Users, Award, ShieldCheck, GitFork, Database } from 'lucide-react';

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [activeTab, setActiveTab] = useState('manager');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, usersRes, cyclesRes, paramsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/users'),
        fetch('/api/cycles'),
        fetch('/api/parameters')
      ]);

      if (compRes.ok && usersRes.ok && cyclesRes.ok && paramsRes.ok) {
        const compData = await compRes.json();
        const usersData = await usersRes.json();
        const cyclesData = await cyclesRes.json();
        const paramsData = await paramsRes.json();

        setCompanies(compData);
        setUsers(usersData);
        setCycles(cyclesData);
        setParameters(paramsData);

        const defaultUser = usersData.find((u) => u.id === 'ashoka-priya') || usersData[0];
        setActiveUser(defaultUser);
      } else {
        setError('Failed to fetch data from backend API endpoints.');
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Could not connect to backend server. Please verify backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setActiveUser(user);
    if (user.role === 'HR_LEAD') {
      setActiveTab('hr');
    } else if (user.role === 'EMPLOYEE') {
      setActiveTab('employee');
    } else if (user.role === 'MANAGER' || user.role === 'EXEC') {
      setActiveTab('manager');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-bold tracking-tight font-heading">Initializing Enterprise PET System</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">Connecting to database & loading workspace dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Backend Server Offline</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchInitialData}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const activeCycle = cycles.find((c) => c.status === 'ACTIVE') || cycles[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <PersonaSwitcher
        users={users}
        activeUser={activeUser}
        onSelectUser={handleSelectUser}
        companies={companies}
      />

      <div className="bg-white border-b border-slate-200 px-6 py-2.5 sticky top-[73px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-3">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab('manager')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'manager'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Manager Feedback Portal
            </button>

            <button
              onClick={() => setActiveTab('employee')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'employee'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              Employee Feedback & Trends
            </button>

            <button
              onClick={() => setActiveTab('hr')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'hr'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              HR Compliance Portal (Kavita)
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 min-w-max">
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'hierarchy'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GitFork className="w-4 h-4" />
              Org Hierarchy
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'schema'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              Data Model Inspector
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'manager' && (
          <ManagerFeedbackPortal
            activeUser={activeUser}
            activeCycle={activeCycle}
            cycles={cycles}
            parameters={parameters}
          />
        )}

        {activeTab === 'employee' && (
          <EmployeeFeedbackPortal activeUser={activeUser} />
        )}

        {activeTab === 'hr' && (
          <HRCompliancePortal
            activeUser={activeUser}
            activeCycle={activeCycle}
            cycles={cycles}
          />
        )}

        {activeTab === 'hierarchy' && (
          <HierarchyVisualizer users={users} />
        )}

        {activeTab === 'schema' && (
          <DataModelInspector />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 px-6 text-center text-xs text-slate-500 font-medium">
        Performance Evaluation Tool (PET) • Multi-Tenant Enterprise Application
      </footer>
    </div>
  );
}
