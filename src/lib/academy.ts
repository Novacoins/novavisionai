export type Course = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  lessons: string[];
};

export const COURSES: Record<string, Course> = {
  ai: {
    id: "ai",
    title: "Artificial Intelligence",
    subtitle: "Foundations, prompting, and building with AI",
    emoji: "🧠",
    color: "from-fuchsia-400 to-purple-500",
    lessons: [
      "AI Basics: What is Artificial Intelligence?",
      "How Large Language Models Work",
      "Prompt Engineering Fundamentals",
      "Advanced Prompting Techniques",
      "Using ChatGPT Effectively",
      "Working with Google Gemini",
      "Anthropic Claude for Long-Form Tasks",
      "Grok and Open Alternatives",
      "AI Image Generation Explained",
      "AI Automation & Workflows",
      "Building AI Agents",
      "AI for Business",
      "Practical AI Projects",
    ],
  },
  programming: {
    id: "programming",
    title: "Programming",
    subtitle: "From HTML to full-stack apps",
    emoji: "💻",
    color: "from-emerald-400 to-green-500",
    lessons: [
      "HTML Fundamentals",
      "CSS & Layout with Flexbox and Grid",
      "JavaScript Basics",
      "Modern JavaScript (ES6+)",
      "React Fundamentals",
      "React Hooks Deep Dive",
      "Flutter & Dart for Mobile",
      "Python for Beginners",
      "Node.js and Express",
      "SQL Essentials",
      "Firebase for App Backends",
      "Working with REST APIs",
      "Git and Version Control",
      "Collaborating on GitHub",
    ],
  },
  business: {
    id: "business",
    title: "Business",
    subtitle: "Build and grow a company",
    emoji: "📈",
    color: "from-amber-400 to-orange-500",
    lessons: [
      "Entrepreneurship Mindset",
      "Finding a Winning Business Idea",
      "Marketing Fundamentals",
      "Building a Brand",
      "Sales Fundamentals",
      "Customer Service Excellence",
      "Launching a Startup",
      "Building an Online Business",
    ],
  },
  marketing: {
    id: "marketing",
    title: "Marketing",
    subtitle: "Grow an audience and drive sales",
    emoji: "📣",
    color: "from-rose-400 to-pink-500",
    lessons: [
      "Facebook Ads Fundamentals",
      "TikTok Marketing Strategy",
      "Instagram Growth",
      "YouTube for Creators",
      "SEO Basics",
      "Email Marketing that Converts",
      "Affiliate Marketing",
    ],
  },
  english: {
    id: "english",
    title: "English",
    subtitle: "Read, write, speak, and listen better",
    emoji: "🗣️",
    color: "from-sky-400 to-blue-500",
    lessons: [
      "Essential Grammar",
      "Building Vocabulary",
      "Speaking with Confidence",
      "Listening Skills",
      "Reading Comprehension",
      "Writing Clearly",
    ],
  },
  productivity: {
    id: "productivity",
    title: "Productivity",
    subtitle: "Do more of what matters",
    emoji: "⚡",
    color: "from-yellow-400 to-amber-500",
    lessons: [
      "Time Management Systems",
      "Setting Meaningful Goals",
      "Deep Work",
      "Building Habits that Stick",
      "Focus Techniques",
    ],
  },
  design: {
    id: "design",
    title: "Graphic Design",
    subtitle: "Design tools and visual fundamentals",
    emoji: "🎨",
    color: "from-pink-400 to-rose-500",
    lessons: [
      "Design with Canva",
      "Photoshop Basics",
      "Figma for UI Design",
      "Color Theory",
      "Typography Essentials",
      "Branding Fundamentals",
      "UI Design Principles",
    ],
  },
  cybersecurity: {
    id: "cybersecurity",
    title: "Cybersecurity",
    subtitle: "Stay safe online",
    emoji: "🛡️",
    color: "from-slate-400 to-slate-600",
    lessons: [
      "Strong Passwords & Password Managers",
      "Recognizing Phishing",
      "Malware and How to Avoid It",
      "Using a VPN",
      "Encryption Explained",
      "Safe Browsing Habits",
    ],
  },
  finance: {
    id: "finance",
    title: "Finance",
    subtitle: "Money skills for real life",
    emoji: "💰",
    color: "from-lime-400 to-green-500",
    lessons: [
      "Budgeting Basics",
      "Saving Strategies",
      "Investing 101",
      "Understanding Cryptocurrency",
      "Getting Started with Stocks",
      "Personal Finance Habits",
    ],
  },
};

const XP_PER_LESSON = 30;

type Progress = { completed: string[]; xp: number };

function key(courseId: string, userId?: string) {
  return `nova-academy-${userId ?? "anon"}-${courseId}`;
}

export function loadProgress(courseId: string, userId?: string): Progress {
  if (typeof window === "undefined") return { completed: [], xp: 0 };
  try {
    const raw = localStorage.getItem(key(courseId, userId));
    if (!raw) return { completed: [], xp: 0 };
    const p = JSON.parse(raw) as Progress;
    return { completed: p.completed ?? [], xp: p.xp ?? 0 };
  } catch {
    return { completed: [], xp: 0 };
  }
}

export function saveProgress(courseId: string, progress: Progress, userId?: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(courseId, userId), JSON.stringify(progress));
  } catch {
    /* quota */
  }
}

export function markComplete(courseId: string, lessonTitle: string, userId?: string): Progress {
  const p = loadProgress(courseId, userId);
  if (p.completed.includes(lessonTitle)) return p;
  const next: Progress = { completed: [...p.completed, lessonTitle], xp: p.xp + XP_PER_LESSON };
  saveProgress(courseId, next, userId);
  return next;
}
