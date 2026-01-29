/**
 * Real interview questions from top tech companies
 */

export interface CompanyQuestion {
  id: string;
  company: string;
  companyLogo: string;
  role: string;
  level: string;
  question: string;
  category: 'technical' | 'behavioral' | 'system-design';
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export const COMPANY_QUESTIONS: CompanyQuestion[] = [
  // Google
  {
    id: 'google-1',
    company: 'Google',
    companyLogo: '🔵',
    role: 'Frontend',
    level: 'senior',
    question: 'Design a real-time collaborative text editor like Google Docs. How would you handle concurrent edits?',
    category: 'system-design',
    difficulty: 5,
    tags: ['system-design', 'real-time', 'collaboration'],
  },
  {
    id: 'google-2',
    company: 'Google',
    companyLogo: '🔵',
    role: 'Frontend',
    level: 'mid',
    question: 'Implement a debounce function from scratch. Explain when you would use debounce vs throttle.',
    category: 'technical',
    difficulty: 3,
    tags: ['javascript', 'performance', 'optimization'],
  },
  {
    id: 'google-3',
    company: 'Google',
    companyLogo: '🔵',
    role: 'Backend',
    level: 'senior',
    question: 'Design YouTube video upload and processing pipeline. How do you handle large files and transcoding?',
    category: 'system-design',
    difficulty: 5,
    tags: ['system-design', 'video', 'scalability'],
  },

  // Meta/Facebook
  {
    id: 'meta-1',
    company: 'Meta',
    companyLogo: '🔷',
    role: 'Frontend',
    level: 'mid',
    question: 'How would you implement infinite scroll with virtualization? What are the performance considerations?',
    category: 'technical',
    difficulty: 4,
    tags: ['react', 'performance', 'virtualization'],
  },
  {
    id: 'meta-2',
    company: 'Meta',
    companyLogo: '🔷',
    role: 'Frontend',
    level: 'senior',
    question: 'Design the News Feed system. How do you rank posts and handle real-time updates?',
    category: 'system-design',
    difficulty: 5,
    tags: ['system-design', 'ranking', 'real-time'],
  },
  {
    id: 'meta-3',
    company: 'Meta',
    companyLogo: '🔷',
    role: 'Backend',
    level: 'mid',
    question: 'Explain how you would design a URL shortener like bit.ly. What database would you use?',
    category: 'system-design',
    difficulty: 3,
    tags: ['system-design', 'database', 'hashing'],
  },

  // VNG
  {
    id: 'vng-1',
    company: 'VNG',
    companyLogo: '🟢',
    role: 'Backend',
    level: 'mid',
    question: 'Thiết kế hệ thống chat real-time cho Zalo. Làm sao đảm bảo tin nhắn không bị mất?',
    category: 'system-design',
    difficulty: 4,
    tags: ['system-design', 'messaging', 'reliability'],
  },
  {
    id: 'vng-2',
    company: 'VNG',
    companyLogo: '🟢',
    role: 'Backend',
    level: 'senior',
    question: 'Thiết kế hệ thống thanh toán ZaloPay. Làm sao đảm bảo transaction không bị duplicate?',
    category: 'system-design',
    difficulty: 5,
    tags: ['system-design', 'payment', 'idempotency'],
  },
  {
    id: 'vng-3',
    company: 'VNG',
    companyLogo: '🟢',
    role: 'Frontend',
    level: 'junior',
    question: 'Giải thích event loop trong JavaScript. Cho ví dụ về microtask và macrotask.',
    category: 'technical',
    difficulty: 3,
    tags: ['javascript', 'async', 'event-loop'],
  },

  // FPT Software
  {
    id: 'fpt-1',
    company: 'FPT Software',
    companyLogo: '🟠',
    role: 'Fullstack',
    level: 'junior',
    question: 'So sánh REST API và GraphQL. Khi nào nên dùng cái nào?',
    category: 'technical',
    difficulty: 2,
    tags: ['api', 'rest', 'graphql'],
  },
  {
    id: 'fpt-2',
    company: 'FPT Software',
    companyLogo: '🟠',
    role: 'Backend',
    level: 'mid',
    question: 'Giải thích SOLID principles với ví dụ thực tế trong project của bạn.',
    category: 'technical',
    difficulty: 3,
    tags: ['design-patterns', 'solid', 'oop'],
  },
  {
    id: 'fpt-3',
    company: 'FPT Software',
    companyLogo: '🟠',
    role: 'QA',
    level: 'mid',
    question: 'Bạn sẽ test một API endpoint như thế nào? Kể các test cases cần cover.',
    category: 'technical',
    difficulty: 2,
    tags: ['testing', 'api', 'qa'],
  },

  // Shopee
  {
    id: 'shopee-1',
    company: 'Shopee',
    companyLogo: '🟧',
    role: 'Backend',
    level: 'senior',
    question: 'Design flash sale system that handles millions of concurrent users. How to prevent overselling?',
    category: 'system-design',
    difficulty: 5,
    tags: ['system-design', 'high-concurrency', 'inventory'],
  },
  {
    id: 'shopee-2',
    company: 'Shopee',
    companyLogo: '🟧',
    role: 'Frontend',
    level: 'mid',
    question: 'How would you optimize a product listing page with thousands of items? Discuss lazy loading strategies.',
    category: 'technical',
    difficulty: 3,
    tags: ['performance', 'lazy-loading', 'optimization'],
  },
  {
    id: 'shopee-3',
    company: 'Shopee',
    companyLogo: '🟧',
    role: 'Data',
    level: 'mid',
    question: 'Design a recommendation system for e-commerce. What algorithms would you use?',
    category: 'system-design',
    difficulty: 4,
    tags: ['machine-learning', 'recommendation', 'data'],
  },

  // Grab
  {
    id: 'grab-1',
    company: 'Grab',
    companyLogo: '🟩',
    role: 'Backend',
    level: 'senior',
    question: 'Design a ride-matching system. How do you match drivers with riders efficiently?',
    category: 'system-design',
    difficulty: 5,
    tags: ['system-design', 'geolocation', 'matching'],
  },
  {
    id: 'grab-2',
    company: 'Grab',
    companyLogo: '🟩',
    role: 'Mobile',
    level: 'mid',
    question: 'How would you implement real-time location tracking with battery optimization?',
    category: 'technical',
    difficulty: 4,
    tags: ['mobile', 'gps', 'optimization'],
  },
  {
    id: 'grab-3',
    company: 'Grab',
    companyLogo: '🟩',
    role: 'Backend',
    level: 'mid',
    question: 'Explain how you would implement surge pricing. What factors would you consider?',
    category: 'system-design',
    difficulty: 4,
    tags: ['pricing', 'algorithm', 'demand'],
  },

  // Behavioral questions (common across companies)
  {
    id: 'behavioral-1',
    company: 'Common',
    companyLogo: '💼',
    role: 'All',
    level: 'all',
    question: 'Tell me about a time you had to make a difficult technical decision with incomplete information.',
    category: 'behavioral',
    difficulty: 3,
    tags: ['decision-making', 'leadership', 'uncertainty'],
  },
  {
    id: 'behavioral-2',
    company: 'Common',
    companyLogo: '💼',
    role: 'All',
    level: 'all',
    question: 'Describe a situation where you disagreed with your manager. How did you handle it?',
    category: 'behavioral',
    difficulty: 3,
    tags: ['conflict', 'communication', 'professionalism'],
  },
  {
    id: 'behavioral-3',
    company: 'Common',
    companyLogo: '💼',
    role: 'All',
    level: 'all',
    question: 'Tell me about a project that failed. What did you learn from it?',
    category: 'behavioral',
    difficulty: 3,
    tags: ['failure', 'learning', 'growth'],
  },
];

export const COMPANIES = [
  { name: 'Google', logo: '🔵', color: 'bg-blue-500' },
  { name: 'Meta', logo: '🔷', color: 'bg-blue-600' },
  { name: 'VNG', logo: '🟢', color: 'bg-green-500' },
  { name: 'FPT Software', logo: '🟠', color: 'bg-orange-500' },
  { name: 'Shopee', logo: '🟧', color: 'bg-orange-600' },
  { name: 'Grab', logo: '🟩', color: 'bg-green-600' },
];

export function getQuestionsByCompany(company: string): CompanyQuestion[] {
  return COMPANY_QUESTIONS.filter(q => q.company === company);
}

export function getQuestionsByRole(role: string): CompanyQuestion[] {
  return COMPANY_QUESTIONS.filter(q => q.role.toLowerCase() === role.toLowerCase() || q.role === 'All');
}

export function getQuestionsByDifficulty(difficulty: number): CompanyQuestion[] {
  return COMPANY_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getRandomQuestions(count: number, filters?: {
  company?: string;
  role?: string;
  category?: string;
}): CompanyQuestion[] {
  let questions = [...COMPANY_QUESTIONS];
  
  if (filters?.company) {
    questions = questions.filter(q => q.company === filters.company);
  }
  if (filters?.role) {
    questions = questions.filter(q => q.role.toLowerCase() === filters.role.toLowerCase() || q.role === 'All');
  }
  if (filters?.category) {
    questions = questions.filter(q => q.category === filters.category);
  }
  
  return questions.sort(() => Math.random() - 0.5).slice(0, count);
}
