import Category from "../models/category.js";
import { contractTemplates } from "../templates.js";

const categories = [
  {
    title: "visa-paperwork",
    label: "Visa & Work Permits",
    contract_template:
      contractTemplates.visaPaperworkContract.contract_template,
    variables: contractTemplates.visaPaperworkContract.variables,
  },
  {
    title: "translation",
    label: "Document Translation",
    contract_template: "contractTemplates.visaPaperworkContract",
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "language-learning",
    label: "German Language Learning",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "career-coaching",
    label: "Career Coaching",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "housing",
    label: "Housing & Accommodation",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "banking-finance",
    label: "Banking & Financial Setup",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "legal-advice",
    label: "Legal Consultation",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "tax-setup",
    label: "Tax Registration",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "networking",
    label: "Professional Networking",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
  {
    title: "cultural-integration",
    label: "Cultural Integration",
    contract_template: `dsad`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
];

const seedCategory = async () => {
  await Category.bulkCreate(categories);
};
export default seedCategory;
