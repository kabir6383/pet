import React from 'react';
import { Building2, ChevronRight, UserCheck, Shield, ChevronDown } from 'lucide-react';

export default function PersonaSwitcher({ users, activeUser, onSelectUser, companies }) {
  const personaGroups = [
    {
      title: 'Ashoka Textiles (Multi-Level Deep Org)',
      companyId: 'comp-ashoka',
      personas: [
        { id: 'ashoka-priya', name: 'Priya Nair', roleLabel: 'Manager (6 Reports)', desc: 'Gives feedback to 6 team members; receives feedback from Rohan' },
        { id: 'ashoka-rohan', name: 'Rohan Mehta', roleLabel: 'VP Operations (Priya’s Mgr)', desc: 'Gives feedback to Priya; reports to COO' },
        { id: 'ashoka-kavita', name: 'Kavita Singhania', roleLabel: 'HR Lead', desc: 'Checks monthly feedback submission compliance' },
        { id: 'ashoka-emp-1', name: 'Arun Kumar', roleLabel: 'Senior Developer', desc: 'Views historical scores & monthly feedback' }
      ]
    },
    {
      title: 'Bright Path Consulting (Flat Direct Org)',
      companyId: 'comp-brightpath',
      personas: [
        { id: 'bp-founder', name: 'Vikram Seth', roleLabel: 'Founder & CEO (8 Reports)', desc: 'Gives feedback directly to 8 consultants' },
        { id: 'bp-consult-1', name: 'Ananya Sengupta', roleLabel: 'Consultant', desc: 'Receives direct founder feedback & tracks monthly performance' },
        { id: 'bp-hr', name: 'Sunita Paul', roleLabel: 'HR Lead', desc: 'Tracks flat organization evaluation compliance' }
      ]
    }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Corporate Brand Header */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs text-sm">
            PET
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-base tracking-tight">
                Performance Evaluation Tool
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Pilot Multi-Tenant
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">Monthly Performance & HR Oversight System</p>
          </div>
        </div>

        {/* Right Active User & Persona Switcher */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-end">
          
          {activeUser && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-3">
              <img
                src={activeUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={activeUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{activeUser.name}</span>
                  <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                    activeUser.role === 'HR_LEAD' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    activeUser.role === 'EXEC' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    activeUser.role === 'MANAGER' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {activeUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{activeUser.company_name}</span>
                  <span>•</span>
                  <span>{activeUser.designation}</span>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Selector Dropdown */}
          <div className="relative">
            <select
              value={activeUser ? activeUser.id : ''}
              onChange={(e) => {
                const selected = users.find(u => u.id === e.target.value);
                if (selected) onSelectUser(selected);
              }}
              className="appearance-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3.5 pr-8 rounded-lg border border-slate-800 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="" disabled className="bg-white text-slate-900">Switch User Persona...</option>
              {personaGroups.map((group) => (
                <optgroup key={group.companyId} label={group.title} className="bg-slate-100 text-indigo-900 font-bold">
                  {group.personas.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-slate-900 font-medium">
                      {p.name} ({p.roleLabel})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
