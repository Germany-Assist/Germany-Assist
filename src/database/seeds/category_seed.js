import Category from "../models/category.js";

const categories = [
  { id: 1, title: "career-coaching", label: "Career Coaching" },
  { id: 2, title: "certificate-recognition", label: "Certificate Recognition" },
  { id: 3, title: "german-language", label: "German Language" },
  { id: 4, title: "translation-services", label: "Translation Services" },
  { id: 5, title: "visa-immigration", label: "Visa & Immigration" },
  { id: 6, title: "recruitment-services", label: "Recruitment Services" },
  { id: 7, title: "relocation-services", label: "Relocation Services" },
  {
    id: 8,
    title: "university-student-services",
    label: "University Student Services",
  },
];
const seedCategory = async () => {
  await Category.bulkCreate(categories);
};
export default seedCategory;
