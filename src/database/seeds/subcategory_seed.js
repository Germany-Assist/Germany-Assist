import Subcategory from "../models/subcategory.js";
const subcategories = [
  // ======================
  // Career Coaching (1)
  // ======================
  {
    id: 1,
    title: "cv-cover-letter",
    label: "CV & Cover Letter Writing",
    categoryId: 1,
  },
  {
    id: 2,
    title: "linkedin-optimization",
    label: "LinkedIn Optimization",
    categoryId: 1,
  },
  {
    id: 3,
    title: "job-interview-preparation",
    label: "Job Interview Preparation",
    categoryId: 1,
  },
  {
    id: 4,
    title: "career-coaching-general",
    label: "Career Coaching",
    categoryId: 1,
  },
  {
    id: 5,
    title: "intercultural-training",
    label: "Intercultural Training",
    categoryId: 1,
  },
  {
    id: 6,
    title: "job-search-strategy-germany",
    label: "Job Search Strategy (Germany)",
    categoryId: 1,
  },
  {
    id: 7,
    title: "industry-specific-coaching",
    label: "Industry-Specific Coaching",
    categoryId: 1,
  },

  // ======================
  // Certificate Recognition (2)
  // ======================
  {
    id: 8,
    title: "recognition-consulting",
    label: "Certificate Recognition Consulting (Anerkennung)",
    categoryId: 2,
  },
  {
    id: 9,
    title: "medical-recognition",
    label: "Medical Certificate Recognition",
    categoryId: 2,
  },
  {
    id: 10,
    title: "bachelor-recognition",
    label: "Bachelor Certificate Recognition",
    categoryId: 2,
  },
  {
    id: 11,
    title: "baccalaureate-recognition",
    label: "Baccalaureate Certificate Recognition",
    categoryId: 2,
  },
  {
    id: 12,
    title: "engineering-recognition",
    label: "Engineering Certificate Recognition",
    categoryId: 2,
  },
  {
    id: 13,
    title: "application-submission-support",
    label: "Application Submission Support",
    categoryId: 2,
  },
  {
    id: 14,
    title: "authority-follow-up",
    label: "Follow-up with German Authorities",
    categoryId: 2,
  },

  // ======================
  // German Language (3)
  // ======================
  {
    id: 15,
    title: "general-german",
    label: "General German (A1–C2)",
    categoryId: 3,
  },
  { id: 16, title: "business-german", label: "Business German", categoryId: 3 },
  { id: 17, title: "medical-german", label: "Medical German", categoryId: 3 },
  {
    id: 18,
    title: "vocational-german",
    label: "Vocational German (Berufssprache)",
    categoryId: 3,
  },
  {
    id: 19,
    title: "exam-prep-goethe",
    label: "Exam Preparation – Goethe",
    categoryId: 3,
  },
  {
    id: 20,
    title: "exam-prep-telc",
    label: "Exam Preparation – TELC",
    categoryId: 3,
  },
  {
    id: 21,
    title: "exam-prep-osd",
    label: "Exam Preparation – ÖSD",
    categoryId: 3,
  },
  {
    id: 22,
    title: "exam-prep-testdaf",
    label: "Exam Preparation – TestDaF",
    categoryId: 3,
  },
  {
    id: 23,
    title: "exam-prep-dtz",
    label: "Exam Preparation – DTZ",
    categoryId: 3,
  },
  {
    id: 24,
    title: "exam-prep-dsh",
    label: "Exam Preparation – DSH",
    categoryId: 3,
  },
  {
    id: 25,
    title: "exam-prep-ecl",
    label: "Exam Preparation – ECL",
    categoryId: 3,
  },
  {
    id: 26,
    title: "exam-prep-dsd",
    label: "Exam Preparation – DSD",
    categoryId: 3,
  },
  { id: 27, title: "private-lessons", label: "Private Lessons", categoryId: 3 },
  { id: 28, title: "group-courses", label: "Group Courses", categoryId: 3 },
  {
    id: 29,
    title: "online-courses",
    label: "Online German Courses",
    categoryId: 3,
  },
  {
    id: 30,
    title: "in-person-courses",
    label: "In-Person German Courses",
    categoryId: 3,
  },
  {
    id: 31,
    title: "hybrid-courses",
    label: "Hybrid German Courses",
    categoryId: 3,
  },
  {
    id: 32,
    title: "integration-courses",
    label: "Integration Courses",
    categoryId: 3,
  },

  // ======================
  // Translation Services (4)
  // ======================
  {
    id: 33,
    title: "sworn-translation",
    label: "Sworn Translation",
    categoryId: 4,
  },
  {
    id: 34,
    title: "recognition-translation",
    label: "Document Translation for Recognition",
    categoryId: 4,
  },
  {
    id: 35,
    title: "legal-translation",
    label: "Legal Translation",
    categoryId: 4,
  },
  {
    id: 36,
    title: "medical-translation",
    label: "Medical Translation",
    categoryId: 4,
  },
  {
    id: 37,
    title: "technical-translation",
    label: "Technical Translation",
    categoryId: 4,
  },
  {
    id: 38,
    title: "general-translation",
    label: "General Translation",
    categoryId: 4,
  },
  {
    id: 39,
    title: "interpretation",
    label: "Interpretation (Online / Offline)",
    categoryId: 4,
  },
  {
    id: 40,
    title: "audiovisual-translation",
    label: "Audiovisual Translation",
    categoryId: 4,
  },

  // ======================
  // Visa & Immigration (5)
  // ======================
  { id: 41, title: "visa-counseling", label: "Visa Counseling", categoryId: 5 },
  { id: 42, title: "work-visa", label: "Work Visa", categoryId: 5 },
  { id: 43, title: "student-visa", label: "Student Visa", categoryId: 5 },
  { id: 44, title: "job-seeker-visa", label: "Job Seeker Visa", categoryId: 5 },
  { id: 45, title: "ausbildung-visa", label: "Ausbildung Visa", categoryId: 5 },
  {
    id: 46,
    title: "embassy-interview-training",
    label: "Embassy Interview Training",
    categoryId: 5,
  },
  {
    id: 47,
    title: "visa-file-preparation",
    label: "Visa File Preparation",
    categoryId: 5,
  },
  { id: 48, title: "aps-support", label: "APS Support", categoryId: 5 },
  {
    id: 49,
    title: "health-insurance-consulting",
    label: "Health Insurance Consulting",
    categoryId: 5,
  },
  {
    id: 50,
    title: "accommodation-support",
    label: "Accommodation Service",
    categoryId: 5,
  },
  {
    id: 51,
    title: "relocation-support",
    label: "Relocation Support",
    categoryId: 5,
  },

  // ======================
  // Recruitment Services (6)
  // ======================
  {
    id: 52,
    title: "recruitment-agency",
    label: "Recruitment Agency",
    categoryId: 6,
  },
  {
    id: 53,
    title: "freelance-recruiter",
    label: "Freelance Recruiter",
    categoryId: 6,
  },
  { id: 54, title: "it-jobs", label: "Software & IT Jobs", categoryId: 6 },
  {
    id: 55,
    title: "engineering-jobs",
    label: "Engineering Jobs",
    categoryId: 6,
  },
  { id: 56, title: "healthcare-jobs", label: "Healthcare Jobs", categoryId: 6 },
  { id: 57, title: "technical-jobs", label: "Technical Jobs", categoryId: 6 },
  { id: 58, title: "ausbildung-jobs", label: "Ausbildung Jobs", categoryId: 6 },
  {
    id: 59,
    title: "hospitality-jobs",
    label: "Hospitality Jobs",
    categoryId: 6,
  },
  {
    id: 60,
    title: "employer-partnerships",
    label: "Employer Partnerships",
    categoryId: 6,
  },

  // ======================
  // Relocation Services (7)
  // ======================
  {
    id: 61,
    title: "housing-search",
    label: "Housing Search in Germany",
    categoryId: 7,
  },
  {
    id: 62,
    title: "anmeldung-support",
    label: "Anmeldung Support",
    categoryId: 7,
  },
  {
    id: 63,
    title: "bureaucracy-support",
    label: "Bureaucracy Support",
    categoryId: 7,
  },
  {
    id: 64,
    title: "health-insurance-registration",
    label: "Health Insurance Registration",
    categoryId: 7,
  },
  {
    id: 65,
    title: "bank-account-setup",
    label: "Bank Account Setup",
    categoryId: 7,
  },
  {
    id: 66,
    title: "utilities-setup",
    label: "SIM Card & Utilities Setup",
    categoryId: 7,
  },
  {
    id: 67,
    title: "family-reunion-support",
    label: "Family Reunion Support",
    categoryId: 7,
  },

  // ======================
  // University Student Services (8)
  // ======================
  {
    id: 68,
    title: "university-admission",
    label: "University Admission",
    categoryId: 8,
  },
  { id: 69, title: "aps-preparation", label: "APS Preparation", categoryId: 8 },
  {
    id: 70,
    title: "daad-support",
    label: "DAAD Application Support",
    categoryId: 8,
  },
  { id: 71, title: "uni-assist", label: "UNI-Assist Support", categoryId: 8 },
  {
    id: 72,
    title: "student-visa-support",
    label: "Student Visa Support",
    categoryId: 8,
  },
  {
    id: 73,
    title: "student-housing",
    label: "Student Housing Assistance",
    categoryId: 8,
  },
  {
    id: 74,
    title: "blocked-account-guidance",
    label: "Blocked Account Guidance",
    categoryId: 8,
  },
  {
    id: 75,
    title: "pre-departure-orientation",
    label: "Pre-departure Orientation",
    categoryId: 8,
  },
];

const seedSubcategory = async () => {
  await Subcategory.bulkCreate(subcategories);
};
export default seedSubcategory;
