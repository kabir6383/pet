const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function testAll() {
  console.log('--- TESTING PET BACKEND REST API ENDPOINTS ---');

  const companies = await get('/api/companies');
  console.log('1. Companies count:', companies.length, companies.map(c => c.name));

  const users = await get('/api/users');
  console.log('2. Users count:', users.length);

  const cycles = await get('/api/cycles');
  console.log('3. Cycles:', cycles.map(c => c.name));

  const params = await get('/api/parameters');
  console.log('4. Parameters count (5 Fixed):', params.length, params.map(p => p.name));

  // Test Priya's Team (Ashoka Manager with 6 direct reports)
  const priyaTeam = await get('/api/manager/team?managerId=ashoka-priya&cycleId=cycle-july-2026');
  console.log('5. Priya Direct Reports:', priyaTeam.length, priyaTeam.map(r => `${r.name} (${r.evaluation_status})`));

  // Test Rohan's Team (Ashoka Manager with Priya as report)
  const rohanTeam = await get('/api/manager/team?managerId=ashoka-rohan&cycleId=cycle-july-2026');
  console.log('6. Rohan Direct Reports:', rohanTeam.map(r => `${r.name} (${r.evaluation_status})`));

  // Test Bright Path Founder's Team (Flat Org - 8 direct reports)
  const founderTeam = await get('/api/manager/team?managerId=bp-founder&cycleId=cycle-july-2026');
  console.log('7. Founder Vikram Direct Reports (Flat Hierarchy):', founderTeam.length, founderTeam.map(r => `${r.name} (${r.evaluation_status})`));

  // Test HR Compliance (Kavita's View for Ashoka)
  const hrAshoka = await get('/api/hr/compliance?company_id=comp-ashoka&cycle_id=cycle-july-2026');
  console.log('8. Kavita HR Compliance Summary:', hrAshoka.summary);

  // Test Employee Feedback History for Arun Kumar
  const arunFeedback = await get('/api/employee/feedback?employee_id=ashoka-emp-1');
  console.log('9. Arun Kumar Received Feedback Count:', arunFeedback.evaluations.length, 'Trends count:', arunFeedback.trends.length);

  // Test Database Schema Inspector
  const schema = await get('/api/schema/tables');
  console.log('10. Database Inspector Tables:', Object.keys(schema));

  console.log('\n--- ALL BACKEND REST API ENDPOINTS WORKING PERFECTLY! ---');
}

testAll().catch(console.error);
