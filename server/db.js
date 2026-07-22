const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const companiesData = require('./data/companies');
const parametersData = require('./data/parameters');
const cyclesData = require('./data/cycles');
const usersData = require('./data/users');
const { rohanPriyaEvaluations, ashokaTeamMembers, genericRationales, bpConsultants } = require('./data/evaluations');
const goalsData = require('./data/goals');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDB() {
  await runAsync('PRAGMA foreign_keys = ON;');

  // 1. Companies
  await runAsync(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      industry TEXT NOT NULL
    );
  `);

  // 2. Feedback Parameters
  await runAsync(`
    CREATE TABLE IF NOT EXISTS feedback_parameters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );
  `);

  // 3. Users
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR_LEAD', 'EXEC')),
      designation TEXT NOT NULL,
      department TEXT NOT NULL,
      avatar_url TEXT,
      manager_id TEXT,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );
  `);

  // 4. Evaluation Cycles
  await runAsync(`
    CREATE TABLE IF NOT EXISTS evaluation_cycles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLOSED')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL
    );
  `);

  // 5. Evaluations Header
  await runAsync(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      cycle_id TEXT NOT NULL,
      evaluator_id TEXT NOT NULL,
      evaluatee_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED')),
      overall_notes TEXT,
      submitted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (cycle_id) REFERENCES evaluation_cycles(id),
      FOREIGN KEY (evaluator_id) REFERENCES users(id),
      FOREIGN KEY (evaluatee_id) REFERENCES users(id),
      UNIQUE(cycle_id, evaluatee_id)
    );
  `);

  // 6. Evaluation Scores & Rationale
  await runAsync(`
    CREATE TABLE IF NOT EXISTS evaluation_scores (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL,
      parameter_id TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
      rationale TEXT NOT NULL,
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
      FOREIGN KEY (parameter_id) REFERENCES feedback_parameters(id),
      UNIQUE(evaluation_id, parameter_id)
    );
  `);

  // 7. Actionable Growth Goals
  await runAsync(`
    CREATE TABLE IF NOT EXISTS evaluation_goals (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL,
      evaluatee_id TEXT NOT NULL,
      parameter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_date DATE,
      status TEXT CHECK (status IN ('ACTIVE', 'COMPLETED')),
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
      FOREIGN KEY (evaluatee_id) REFERENCES users(id),
      FOREIGN KEY (parameter_id) REFERENCES feedback_parameters(id)
    );
  `);

  await seedData();
}

async function seedData() {
  const companyCount = await getAsync('SELECT COUNT(*) as count FROM companies');
  if (companyCount && companyCount.count > 0) {
    const goalCount = await getAsync('SELECT COUNT(*) as count FROM evaluation_goals');
    if (goalCount && goalCount.count === 0) {
      await seedGoals();
    }
    return;
  }

  console.log('Seeding database using modular datasets (Ashoka Textiles & Bright Path Consulting)...');

  // Seed Companies from modular companiesData
  for (const c of companiesData) {
    await runAsync(
      `INSERT INTO companies (id, name, domain, industry) VALUES (?, ?, ?, ?)`,
      [c.id, c.name, c.domain, c.industry]
    );
  }

  // Seed 5 Fixed Parameters from modular parametersData
  for (const p of parametersData) {
    await runAsync(
      `INSERT INTO feedback_parameters (id, name, category, description, order_index) VALUES (?, ?, ?, ?, ?)`,
      [p.id, p.name, p.category, p.description, p.order_index]
    );
  }

  // Seed Evaluation Cycles from modular cyclesData
  for (const cy of cyclesData) {
    await runAsync(
      `INSERT INTO evaluation_cycles (id, name, year, month, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cy.id, cy.name, cy.year, cy.month, cy.status, cy.start_date, cy.end_date]
    );
  }

  // Seed Users from modular usersData
  for (const u of usersData) {
    await runAsync(
      `INSERT INTO users (id, company_id, name, email, role, designation, department, avatar_url, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.company_id, u.name, u.email, u.role, u.designation, u.department, u.avatar_url, u.manager_id]
    );
  }

  // Seed Evaluations: Rohan reviewing Priya
  for (const ev of rohanPriyaEvaluations) {
    const evalId = `eval-rohan-priya-${ev.cycle}`;
    await runAsync(
      `INSERT INTO evaluations (id, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [evalId, 'comp-ashoka', ev.cycle, 'ashoka-rohan', 'ashoka-priya', ev.status, 'Priya continues to excel as a technical lead.', ev.date]
    );
    for (let i = 0; i < 5; i++) {
      await runAsync(
        `INSERT INTO evaluation_scores (id, evaluation_id, parameter_id, score, rationale) VALUES (?, ?, ?, ?, ?)`,
        [`score-${evalId}-${i+1}`, evalId, `param-${i+1}`, ev.scores[i], ev.comments[i]]
      );
    }
  }

  // Seed Evaluations: Priya reviewing team members
  for (const emp of ashokaTeamMembers) {
    const mayId = `eval-priya-${emp.id}-cycle-may-2026`;
    await runAsync(
      `INSERT INTO evaluations (id, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [mayId, 'comp-ashoka', 'cycle-may-2026', 'ashoka-priya', emp.id, 'SUBMITTED', 'Solid performance throughout May.', '2026-05-29 17:00:00']
    );
    for (let i = 0; i < 5; i++) {
      await runAsync(
        `INSERT INTO evaluation_scores (id, evaluation_id, parameter_id, score, rationale) VALUES (?, ?, ?, ?, ?)`,
        [`score-${mayId}-${i+1}`, mayId, `param-${i+1}`, emp.mayScore[i], genericRationales[i % 4][i]]
      );
    }

    const juneId = `eval-priya-${emp.id}-cycle-june-2026`;
    await runAsync(
      `INSERT INTO evaluations (id, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [juneId, 'comp-ashoka', 'cycle-june-2026', 'ashoka-priya', emp.id, 'SUBMITTED', 'Great progress in June sprint delivery.', '2026-06-28 15:30:00']
    );
    for (let i = 0; i < 5; i++) {
      await runAsync(
        `INSERT INTO evaluation_scores (id, evaluation_id, parameter_id, score, rationale) VALUES (?, ?, ?, ?, ?)`,
        [`score-${juneId}-${i+1}`, juneId, `param-${i+1}`, emp.juneScore[i], genericRationales[(i+1) % 4][i]]
      );
    }

    if (!emp.julyPending && emp.julyScore) {
      const julyId = `eval-priya-${emp.id}-cycle-july-2026`;
      await runAsync(
        `INSERT INTO evaluations (id, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [julyId, 'comp-ashoka', 'cycle-july-2026', 'ashoka-priya', emp.id, 'SUBMITTED', 'Strong momentum into Q3.', '2026-07-18 10:00:00']
      );
      for (let i = 0; i < 5; i++) {
        await runAsync(
          `INSERT INTO evaluation_scores (id, evaluation_id, parameter_id, score, rationale) VALUES (?, ?, ?, ?, ?)`,
          [`score-${julyId}-${i+1}`, julyId, `param-${i+1}`, emp.julyScore[i], genericRationales[(i+2) % 4][i]]
        );
      }
    }
  }

  // Seed Bright Path Consultants
  for (const consultant of bpConsultants) {
    for (const cycleId of ['cycle-may-2026', 'cycle-june-2026']) {
      const evalId = `eval-bp-${consultant.id}-${cycleId}`;
      await runAsync(
        `INSERT INTO evaluations (id, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [evalId, 'comp-brightpath', cycleId, 'bp-founder', consultant.id, 'SUBMITTED', 'Excellent client deliverables.', '2026-06-25 12:00:00']
      );
      for (let i = 0; i < 5; i++) {
        await runAsync(
          `INSERT INTO evaluation_scores (id, evaluation_id, parameter_id, score, rationale) VALUES (?, ?, ?, ?, ?)`,
          [`score-${evalId}-${i+1}`, evalId, `param-${i+1}`, 4 + (i % 2), `High standards in consulting engagements.`]
        );
      }
    }

    if (consultant.julySubmitted && consultant.scores) {
      const julyId = `eval-bp-${consultant.id}-cycle-july-2026`;
      await runAsync(
        `INSERT INTO evaluations (id, company_id, cycle_id, evaluator_id, evaluatee_id, status, overall_notes, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [julyId, 'comp-brightpath', 'cycle-july-2026', 'bp-founder', consultant.id, 'SUBMITTED', 'Outstanding Q3 client outcome.', '2026-07-15 14:20:00']
      );
      for (let i = 0; i < 5; i++) {
        await runAsync(
          `INSERT INTO evaluation_scores (id, evaluation_id, parameter_id, score, rationale) VALUES (?, ?, ?, ?, ?)`,
          [`score-${julyId}-${i+1}`, julyId, `param-${i+1}`, consultant.scores[i], `Strong execution on strategic deliverables.`]
        );
      }
    }
  }

  await seedGoals();
  console.log('Modular seed dataset successfully initialized!');
}

async function seedGoals() {
  for (const g of goalsData) {
    await runAsync(
      `INSERT OR IGNORE INTO evaluation_goals (id, evaluation_id, evaluatee_id, parameter_id, title, description, target_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [g.id, g.evalId, g.empId, g.paramId, g.title, g.desc, g.targetDate, g.status]
    );
  }
}

module.exports = {
  db,
  initDB,
  runAsync,
  allAsync,
  getAsync
};

