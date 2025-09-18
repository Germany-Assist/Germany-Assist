import Services from "../models/service.js";
const data = [
  // CodeMaster Academy (BusinessId: 1) - 4 services
  {
    title: "Full Stack Web Development Bootcamp",
    description:
      "12-week intensive program covering HTML, CSS, JavaScript, React, Node.js, and databases. Graduate with a portfolio of 5 real-world projects.",
    UserId: 1,
    BusinessId: 1,
    views: 4500,
    type: "coding_bootcamp",
    rating: 5,
    total_reviews: 128,
    price: 4999.99,
    ContractId: 1,
    image: "https://example.com/service-images/webdev-bootcamp.jpg",
  },
  {
    title: "Python for Data Science",
    description:
      "8-week course teaching Python, Pandas, NumPy, and machine learning fundamentals. Perfect for beginners looking to enter the data field.",
    UserId: 1,
    BusinessId: 1,
    views: 3200,
    type: "data_science",
    rating: 4,
    total_reviews: 86,
    price: 2499.99,
    ContractId: 1,
    image: null,
  },
  {
    title: "Cybersecurity Fundamentals",
    description:
      "Learn ethical hacking, network security, and cryptography in this 10-week program. Includes certification prep for Security+.",
    UserId: 2,
    BusinessId: 1,
    views: 2800,
    type: "cybersecurity",
    rating: 5,
    total_reviews: 94,
    price: 3499.99,
    ContractId: 1,
    image: "https://example.com/service-images/cybersecurity-course.jpg",
  },
  {
    title: "Mobile App Development with Flutter",
    description:
      "Build cross-platform mobile apps using Flutter framework. 6-week course with hands-on projects.",
    UserId: 2,
    BusinessId: 1,
    views: 1900,
    type: "mobile_development",
    rating: 4,
    total_reviews: 57,
    price: 1999.99,
    ContractId: 1,
    image: null,
  },

  // Design Thinkers (BusinessId: 2) - 3 services
  {
    title: "UX/UI Design Fundamentals",
    description:
      "Master Figma, user research, wireframing, and prototyping in this comprehensive 6-week course for aspiring designers.",
    UserId: 3,
    BusinessId: 2,
    views: 2100,
    type: "design_course",
    rating: 5,
    total_reviews: 74,
    price: 1799.99,
    ContractId: 1,
    image: "https://example.com/service-images/ux-course.jpg",
  },
  {
    title: "Advanced Photoshop Techniques",
    description:
      "For intermediate designers looking to master photo manipulation, compositing, and digital painting.",
    UserId: 3,
    BusinessId: 2,
    views: 1500,
    type: "design_course",
    rating: 4,
    total_reviews: 42,
    price: 1299.99,
    ContractId: 1,
    image: "https://example.com/service-images/photoshop-course.jpg",
  },
  {
    title: "Design Thinking Workshop",
    description:
      "2-day intensive workshop teaching the design thinking process through real-world case studies.",
    UserId: 3,
    BusinessId: 2,
    views: 900,
    type: "workshop",
    rating: 5,
    total_reviews: 38,
    price: 499.99,
    ContractId: 1,
    image: null,
  },

  // Language Bridge (BusinessId: 3) - 3 services
  {
    title: "Spanish Immersion Program",
    description:
      "Total immersion course with native speakers. 4-week intensive program with cultural activities and conversation practice.",
    UserId: 4,
    BusinessId: 3,
    views: 1800,
    type: "language_course",
    rating: 4,
    total_reviews: 53,
    price: 999.99,
    ContractId: 1,
    image: "https://example.com/service-images/spanish-course.jpg",
  },
  {
    title: "Business English for Professionals",
    description:
      "Focus on business communication, presentations, and professional email writing. 8-week program.",
    UserId: 4,
    BusinessId: 3,
    views: 1200,
    type: "language_course",
    rating: 5,
    total_reviews: 47,
    price: 1499.99,
    ContractId: 1,
    image: null,
  },
  {
    title: "Japanese for Beginners",
    description:
      "Learn hiragana, katakana, and basic conversation skills. Weekly classes for 12 weeks.",
    UserId: 4,
    BusinessId: 3,
    views: 850,
    type: "language_course",
    rating: 4,
    total_reviews: 29,
    price: 799.99,
    ContractId: 1,
    image: "https://example.com/service-images/japanese-course.jpg",
  },

  // Business Analytics Pro (BusinessId: 4) - 2 services
  {
    title: "Power BI Certification Prep",
    description:
      "Prepare for Microsoft PL-300 exam with hands-on training in data modeling, visualization, and DAX formulas.",
    UserId: 5,
    BusinessId: 4,
    views: 950,
    type: "business_analytics",
    rating: 5,
    total_reviews: 42,
    price: 1299.99,
    ContractId: 1,
    image: null,
  },
  {
    title: "Excel for Business Analysts",
    description:
      "Master advanced Excel functions, pivot tables, and data analysis tools used in corporate environments.",
    UserId: 5,
    BusinessId: 4,
    views: 2100,
    type: "business_analytics",
    rating: 4,
    total_reviews: 89,
    price: 899.99,
    ContractId: 1,
    image: "https://example.com/service-images/excel-course.jpg",
  },

  // Young Scientists Club (BusinessId: 5) - 3 services
  {
    title: "Robotics for Kids (Ages 8-12)",
    description:
      "Weekly after-school program where kids build and program robots using LEGO Mindstorms.",
    UserId: 5,
    BusinessId: 5,
    views: 1200,
    type: "stem_for_kids",
    rating: 5,
    total_reviews: 67,
    price: 299.99,
    ContractId: 1,
    image: "https://example.com/service-images/kids-robotics.jpg",
  },
  {
    title: "Junior Coding Club",
    description:
      "Introduction to programming concepts through Scratch and simple Python projects. For ages 10-14.",
    UserId: 1,
    BusinessId: 5,
    views: 950,
    type: "stem_for_kids",
    rating: 4,
    total_reviews: 42,
    price: 249.99,
    ContractId: 1,
    image: null,
  },
  {
    title: "Science Summer Camp",
    description:
      "Week-long day camp featuring chemistry experiments, physics demonstrations, and biology explorations.",
    UserId: 5,
    BusinessId: 5,
    views: 1800,
    type: "stem_for_kids",
    rating: 5,
    total_reviews: 78,
    price: 399.99,
    ContractId: 1,
    image: "https://example.com/service-images/science-camp.jpg",
  },

  // Culinary Arts Institute (BusinessId: 6) - 2 services
  {
    title: "Professional Chef Certification",
    description:
      "6-month intensive program covering all aspects of professional kitchen work and culinary techniques.",
    UserId: 5,
    BusinessId: 6,
    views: 2500,
    type: "culinary_program",
    rating: 5,
    total_reviews: 112,
    price: 8999.99,
    ContractId: 1,
    image: "https://example.com/service-images/chef-program.jpg",
  },
  {
    title: "Artisan Bread Baking",
    description:
      "Weekend workshop teaching sourdough, baguettes, and specialty bread techniques.",
    UserId: 5,
    BusinessId: 6,
    views: 1100,
    type: "culinary_workshop",
    rating: 4,
    total_reviews: 56,
    price: 349.99,
    ContractId: 1,
    image: null,
  },
];
export default async function servicesSeed() {
  await Services.bulkCreate(data);
}
