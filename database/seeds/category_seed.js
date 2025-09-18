import Category from "../models/category.js";

const categories = [
  { title: "visa-paperwork", label: "Visa & Work Permits" },
  { title: "translation", label: "Document Translation" },
  { title: "language-learning", label: "German Language Learning" },
  { title: "career-coaching", label: "Career Coaching" },
  { title: "housing", label: "Housing & Accommodation" },
  { title: "banking-finance", label: "Banking & Financial Setup" },
  { title: "legal-advice", label: "Legal Consultation" },
  { title: "tax-setup", label: "Tax Registration" },
  { title: "networking", label: "Professional Networking" },
  { title: "cultural-integration", label: "Cultural Integration" },
];

const seedCategory = async () => {
  await Category.bulkCreate(categories);
};
export default seedCategory;
