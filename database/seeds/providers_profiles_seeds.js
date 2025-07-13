import ProvidersProfile from "../models/provider.js";
const data = [
  {
    name: "CodeMaster Academy",
    about: "Leading coding bootcamp with industry-experienced instructors",
    description:
      "We offer intensive 12-week programs in web development, data science, and cybersecurity. Our graduates work at top tech companies worldwide.",
    views: 12500,
    email: "info@codemaster.com",
    phone_number: "+1 (555) 123-4567",
    rating: 4.8,
    total_reviews: 342,
    image: "https://example.com/business-images/codemaster.jpg",
  },
  {
    name: "Design Thinkers",
    about: "Creative design education for the digital age",
    description:
      "Specializing in UX/UI design, graphic design, and design thinking methodologies. Our courses blend theory with practical projects.",
    views: 8700,
    email: "hello@designthinkers.edu",
    phone_number: "+44 20 7946 0958",
    rating: 4.6,
    total_reviews: 215,
    image: "https://example.com/business-images/design-thinkers.png",
  },
  {
    name: "Language Bridge",
    about: "Language learning through immersion techniques",
    description:
      "We teach 15+ languages using our proprietary immersion method. Small class sizes and native-speaking instructors ensure rapid progress.",
    views: 5600,
    email: "contact@languagebridge.org",
    phone_number: "+61 2 9876 5432",
    rating: 4.9,
    total_reviews: 178,
    image: null,
  },
  {
    name: "Business Analytics Pro",
    about: "Data-driven decision making for business leaders",
    description:
      "Short courses and certifications in business analytics, data visualization, and predictive modeling. Perfect for professionals looking to upskill.",
    views: 3200,
    email: "admin@bizanalyticspro.com",
    phone_number: "+1 (555) 987-6543",
    rating: 4.4,
    total_reviews: 92,
    image: "https://example.com/business-images/biz-analytics.jpg",
  },
  {
    name: "Young Scientists Club",
    about: "STEM education for children ages 6-16",
    description:
      "After-school programs and summer camps that make science fun through hands-on experiments and project-based learning.",
    views: 4100,
    email: "info@youngscientists.edu",
    phone_number: "+1 (555) 456-7890",
    rating: 4.7,
    total_reviews: 156,
    image: "https://example.com/business-images/young-scientists.png",
  },
  {
    name: "Culinary Arts Institute",
    about: "Professional chef training programs",
    description:
      "From basic knife skills to advanced pastry techniques, our programs prepare students for careers in the culinary industry.",
    views: 6800,
    email: "admissions@culinaryarts.edu",
    phone_number: "+33 1 23 45 67 89",
    rating: 4.5,
    total_reviews: 203,
    image: null,
  },
];
export default async function providersProfilesSeed() {
  await ProvidersProfile.bulkCreate(data);
}
