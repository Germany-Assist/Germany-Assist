import Business from "../models/service_provider.js";
const data = [
  {
    name: "TechNova Solutions",
    about:
      "Innovative software development company specializing in AI and cloud computing.",
    description:
      "We build scalable enterprise solutions with cutting-edge technology, serving clients globally since 2015.",
    views: 1250,
    email: "contact@technova.com",
    phone_number: "+1 (555) 123-4567",
  },
  {
    name: "GreenEarth Organics",
    about: "Sustainable farm-to-table organic grocery chain.",
    description:
      "Locally sourced produce, ethically farmed meats, and zero-waste packaging. Committed to environmental stewardship.",
    views: 890,
    email: "hello@greenearth.org",
    phone_number: null, // Optional field
  },
  {
    name: "UrbanFit Gym",
    about: "24/7 fitness center with personalized training programs.",
    description:
      "State-of-the-art equipment, group classes, and nutrition coaching. Join our community of 10,000+ members!",
    views: 3200,
    email: "support@urbanfit.com",
    phone_number: "+44 20 7946 0958",
  },
  {
    name: "Bella Cucina",
    about: "Authentic Italian restaurant and catering service.",
    description:
      "Family-owned since 1982. Homemade pasta, wood-fired pizzas, and seasonal menus inspired by Tuscany.",
    views: 540,
    email: "reservations@bellacucina.com",
    phone_number: "+39 055 1234567",
  },
  {
    name: "PixelWave Design",
    about: "Boutique digital agency for branding and UX/UI design.",
    description:
      "We transform ideas into visually stunning, user-friendly experiences. Trusted by startups and Fortune 500s.",
    views: null, // Optional field
    email: "studio@pixelwave.design",
    phone_number: "+61 2 9876 5432",
  },
];
export default async function BusinessSeed() {
  await Business.bulkCreate(data);
}
