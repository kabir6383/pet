import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, Bell, UserX, UserCheck, ChevronDown, ChevronUp, Download, Grid, BarChart3, Search } from 'lucide-react';

export default function HRCompliancePortal({ activeUser, activeCycle, cycles }) {
  const [selectedCycleId, setSelectedCycleId] = useState(activeCycle ? activeCycle.id : 'cycle-july-2026');
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedManagers, setExpandedManagers] = useState({});
  const [nudgeStatus, setNudgeStatus] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('compliance');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeUser && activeUser.company_id) {
      fetchHRCompliance();
    }
  }, [activeUser, selectedCycleId]);

  const fetchHRCompliance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/compliance?company_id=${activeUser.company_id}&cycle_id=${selectedCycleId}`);
      if (res.ok) {
        const data = await res.json();
        setComplianceData(data);
        const initExpanded = {};
        data.managers.forEach((m) => {
          initExpanded[m.manager.id] = true;
        });
        setExpandedManagers(initExpanded);
      }
    } catch (err) {
      console.error('Error fetching HR compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleManagerExpand = (mgrId) => {
    setExpandedManagers((prev) => ({ ...prev, [mgrId]: !prev[mgrId] }));
  };

  const handleSendNudge = async (manager) => {
    try {
      const res = await fetch('/api/hr/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manager_id: manager.manager.id,
          manager_name: manager.manager.name,
          manager_email: manager.manager.email,
          pending_count: manager.pending_count
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNudgeStatus(data.message);
        setTimeout(() => setNudgeStatus(null), 4500);
      }
    } catch (err) {
      console.error('Error dispatching nudge:', err);
    }
  };

  const exportCSV = () => {
    if (!complianceData) return;
    let csv = 'Manager Name,Manager Email,Total Direct Reports,Submitted Reviews,Pending Reviews,Completion %\n';
    complianceData.managers.forEach((m) => {
      csv += `"${m.manager.name}","${m.manager.email}",${m.total_reports},${m.submitted_count},${m.pending_count},${m.completion_percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HR_Compliance_Report_${selectedCycleId}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center rounded-xl max-w-3xl mx-auto my-8 border border-slate-200">
        <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-600 text-xs font-medium">Calculating HR submission compliance stats & department heatmaps...</p>
      </div>
    );
  }

  if (!complianceData) return null;

  const { summary, managers, department_heatmap, talent_grid } = complianceData;

  const filteredManagers = managers.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.manager.name.toLowerCase().includes(query) ||
      m.manager.email.toLowerCase().includes(query) ||
      m.manager.department.toLowerCase().includes(query)
    );
  });

  const depts = {};
  if (department_heatmap) {
    department_heatmap.forEach((item) => {
      if (!depts[item.department]) depts[item.department] = {};
      depts[item.department][item.parameter_name] = Math.round(item.avg_score * 10) / 10;
    });
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-amber-500">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900 font-heading">HR Leadership & Compliance Portal</h2>
            <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded border border-amber-200 uppercase">
              Kavita's HR Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time monthly review compliance tracking, department heatmaps & 9-box talent matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3"
          >
            <Download className="w-4 h-4 text-amber-600" /> Export CSV Audit
          </button>

          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="bg-white text-slate-900 border border-slate-300 font-bold text-xs py-2 px-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                Cycle: {c.name} {c.status === 'ACTIVE' ? '(Current)' : '(Closed)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('compliance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'compliance'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Manager Compliance
          </button>

          <button
            onClick={() => setActiveSubTab('heatmap')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'heatmap'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Department Heatmap
          </button>

          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'matrix'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4 h-4" /> 9-Box Talent Matrix
          </button>
        </div>

        {activeSubTab === 'compliance' && (
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manager or dept..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {nudgeStatus && (
        <div className="p-3.5 rounded-lg flex items-center justify-between bg-amber-50 border border-amber-300 text-amber-900">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span className="text-xs font-semibold">{nudgeStatus}</span>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl space-y-2 border-l-4 border-l-indigo-600">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Completion</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{summary.overall_completion_rate}%</span>
            <span className="text-xs text-slate-500 font-medium">submitted</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${summary.overall_completion_rate}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-2 border-l-4 border-l-emerald-600">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Reviews</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-700">{summary.total_submitted}</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500">Out of {summary.total_employees} total employees</p>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-2 border-l-4 border-l-rose-600">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Reviews</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-rose-700">{summary.total_pending}</span>
            <Clock className="w-6 h-6 text-rose-600" />
          </div>
          <p className="text-xs text-slate-500">Unsubmitted team evaluations</p>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-2 border-l-4 border-l-amber-600">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Managers</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-800">{summary.total_managers}</span>
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-xs text-slate-500">People leaders</p>
        </div>
      </div>

      {/* Sub-Tab 1: Manager Compliance Table */}
      {activeSubTab === 'compliance' && (
        <div className="glass-panel p-6 rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Manager Submission Compliance Roster
            </h3>
            <span className="text-xs text-slate-500">Click a manager row to inspect direct report details</span>
          </div>

          <div className="space-y-3">
            {filteredManagers.map((mgr) => {
              const isExpanded = expandedManagers[mgr.manager.id];
              const hasPending = mgr.pending_count > 0;

              return (
                <div key={mgr.manager.id} className="glass-card rounded-lg overflow-hidden border border-slate-200">
                  <div
                    onClick={() => toggleManagerExpand(mgr.manager.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <img src={mgr.manager.avatar_url} alt={mgr.manager.name} className="w-10 h-10 rounded-full object-cover border border-slate-300" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{mgr.manager.name}</h4>
                          <span className="text-xs text-slate-500">({mgr.manager.email})</span>
                        </div>
                        <p className="text-xs text-slate-500">{mgr.manager.designation} • {mgr.manager.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right w-36">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                          <span>{mgr.submitted_count}/{mgr.total_reports} Done</span>
                          <span className="text-slate-500 font-normal">({mgr.completion_percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${
                              mgr.completion_percentage === 100 ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${mgr.completion_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {hasPending ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendNudge(mgr);
                          }}
                          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-1.5 px-3 rounded transition"
                        >
                          <Bell className="w-3.5 h-3.5" /> Nudge Manager
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </span>
                      )}

                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-3">
                      {mgr.pending_reports.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                            <UserX className="w-3.5 h-3.5" /> Pending Reviews ({mgr.pending_reports.length} Unsubmitted)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {mgr.pending_reports.map((emp) => (
                              <div key={emp.id} className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-2.5">
                                <img src={emp.avatar_url} alt={emp.name} className="w-7 h-7 rounded-full object-cover border border-rose-300" />
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{emp.name}</div>
                                  <div className="text-[10px] text-rose-800 font-medium">Feedback Pending</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {mgr.submitted_reports.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> Submitted Reviews ({mgr.submitted_reports.length} Complete)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {mgr.submitted_reports.map((emp) => (
                              <div key={emp.id} className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-2.5">
                                <img src={emp.avatar_url} alt={emp.name} className="w-7 h-7 rounded-full object-cover border border-emerald-300" />
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{emp.name}</div>
                                  <div className="text-[10px] text-emerald-800 font-medium">
                                    Submitted {new Date(emp.submitted_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Department Heatmap */}
      {activeSubTab === 'heatmap' && (
        <div className="glass-panel p-6 rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              Department Parameter Score Heatmap
            </h3>
            <span className="text-xs text-slate-500">Average monthly score per parameter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 font-bold">Department</th>
                  <th className="py-3 px-4 text-center">Ownership</th>
                  <th className="py-3 px-4 text-center">Communication</th>
                  <th className="py-3 px-4 text-center">Quality of Work</th>
                  <th className="py-3 px-4 text-center">Problem Solving</th>
                  <th className="py-3 px-4 text-center">Teamwork</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.keys(depts).map((deptName) => {
                  const paramScores = depts[deptName];
                  return (
                    <tr key={deptName} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{deptName}</td>
                      {['Ownership & Accountability', 'Communication & Transparency', 'Quality of Work & Craft', 'Problem Solving & Innovation', 'Teamwork & Leadership'].map((pName) => {
                        const score = paramScores[pName] || 4.0;
                        return (
                          <td key={pName} className="py-3.5 px-4 text-center">
                            <span className={`px-3 py-1 rounded font-bold ${
                              score >= 4.5 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              score >= 4.0 ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}>
                              {score} / 5
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: 9-Box Talent Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="glass-panel p-6 rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-4 h-4 text-amber-600" />
              9-Box Performance & Potential Matrix
            </h3>
            <span className="text-xs text-slate-500">Plotted based on multi-month evaluation averages</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
              <span className="font-bold text-teal-800 block text-xs uppercase tracking-wider">High Potential / Core Performance</span>
              {talent_grid && talent_grid.filter(t => t.avg_performance >= 4.5).map(t => (
                <div key={t.id} className="bg-white p-2.5 rounded text-slate-900 font-bold border border-teal-200 shadow-xs">
                  {t.name} ({Math.round(t.avg_performance * 10)/10} avg)
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
              <span className="font-bold text-emerald-800 block text-xs uppercase tracking-wider">Star Performers (Role Models)</span>
              {talent_grid && talent_grid.filter(t => t.avg_performance >= 4.8).map(t => (
                <div key={t.id} className="bg-white p-2.5 rounded text-slate-900 font-bold border border-emerald-200 shadow-xs">
                  {t.name} ({Math.round(t.avg_performance * 10)/10} avg)
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2.5">
              <span className="font-bold text-blue-800 block text-xs uppercase tracking-wider">Consistent High Value</span>
              {talent_grid && talent_grid.filter(t => t.avg_performance >= 4.0 && t.avg_performance < 4.5).map(t => (
                <div key={t.id} className="bg-white p-2.5 rounded text-slate-900 font-bold border border-blue-200 shadow-xs">
                  {t.name} ({Math.round(t.avg_performance * 10)/10} avg)
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
