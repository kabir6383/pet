import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Save, Send, User, MessageSquare, Award, AlertCircle, Sparkles, Target, Plus, Trash2 } from 'lucide-react';

export default function ManagerFeedbackPortal({ activeUser, activeCycle, cycles, parameters }) {
  const [directReports, setDirectReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [scores, setScores] = useState({});
  const [rationales, setRationales] = useState({});
  const [overallNotes, setOverallNotes] = useState('');
  const [goals, setGoals] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [notification, setNotification] = useState(null);
  const [selectedCycleId, setSelectedCycleId] = useState(activeCycle ? activeCycle.id : 'cycle-july-2026');

  useEffect(() => {
    if (activeUser) {
      fetchDirectReports();
    }
  }, [activeUser, selectedCycleId]);

  const fetchDirectReports = async () => {
    try {
      const res = await fetch(`/api/manager/team?managerId=${activeUser.id}&cycleId=${selectedCycleId}`);
      if (res.ok) {
        const data = await res.json();
        setDirectReports(data);
        if (data.length > 0) {
          selectReport(data[0]);
        } else {
          setSelectedReport(null);
        }
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  };

  const selectReport = (report) => {
    setSelectedReport(report);
    setOverallNotes(report.overall_notes || '');

    const newScores = {};
    const newRationales = {};

    parameters.forEach((param) => {
      const existingScore = report.scores ? report.scores.find((s) => s.parameter_id === param.id) : null;
      newScores[param.id] = existingScore ? existingScore.score : 4;
      newRationales[param.id] = existingScore ? existingScore.rationale : '';
    });

    setScores(newScores);
    setRationales(newRationales);
    setGoals(report.goals || []);
  };

  const handleScoreChange = (paramId, val) => {
    setScores((prev) => ({ ...prev, [paramId]: val }));
  };

  const handleRationaleChange = (paramId, text) => {
    setRationales((prev) => ({ ...prev, [paramId]: text }));
  };

  const handleAiAssist = async (param) => {
    setAiLoading((prev) => ({ ...prev, [param.id]: true }));
    try {
      const res = await fetch('/api/ai/suggest-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameter_name: param.name,
          score: scores[param.id] || 4,
          draft_notes: rationales[param.id] || '',
          employee_name: selectedReport ? selectedReport.name : 'Employee'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRationales((prev) => ({ ...prev, [param.id]: data.suggested_rationale }));
      }
    } catch (err) {
      console.error('AI Suggestion error:', err);
    } finally {
      setAiLoading((prev) => ({ ...prev, [param.id]: false }));
    }
  };

  const addGoal = () => {
    setGoals((prev) => [
      ...prev,
      {
        parameter_id: parameters[0].id,
        title: '',
        description: '',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]);
  };

  const updateGoal = (index, field, value) => {
    setGoals((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeGoal = (index) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (submitStatus) => {
    if (!selectedReport) return;

    if (submitStatus === 'SUBMITTED') {
      const emptyParams = parameters.filter((p) => !rationales[p.id] || rationales[p.id].trim() === '');
      if (emptyParams.length > 0) {
        setNotification({
          type: 'error',
          message: `Please provide a written rationale ("why") for all 5 parameters before submitting feedback.`
        });
        return;
      }
    }

    setSaving(true);

    const scorePayload = parameters.map((p) => ({
      parameter_id: p.id,
      score: scores[p.id] || 4,
      rationale: rationales[p.id] || ''
    }));

    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: activeUser.company_id,
          cycle_id: selectedCycleId,
          evaluator_id: activeUser.id,
          evaluatee_id: selectedReport.id,
          status: submitStatus,
          overall_notes: overallNotes,
          scores: scorePayload,
          goals: goals.filter((g) => g.title && g.title.trim() !== '')
        })
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Evaluation for ${selectedReport.name} ${submitStatus === 'SUBMITTED' ? 'submitted successfully.' : 'saved as draft.'}`
        });
        await fetchDirectReports();
      } else {
        const errorData = await res.json();
        setNotification({ type: 'error', message: errorData.error || 'Failed to save feedback.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (directReports.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center max-w-3xl mx-auto my-8 border border-slate-200">
        <User className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Direct Reports Found</h3>
        <p className="text-slate-600 text-xs">
          {activeUser.name} has no direct reports assigned in {activeUser.company_name}.
        </p>
      </div>
    );
  }

  const scoreLabels = {
    1: 'Needs Improvement',
    2: 'Developing',
    3: 'Proficient',
    4: 'Exceeds Expectations',
    5: 'Role Model'
  };

  const submittedCount = directReports.filter(r => r.evaluation_status === 'SUBMITTED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-xl border-l-4 border-l-indigo-600">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Manager Feedback Portal
            </h2>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded border border-indigo-200 uppercase">
              {activeUser.company_name}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Conduct monthly performance evaluations across 5 standard company parameters.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Submission Progress</div>
            <div className="text-sm font-extrabold text-emerald-700">
              {submittedCount} of {directReports.length} Submitted
            </div>
          </div>
          
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="bg-white text-slate-900 border border-slate-300 font-bold text-xs py-2 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                Cycle: {c.name} {c.status === 'ACTIVE' ? '(Current)' : '(Closed)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-lg flex items-center gap-3 border shadow-xs ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Direct Reports List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Direct Reports ({directReports.length})
          </div>

          <div className="space-y-2">
            {directReports.map((report) => {
              const isSelected = selectedReport && selectedReport.id === report.id;
              const isSubmitted = report.evaluation_status === 'SUBMITTED';

              return (
                <button
                  key={report.id}
                  onClick={() => selectReport(report)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 shadow-xs text-indigo-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={report.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={report.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{report.name}</h4>
                      <p className="text-[11px] text-slate-500 font-normal">{report.designation}</p>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Submitted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 Parameter Form */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="glass-panel p-6 rounded-xl space-y-6">
              
              {/* Employee Info Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedReport.avatar_url}
                    alt={selectedReport.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedReport.name}</h3>
                    <p className="text-xs text-slate-500">{selectedReport.designation} • {selectedReport.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave('DRAFT')}
                    disabled={saving}
                    className="btn-secondary flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 text-slate-500" />
                    Save Draft
                  </button>

                  <button
                    onClick={() => handleSave('SUBMITTED')}
                    disabled={saving}
                    className="btn-primary flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Submit Evaluation
                  </button>
                </div>
              </div>

              {/* 5 Fixed Parameters Section */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Performance Parameters (5 Fixed Criteria)
                  </h4>
                  <span className="text-[11px] text-slate-500">Score 1-5 & Mandatory Rationale</span>
                </div>

                {parameters.map((param, index) => {
                  const currentScore = scores[param.id] || 4;
                  const rationaleText = rationales[param.id] || '';
                  const wordCount = rationaleText.trim().split(/\s+/).filter(Boolean).length;
                  const isLowScoreWarning = currentScore <= 2 && wordCount < 8;

                  return (
                    <div key={param.id} className="glass-card p-5 rounded-lg space-y-3.5">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 mr-1.5">#{index + 1}</span>
                          <span className="font-bold text-slate-900 text-sm">{param.name}</span>
                          <p className="text-xs text-slate-500 mt-0.5">{param.description}</p>
                        </div>
                        <div className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                          {scoreLabels[currentScore]} ({currentScore}/5)
                        </div>
                      </div>

                      {/* Score Selector (1 to 5) */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleScoreChange(param.id, val)}
                            className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-all flex flex-col items-center gap-0.5 ${
                              currentScore === val
                                ? val === 5 ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-extrabold'
                                  : val === 4 ? 'bg-blue-50 border-blue-400 text-blue-800 font-extrabold'
                                  : val === 3 ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold'
                                  : 'bg-rose-50 border-rose-400 text-rose-900 font-extrabold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm font-bold">{val}</span>
                            <span className="text-[10px] hidden sm:block font-medium">{scoreLabels[val]}</span>
                          </button>
                        ))}
                      </div>

                      {/* Low Score Guardrail Warning */}
                      {isLowScoreWarning && (
                        <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                          <span>Rating of {currentScore}/5 requires a detailed rationale explaining specific examples and growth areas.</span>
                        </div>
                      )}

                      {/* Rationale Input & AI Coach Button */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                            Written Rationale & Justification
                          </label>

                          <button
                            type="button"
                            onClick={() => handleAiAssist(param)}
                            disabled={aiLoading[param.id]}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-200 flex items-center gap-1 transition"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            {aiLoading[param.id] ? 'Generating...' : 'AI Assist (SBI Framework)'}
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          value={rationaleText}
                          onChange={(e) => handleRationaleChange(param.id, e.target.value)}
                          placeholder={`Explain why you gave score ${currentScore} for ${param.name}...`}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>

                    </div>
                  );
                })}

                {/* Growth Goals Section */}
                <div className="glass-card p-5 rounded-lg space-y-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Actionable Growth Goals (Next Month Cycle)
                    </h5>
                    <button
                      type="button"
                      onClick={addGoal}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded border border-indigo-200 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Goal
                    </button>
                  </div>

                  {goals.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No specific goals assigned for this cycle.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {goals.map((g, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <select
                              value={g.parameter_id}
                              onChange={(e) => updateGoal(idx, 'parameter_id', e.target.value)}
                              className="bg-white text-xs font-bold text-slate-800 border border-slate-300 rounded p-1"
                            >
                              {parameters.map((p) => (
                                <option key={p.id} value={p.id}>Focus: {p.name}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => removeGoal(idx)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={g.title}
                            onChange={(e) => updateGoal(idx, 'title', e.target.value)}
                            placeholder="Goal Title (e.g. Complete Cloud Architecture Certification)..."
                            className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-900 placeholder-slate-400"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Overall Summary Notes */}
                <div className="glass-card p-5 rounded-lg space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Overall Performance Summary & Recommendations
                  </label>
                  <textarea
                    rows={3}
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="General monthly evaluation summary..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => handleSave('DRAFT')}
                    disabled={saving}
                    className="btn-secondary"
                  >
                    Save Draft
                  </button>

                  <button
                    onClick={() => handleSave('SUBMITTED')}
                    disabled={saving}
                    className="btn-primary"
                  >
                    Submit Monthly Feedback
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-xl border border-slate-200">
              <p className="text-slate-500 text-xs">Select a direct report from the roster to begin feedback evaluation.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
