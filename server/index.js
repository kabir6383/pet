const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, runAsync, allAsync, getAsync } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
initDB()
  .then(() => console.log('Database initialized successfully.'))
  .catch((err) => console.error('Database initialization error:', err));

// --- REST API ENDPOINTS ---

// 1. Get Companies
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await allAsync('SELECT * FROM companies ORDER BY name ASC');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Users
app.get('/api/users', async (req, res) => {
  try {
    const company_id = req.query.company_id || req.query.companyId;
    let sql = `
      SELECT u.*, c.name as company_name, m.name as manager_name 
      FROM users u 
      JOIN companies c ON u.company_id = c.id
      LEFT JOIN users m ON u.manager_id = m.id
    `;
    const params = [];
    if (company_id) {
      sql += ' WHERE u.company_id = ?';
      params.push(company_id);
    }
    sql += ' ORDER BY u.name ASC';

    const users = await allAsync(sql, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Evaluation Cycles
app.get('/api/cycles', async (req, res) => {
  try {
    const cycles = await allAsync('SELECT * FROM evaluation_cycles ORDER BY year DESC, month DESC');
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Fixed 5 Parameters
app.get('/api/parameters', async (req, res) => {
  try {
    const parameters = await allAsync('SELECT * FROM feedback_parameters ORDER BY order_index ASC');
    res.json(parameters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Manager Portal: Direct Reports & Submission Status
app.get('/api/manager/team', async (req, res) => {
  try {
    const manager_id = req.query.manager_id || req.query.managerId;
    const cycle_id = req.query.cycle_id || req.query.cycleId;

    if (!manager_id || !cycle_id) {
      return res.status(400).json({ error: 'manager_id and cycle_id are required' });
    }

    const directReports = await allAsync(
      `SELECT u.*, 
              e.id as evaluation_id, 
              e.status as evaluation_status, 
              e.submitted_at, 
              e.overall_notes
       FROM users u
       LEFT JOIN evaluations e ON u.id = e.evaluatee_id AND e.cycle_id = ? AND e.evaluator_id = ?
       WHERE u.manager_id = ?
       ORDER BY u.name ASC`,
      [cycle_id, manager_id, manager_id]
    );

    for (const report of directReports) {
      if (report.evaluation_id) {
        const scores = await allAsync(
          `SELECT es.*, fp.name as parameter_name, fp.description as parameter_description
           FROM evaluation_scores es
           JOIN feedback_parameters fp ON es.parameter_id = fp.id
           WHERE es.evaluation_id = ?
           ORDER BY fp.order_index ASC`,
          [report.evaluation_id]
        );
        report.scores = scores;

        const goals = await allAsync(
          `SELECT eg.*, fp.name as parameter_name FROM evaluation_goals eg
           JOIN feedback_parameters fp ON eg.parameter_id = fp.id
           WHERE eg.evaluation_id = ?`,
          [report.evaluation_id]
        );
        report.goals = goals;
      } else {
        report.scores = [];
        report.goals = [];
        report.evaluation_status = 'PENDING';
      }
    }

    res.json(directReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Submit or Save Draft Feedback
app.post('/api/feedback/submit', async (req, res) => {
  try {
    const { company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, scores, goals } = req.body;

    if (!company_id || !cycle_id || !evaluator_id || !evaluatee_id || !scores || !Array.isArray(scores)) {
      return res.status(400).json({ error: 'Missing required parameters or scores array.' });
    }

    let existing = await getAsync(
      'SELECT id FROM evaluations WHERE cycle_id = ? AND evaluatee_id = ?',
      [cycle_id, evaluatee_id]
    );

    const evalId = existing ? existing.id : `eval-${evaluator_id}-${evaluatee_id}-${cycle_id}-${Date.now()}`;
    const submittedAt = status === 'SUBMITTED' ? new Date().toISOString() : null;

    if (existing) {
      await runAsync(
        `UPDATE evaluations SET status = ?, overall_notes = ?, submitted_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, overall_notes || '', submittedAt, evalId]
      );
      await runAsync('DELETE FROM evaluation_scores WHERE evaluation_id = ?', [evalId]);
    } else {
      await runAsync(
        `INSERT INTO evaluations (id, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [evalId, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes || '', submittedAt]
      );
    }

    for (const sc of scores) {
      const scoreId = `score-${evalId}-${sc.parameter_id}`;
      await runAsync(
        `INSERT INTO evaluation_scores (id, evaluation_id, parameter_id, score, rationale) VALUES (?, ?, ?, ?, ?)`,
        [scoreId, evalId, sc.parameter_id, sc.score, sc.rationale]
      );
    }

    // Insert Goals if provided
    if (goals && Array.isArray(goals)) {
      for (const g of goals) {
        const goalId = `goal-${evalId}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        await runAsync(
          `INSERT INTO evaluation_goals (id, evaluation_id, evaluatee_id, parameter_id, title, description, target_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [goalId, evalId, evaluatee_id, g.parameter_id, g.title, g.description || '', g.target_date || null, 'ACTIVE']
        );
      }
    }

    res.json({ message: 'Feedback saved successfully!', evaluation_id: evalId, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. AI Feedback Coach & Quality Assistant
app.post('/api/ai/suggest-feedback', (req, res) => {
  const { parameter_name, score, draft_notes, employee_name } = req.body;

  const name = employee_name || 'The employee';
  const templates = {
    5: `Situation: During recent project deliverables, ${name} demonstrated top-tier mastery in ${parameter_name}.\nBehavior: Consistently took complete ownership, exceeded quality standards, and proactively mentored team members.\nImpact: Accelerated sprint completion by 25% and established a benchmark for team excellence.`,
    4: `Situation: In day-to-day operations, ${name} shows high competence in ${parameter_name}.\nBehavior: Reliably executes assigned scope with minimal oversight and maintains active stakeholder updates.\nImpact: Ensured smooth project delivery and built strong confidence among cross-functional peers.`,
    3: `Situation: Across standard tasks, ${name} meets expected criteria in ${parameter_name}.\nBehavior: Completes assigned duties reliably, though occasionally requires guidance on complex edge cases.\nImpact: Standard project deliverables are fulfilled on schedule; focus on proactive communication will unlock further growth.`,
    2: `Situation: On recent sprint tasks, ${name} faced challenges regarding ${parameter_name}.\nBehavior: Experienced delays in resolving blockers independently and required frequent manager intervention.\nImpact: Affected sprint velocity; establishing structured weekly check-ins will help build self-sufficiency.`
  };

  const suggestedText = templates[score] || templates[3];
  res.json({
    parameter_name,
    score,
    suggested_rationale: draft_notes && draft_notes.trim().length > 5 ? `${draft_notes.trim()}\n\n[AI Polished Structure]:\n${suggestedText}` : suggestedText
  });
});

// 8. Employee Portal: Received Feedback & Trends
app.get('/api/employee/feedback', async (req, res) => {
  try {
    const employee_id = req.query.employee_id || req.query.employeeId;
    if (!employee_id) {
      return res.status(400).json({ error: 'employee_id is required' });
    }

    const history = await allAsync(
      `SELECT e.*, c.name as cycle_name, c.year, c.month, u.name as evaluator_name, u.designation as evaluator_designation
       FROM evaluations e
       JOIN evaluation_cycles c ON e.cycle_id = c.id
       JOIN users u ON e.evaluator_id = u.id
       WHERE e.evaluatee_id = ? AND e.status = 'SUBMITTED'
       ORDER BY c.year ASC, c.month ASC`,
      [employee_id]
    );

    for (const ev of history) {
      const scores = await allAsync(
        `SELECT es.*, fp.name as parameter_name, fp.description as parameter_description
         FROM evaluation_scores es
         JOIN feedback_parameters fp ON es.parameter_id = fp.id
         WHERE es.evaluation_id = ?
         ORDER BY fp.order_index ASC`,
        [ev.id]
      );
      ev.scores = scores;

      const goals = await allAsync(
        `SELECT eg.*, fp.name as parameter_name FROM evaluation_goals eg
         JOIN feedback_parameters fp ON eg.parameter_id = fp.id
         WHERE eg.evaluation_id = ?`,
        [ev.id]
      );
      ev.goals = goals;
    }

    const parameters = await allAsync('SELECT * FROM feedback_parameters ORDER BY order_index ASC');
    const trendMap = {};

    parameters.forEach((p) => {
      trendMap[p.id] = { id: p.id, name: p.name, data: [] };
    });

    history.forEach((ev) => {
      ev.scores.forEach((s) => {
        if (trendMap[s.parameter_id]) {
          trendMap[s.parameter_id].data.push({
            cycle: ev.cycle_name,
            score: s.score,
            rationale: s.rationale
          });
        }
      });
    });

    // Active growth goals across evaluations
    const activeGoals = await allAsync(
      `SELECT eg.*, fp.name as parameter_name, c.name as cycle_name
       FROM evaluation_goals eg
       JOIN feedback_parameters fp ON eg.parameter_id = fp.id
       JOIN evaluations e ON eg.evaluation_id = e.id
       JOIN evaluation_cycles c ON e.cycle_id = c.id
       WHERE eg.evaluatee_id = ?
       ORDER BY eg.target_date ASC`,
      [employee_id]
    );

    res.json({
      evaluations: history,
      trends: Object.values(trendMap),
      goals: activeGoals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. HR Compliance Dashboard & Advanced Analytics
app.get('/api/hr/compliance', async (req, res) => {
  try {
    const company_id = req.query.company_id || req.query.companyId;
    const cycle_id = req.query.cycle_id || req.query.cycleId;

    if (!company_id || !cycle_id) {
      return res.status(400).json({ error: 'company_id and cycle_id are required' });
    }

    const managers = await allAsync(
      `SELECT DISTINCT m.id, m.name, m.email, m.designation, m.department, m.avatar_url
       FROM users m
       JOIN users report ON report.manager_id = m.id
       WHERE m.company_id = ?
       ORDER BY m.name ASC`,
      [company_id]
    );

    const complianceData = [];
    let totalDirectReportsInCompany = 0;
    let totalSubmittedInCompany = 0;
    let totalPendingInCompany = 0;

    for (const mgr of managers) {
      const reports = await allAsync(
        `SELECT u.id, u.name, u.email, u.designation, u.department, u.avatar_url,
                e.id as evaluation_id, e.status as evaluation_status, e.submitted_at
         FROM users u
         LEFT JOIN evaluations e ON u.id = e.evaluatee_id AND e.cycle_id = ?
         WHERE u.manager_id = ?
         ORDER BY u.name ASC`,
        [cycle_id, mgr.id]
      );

      const submitted = reports.filter((r) => r.evaluation_status === 'SUBMITTED');
      const pending = reports.filter((r) => r.evaluation_status !== 'SUBMITTED');

      totalDirectReportsInCompany += reports.length;
      totalSubmittedInCompany += submitted.length;
      totalPendingInCompany += pending.length;

      complianceData.push({
        manager: mgr,
        total_reports: reports.length,
        submitted_count: submitted.length,
        pending_count: pending.length,
        completion_percentage: reports.length > 0 ? Math.round((submitted.length / reports.length) * 100) : 100,
        submitted_reports: submitted,
        pending_reports: pending
      });
    }

    // Department Analytics Heatmap Data
    const deptScores = await allAsync(
      `SELECT u.department, fp.name as parameter_name, AVG(es.score) as avg_score
       FROM evaluation_scores es
       JOIN evaluations e ON es.evaluation_id = e.id
       JOIN users u ON e.evaluatee_id = u.id
       JOIN feedback_parameters fp ON es.parameter_id = fp.id
       WHERE u.company_id = ? AND e.cycle_id = ? AND e.status = 'SUBMITTED'
       GROUP BY u.department, fp.id`,
      [company_id, cycle_id]
    );

    // 9-Box Talent Matrix Data (Performance vs Potential based on avg score)
    const talentGrid = await allAsync(
      `SELECT u.id, u.name, u.designation, u.department, u.avatar_url,
              AVG(es.score) as avg_performance,
              COUNT(DISTINCT e.id) as total_evals
       FROM users u
       JOIN evaluations e ON e.evaluatee_id = u.id
       JOIN evaluation_scores es ON es.evaluation_id = e.id
       WHERE u.company_id = ? AND e.status = 'SUBMITTED'
       GROUP BY u.id`,
      [company_id]
    );

    res.json({
      company_id,
      cycle_id,
      summary: {
        total_managers: managers.length,
        total_employees: totalDirectReportsInCompany,
        total_submitted: totalSubmittedInCompany,
        total_pending: totalPendingInCompany,
        overall_completion_rate: totalDirectReportsInCompany > 0 ? Math.round((totalSubmittedInCompany / totalDirectReportsInCompany) * 100) : 100
      },
      managers: complianceData,
      department_heatmap: deptScores,
      talent_grid: talentGrid
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. HR Nudge / Reminder API
app.post('/api/hr/nudge', async (req, res) => {
  const { manager_id, manager_name, manager_email, pending_count } = req.body;
  res.json({
    success: true,
    message: `Reminder nudge successfully dispatched to ${manager_name} (${manager_email}) for ${pending_count} pending team reviews!`
  });
});

// 11. Database Schema & Inspector Endpoint
app.get('/api/schema/tables', async (req, res) => {
  try {
    const tables = ['companies', 'feedback_parameters', 'users', 'evaluation_cycles', 'evaluations', 'evaluation_scores', 'evaluation_goals'];
    const inspector = {};

    for (const tbl of tables) {
      const columns = await allAsync(`PRAGMA table_info(${tbl})`);
      const count = await getAsync(`SELECT COUNT(*) as count FROM ${tbl}`);
      const sample = await allAsync(`SELECT * FROM ${tbl} LIMIT 3`);
      inspector[tbl] = {
        name: tbl,
        columns,
        rowCount: count ? count.count : 0,
        sampleData: sample
      };
    }

    res.json(inspector);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`PET Server running on http://localhost:${PORT}`);
});
