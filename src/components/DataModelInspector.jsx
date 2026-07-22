import React, { useState, useEffect } from 'react';
import { Database, Table, Code2, Server, CheckCircle2, Layers } from 'lucide-react';

export default function DataModelInspector() {
  const [schemaData, setSchemaData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const res = await fetch('/api/schema/tables');
      if (res.ok) {
        const data = await res.json();
        setSchemaData(data);
      }
    } catch (err) {
      console.error('Error fetching schema:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl max-w-3xl mx-auto my-8 border border-slate-200">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600 text-sm font-medium">Loading backend SQLite schema inspector...</p>
      </div>
    );
  }

  if (!schemaData) return null;

  const currentTable = schemaData[selectedTable];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-purple-600">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Backend Data Model & Schema Inspector</h2>
            <span className="bg-purple-50 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-200">
              Live SQLite Database
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Proving that the underlying relational schema cleanly supports deep & flat manager hierarchies, multi-tenancy, monthly cycles, 5 fixed parameters, and HR compliance queries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          <Server className="w-4 h-4 text-purple-600" />
          <span>SQLite Engine Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-purple-200 bg-purple-50/20">
          <div className="flex items-center gap-2 text-purple-800 font-bold text-sm font-heading">
            <Layers className="w-4 h-4" />
            Self-Referencing Org Hierarchy
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            <code className="text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold">users.manager_id</code> references <code className="text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold">users.id</code>. Supports N-level deep structures & flat structures.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-indigo-200 bg-indigo-50/20">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm font-heading">
            <Database className="w-4 h-4" />
            Multi-Tenant Isolation
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Every evaluation header & user belongs to a <code className="text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded font-mono font-bold">company_id</code> foreign key, enabling multi-company pilot isolation.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm font-heading">
            <CheckCircle2 className="w-4 h-4" />
            5 Parameter Score Integrity
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            <code className="text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">evaluation_scores</code> maintains 1-to-5 integer score constraints & written rationale per fixed parameter.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 font-heading">
            Database Tables ({Object.keys(schemaData).length})
          </div>

          <div className="space-y-2">
            {Object.keys(schemaData).map((tblName) => {
              const tbl = schemaData[tblName];
              const isSelected = selectedTable === tblName;

              return (
                <button
                  key={tblName}
                  onClick={() => setSelectedTable(tblName)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Table className={`w-4 h-4 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span className="font-mono text-sm font-bold">{tblName}</span>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {tbl.rowCount} rows
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {currentTable && (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold font-mono text-slate-900">Table: {currentTable.name}</h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                  {currentTable.rowCount} Total Records
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">Columns Schema</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase font-heading">
                        <th className="py-2 px-3">Column</th>
                        <th className="py-2 px-3">Data Type</th>
                        <th className="py-2 px-3">Nullable</th>
                        <th className="py-2 px-3">Primary Key</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs font-mono">
                      {currentTable.columns.map((col) => (
                        <tr key={col.cid} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-purple-900">{col.name}</td>
                          <td className="py-2.5 px-3 text-indigo-700">{col.type}</td>
                          <td className="py-2.5 px-3 text-slate-600">{col.notnull ? 'NO' : 'YES'}</td>
                          <td className="py-2.5 px-3 text-amber-700">{col.pk ? 'YES (PK)' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">Sample Seed Rows (Top 3)</h4>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono text-xs overflow-x-auto text-emerald-400">
                  <pre>{JSON.stringify(currentTable.sampleData, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
