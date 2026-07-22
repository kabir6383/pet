import React, { useState } from 'react';
import { GitFork, ChevronRight, User, Building2, Shield, ArrowDown } from 'lucide-react';

export default function HierarchyVisualizer({ users }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('comp-ashoka');

  const companyUsers = users.filter(u => u.company_id === selectedCompanyId);
  const roots = companyUsers.filter(u => !u.manager_id);

  const getDirectReports = (managerId) => {
    return companyUsers.filter(u => u.manager_id === managerId);
  };

  const renderNode = (node, depth = 0) => {
    const reports = getDirectReports(node.id);
    const hasReports = reports.length > 0;

    return (
      <div key={node.id} className="space-y-3 relative">
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
          depth === 0 ? 'bg-indigo-50/80 border-indigo-200 shadow-sm' :
          depth === 1 ? 'bg-purple-50/60 border-purple-200' :
          depth === 2 ? 'bg-blue-50/40 border-blue-200' :
          'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <img
              src={node.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={node.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 font-heading">{node.name}</h4>
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  node.role === 'EXEC' ? 'bg-purple-100 text-purple-800' :
                  node.role === 'MANAGER' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {node.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{node.designation} • {node.department}</p>
            </div>
          </div>

          {hasReports && (
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 border border-indigo-200 px-2.5 py-1 rounded-full">
              Manages {reports.length} Reports
            </span>
          )}
        </div>

        {hasReports && (
          <div className="pl-6 border-l-2 border-slate-200 space-y-3 pt-1">
            {reports.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-sky-600">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-7 h-7 text-sky-600" />
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Org Hierarchy Structure Visualizer</h2>
            <span className="bg-sky-50 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-sky-200">
              Data Model Verification
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Demonstrating how the relational <code className="text-sky-700">manager_id</code> field handles both deep multi-layer management & flat direct report structures.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setSelectedCompanyId('comp-ashoka')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
              selectedCompanyId === 'comp-ashoka'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ashoka Textiles (Deep 4-Level)
          </button>
          <button
            onClick={() => setSelectedCompanyId('comp-brightpath')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
              selectedCompanyId === 'comp-brightpath'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bright Path (Flat Founder Structure)
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-sky-200 bg-sky-50/30">
        {selectedCompanyId === 'comp-ashoka' ? (
          <div className="space-y-1 text-xs text-slate-700 font-medium">
            <span className="font-bold text-sky-800 text-sm font-heading">Ashoka Textiles Scenario:</span>
            <p>
              Rajesh Sharma (COO) <span className="text-sky-600 font-bold">$\rightarrow$</span> Rohan Mehta (VP Ops) <span className="text-sky-600 font-bold">$\rightarrow$</span> Priya Nair (Tech Lead) <span className="text-sky-600 font-bold">$\rightarrow$</span> 6 Team Members (Arun, Deepa, Karthik, Meera, Suresh, Anita).
            </p>
            <p className="text-slate-500 italic">
              Priya gives monthly feedback to her 6 team members. Priya herself receives monthly feedback from Rohan Mehta!
            </p>
          </div>
        ) : (
          <div className="space-y-1 text-xs text-slate-700 font-medium">
            <span className="font-bold text-sky-800 text-sm font-heading">Bright Path Consulting Scenario:</span>
            <p>
              Vikram Seth (Founder & Managing Director) directly manages all 8 Consultants (Ananya, Dev, Ishaan, Neha, Rahul, Riya, Siddharth, Tanvi) with <strong>no middle management layer</strong>.
            </p>
            <p className="text-slate-500 italic">
              All 8 consultants report directly to <code className="text-sky-800 font-bold">manager_id = bp-founder</code>.
            </p>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        {roots.map((rootNode) => renderNode(rootNode))}
      </div>

    </div>
  );
}
