import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Award, Calendar, TrendingUp, UserCheck, MessageSquare, Sparkles, Target } from 'lucide-react';

export default function EmployeeFeedbackPortal({ activeUser }) {
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeUser) {
      fetchEmployeeFeedback();
    }
  }, [activeUser]);

  const fetchEmployeeFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employee/feedback?employee_id=${activeUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbackHistory(data.evaluations);
        setTrends(data.trends);
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error('Error fetching employee feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center rounded-xl max-w-3xl mx-auto my-8 border border-slate-200">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-slate-600 text-xs font-medium">Loading employee performance records & analytics...</p>
      </div>
    );
  }

  if (feedbackHistory.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-10 text-center max-w-3xl mx-auto my-8 space-y-3 border border-slate-200">
        <Award className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No Finalized Feedback Found</h3>
        <p className="text-slate-600 text-xs">
          {activeUser.name} has not received any finalized monthly evaluations yet.
        </p>
      </div>
    );
  }

  const cycleMap = {};
  trends.forEach((t) => {
    t.data.forEach((d) => {
      if (!cycleMap[d.cycle]) {
        cycleMap[d.cycle] = { cycle: d.cycle };
      }
      cycleMap[d.cycle][t.name] = d.score;
    });
  });
  const chartData = Object.values(cycleMap);

  const latestEvaluation = feedbackHistory[feedbackHistory.length - 1];
  const radarData = latestEvaluation ? latestEvaluation.scores.map((s) => ({
    parameter: s.parameter_name.split(' ')[0],
    fullName: s.parameter_name,
    score: s.score,
    fullMark: 5
  })) : [];

  const getScoreBadgeStyle = (score) => {
    if (score === 5) return 'score-5';
    if (score === 4) return 'score-4';
    if (score === 3) return 'score-3';
    if (score === 2) return 'score-2';
    return 'score-1';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Employee Overview Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-indigo-600">
        <div className="flex items-center gap-3.5">
          <img
            src={activeUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={activeUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{activeUser.name}</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                Employee Performance Portal
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeUser.designation} • {activeUser.department} ({activeUser.company_name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 px-5 rounded-lg border border-slate-200">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Evaluations Completed</div>
            <div className="text-base font-extrabold text-indigo-700">{feedbackHistory.length} Cycles</div>
          </div>
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* Active Growth Goals */}
      {goals.length > 0 && (
        <div className="glass-panel p-5 rounded-xl space-y-3 border-l-4 border-l-emerald-600">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Growth Goals & Development Milestones</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {goals.map((g) => (
              <div key={g.id} className="glass-card p-3.5 rounded-lg space-y-1.5 border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {g.parameter_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Target: {g.target_date || 'Next Cycle'}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{g.title}</h4>
                {g.description && <p className="text-xs text-slate-600 leading-relaxed">{g.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Multi-Month Line Chart */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Monthly Score History (1-5 Scale)</h3>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="cycle" stroke="#64748b" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '12px' }} />
                <Line type="monotone" dataKey="Ownership & Accountability" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Communication & Transparency" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Quality of Work & Craft" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Problem Solving & Innovation" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Teamwork & Leadership" stroke="#db2777" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-slate-200 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Ownership</span>
            <span className="flex items-center gap-1 text-blue-700"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Communication</span>
            <span className="flex items-center gap-1 text-purple-700"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Quality</span>
            <span className="flex items-center gap-1 text-amber-700"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Problem Solving</span>
            <span className="flex items-center gap-1 text-pink-700"><span className="w-2.5 h-2.5 rounded-full bg-pink-600"></span> Teamwork</span>
          </div>
        </div>

        {/* Latest Parameter Profile Radar Chart */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Latest Parameter Profile</h3>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="parameter" tick={{ fill: '#334155', fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 5]} angle={30} stroke="#94a3b8" />
                <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-xs text-slate-500">
            Current Cycle: <strong className="text-slate-900">{latestEvaluation ? latestEvaluation.cycle_name : 'N/A'}</strong>
          </div>
        </div>

      </div>

      {/* Monthly Feedback Timeline Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Monthly Evaluation History</h3>
        </div>

        <div className="space-y-4">
          {feedbackHistory.slice().reverse().map((ev) => (
            <div key={ev.id} className="glass-panel p-6 rounded-xl space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{ev.cycle_name} Evaluation</h4>
                    <p className="text-xs text-slate-600">
                      Evaluated by <strong className="text-slate-900">{ev.evaluator_name}</strong> ({ev.evaluator_designation})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Submitted on {new Date(ev.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ev.scores.map((sc) => (
                  <div key={sc.id} className="glass-card p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{sc.parameter_name}</h5>
                      <span className={`score-badge ${getScoreBadgeStyle(sc.score)}`}>
                        {sc.score}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs text-slate-800 space-y-1">
                      <div className="flex items-center gap-1 text-slate-500 font-bold text-[11px]">
                        <MessageSquare className="w-3 h-3 text-indigo-600" />
                        Manager Written Rationale:
                      </div>
                      <p className="italic leading-relaxed">{sc.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>

              {ev.overall_notes && (
                <div className="bg-indigo-50/80 border border-indigo-200 p-3.5 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider block">
                    Overall Monthly Summary & Growth Guidance
                  </span>
                  <p className="text-slate-800 leading-relaxed">{ev.overall_notes}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
