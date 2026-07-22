module.exports = [
  // Ashoka Textiles Users (Deep Hierarchy)
  {
    id: 'ashoka-coo',
    company_id: 'comp-ashoka',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@ashokatextiles.com',
    role: 'EXEC',
    designation: 'Chief Operating Officer',
    department: 'Executive',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    manager_id: null
  },
  {
    id: 'ashoka-rohan',
    company_id: 'comp-ashoka',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@ashokatextiles.com',
    role: 'MANAGER',
    designation: 'VP of Operations',
    department: 'Operations',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    manager_id: 'ashoka-coo'
  },
  {
    id: 'ashoka-priya',
    company_id: 'comp-ashoka',
    name: 'Priya Nair',
    email: 'priya.nair@ashokatextiles.com',
    role: 'MANAGER',
    designation: 'Supply Chain Tech Lead',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    manager_id: 'ashoka-rohan'
  },
  {
    id: 'ashoka-kavita',
    company_id: 'comp-ashoka',
    name: 'Kavita Singhania',
    email: 'kavita.s@ashokatextiles.com',
    role: 'HR_LEAD',
    designation: 'Head of Human Resources',
    department: 'People & HR',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    manager_id: 'ashoka-coo'
  },
  {
    id: 'ashoka-emp-1',
    company_id: 'comp-ashoka',
    name: 'Arun Kumar',
    email: 'arun.k@ashokatextiles.com',
    role: 'EMPLOYEE',
    designation: 'Senior Systems Engineer',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    manager_id: 'ashoka-priya'
  },
  {
    id: 'ashoka-emp-2',
    company_id: 'comp-ashoka',
    name: 'Deepa Roy',
    email: 'deepa.r@ashokatextiles.com',
    role: 'EMPLOYEE',
    designation: 'Product Designer',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    manager_id: 'ashoka-priya'
  },
  {
    id: 'ashoka-emp-3',
    company_id: 'comp-ashoka',
    name: 'Karthik V',
    email: 'karthik.v@ashokatextiles.com',
    role: 'EMPLOYEE',
    designation: 'Quality Assurance Analyst',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    manager_id: 'ashoka-priya'
  },
  {
    id: 'ashoka-emp-4',
    company_id: 'comp-ashoka',
    name: 'Meera Joshi',
    email: 'meera.j@ashokatextiles.com',
    role: 'EMPLOYEE',
    designation: 'Data & Analytics Specialist',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    manager_id: 'ashoka-priya'
  },
  {
    id: 'ashoka-emp-5',
    company_id: 'comp-ashoka',
    name: 'Suresh Pillai',
    email: 'suresh.p@ashokatextiles.com',
    role: 'EMPLOYEE',
    designation: 'Frontend Developer',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    manager_id: 'ashoka-priya'
  },
  {
    id: 'ashoka-emp-6',
    company_id: 'comp-ashoka',
    name: 'Anita Das',
    email: 'anita.d@ashokatextiles.com',
    role: 'EMPLOYEE',
    designation: 'Backend Developer',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
    manager_id: 'ashoka-priya'
  },

  // Bright Path Consulting Users (Flat Direct Hierarchy)
  {
    id: 'bp-founder',
    company_id: 'comp-brightpath',
    name: 'Vikram Seth',
    email: 'vikram@brightpath.io',
    role: 'EXEC',
    designation: 'Founder & Managing Director',
    department: 'Executive',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    manager_id: null
  },
  {
    id: 'bp-hr',
    company_id: 'comp-brightpath',
    name: 'Sunita Paul',
    email: 'sunita@brightpath.io',
    role: 'HR_LEAD',
    designation: 'People Manager',
    department: 'HR',
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-1',
    company_id: 'comp-brightpath',
    name: 'Ananya Sengupta',
    email: 'ananya@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Senior Strategy Consultant',
    department: 'Strategy',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-2',
    company_id: 'comp-brightpath',
    name: 'Dev Malhotra',
    email: 'dev@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Management Consultant',
    department: 'Operations',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-3',
    company_id: 'comp-brightpath',
    name: 'Ishaan Kapoor',
    email: 'ishaan@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Digital Transformation Lead',
    department: 'Technology',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-4',
    company_id: 'comp-brightpath',
    name: 'Neha Verma',
    email: 'neha@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Organizational Change Analyst',
    department: 'Strategy',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-5',
    company_id: 'comp-brightpath',
    name: 'Rahul Rao',
    email: 'rahul@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Financial Advisor',
    department: 'Finance',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-6',
    company_id: 'comp-brightpath',
    name: 'Riya Saxena',
    email: 'riya@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Marketing Strategist',
    department: 'Growth',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-7',
    company_id: 'comp-brightpath',
    name: 'Siddharth Jain',
    email: 'siddharth@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Principal Associate',
    department: 'Strategy',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    manager_id: 'bp-founder'
  },
  {
    id: 'bp-consult-8',
    company_id: 'comp-brightpath',
    name: 'Tanvi Bhatt',
    email: 'tanvi@brightpath.io',
    role: 'EMPLOYEE',
    designation: 'Client Engagement Lead',
    department: 'Growth',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    manager_id: 'bp-founder'
  }
];
