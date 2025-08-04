import Review from "../models/review.js";

const data = [
  // Reviews for CodeMaster Academy services (ServiceId 1-4)
  {
    body: "This bootcamp completely changed my career trajectory! The instructors were knowledgeable and the projects were relevant to real-world work.",
    UserId: 1,
    ProviderId: 1,
    rating: 5,
    ServiceId: 1,
  },
  {
    body: "Great content but the pace was too fast for complete beginners. Would benefit from more TA support.",
    UserId: 1,
    ProviderId: 1,
    rating: 4,
    ServiceId: 1,
  },
  {
    body: "The Python course was excellent. I went from zero to building my first ML model in 8 weeks!",
    UserId: 1,
    ProviderId: 1,
    rating: 5,
    ServiceId: 2,
  },
  {
    body: "Good introduction to data science concepts, but the final project could be more challenging.",
    UserId: 1,
    ProviderId: 1,
    rating: 4,
    ServiceId: 2,
  },
  {
    body: "Cybersecurity course was eye-opening. The hands-on labs were particularly valuable.",
    UserId: 2,
    ProviderId: 1,
    rating: 5,
    ServiceId: 3,
  },
  {
    body: "Flutter course needs updating - some modules use deprecated packages.",
    UserId: 2,
    ProviderId: 1,
    rating: 3,
    ServiceId: 4,
  },

  // Reviews for Design Thinkers services (ServiceId 5-7)
  {
    body: "The UX course gave me the confidence to switch careers. Portfolio reviews were incredibly helpful.",
    UserId: 2,
    ProviderId: 2,
    rating: 5,
    ServiceId: 5,
  },
  {
    body: null, // No text review
    UserId: 3,
    ProviderId: 2,
    rating: 4,
    ServiceId: 5,
  },
  {
    body: "Photoshop course was fantastic! Learned techniques I've been trying to figure out for years.",
    UserId: 3,
    ProviderId: 2,
    rating: 5,
    ServiceId: 6,
  },
  {
    body: "Design Thinking workshop was too theoretical. Needed more practical exercises.",
    UserId: 3,
    ProviderId: 2,
    rating: 3,
    ServiceId: 7,
  },

  // Reviews for Language Bridge services (ServiceId 8-10)
  {
    body: "Spanish immersion was intense but worth it! My fluency improved dramatically in just a month.",
    UserId: 4,
    ProviderId: 3,
    rating: 5,
    ServiceId: 8,
  },
  {
    body: "Business English course was exactly what I needed for my international job. Highly recommend!",
    UserId: 4,
    ProviderId: 3,
    rating: 5,
    ServiceId: 9,
  },
  {
    body: "Japanese teacher was very patient. Would like more kanji instruction though.",
    UserId: 4,
    ProviderId: 3,
    rating: 4,
    ServiceId: 10,
  },

  // Reviews for Business Analytics Pro services (ServiceId 11-12)
  {
    body: "Passed my PL-300 exam on first try thanks to this course! The practice tests were spot-on.",
    UserId: 5,
    ProviderId: 4,
    rating: 5,
    ServiceId: 11,
  },
  {
    body: "Excel course covered everything from basics to advanced formulas. Perfect for my analyst role.",
    UserId: 5,
    ProviderId: 4,
    rating: 5,
    ServiceId: 12,
  },
  {
    body: "Content was good but video quality could be better in some modules.",
    UserId: 5,
    ProviderId: 4,
    rating: 4,
    ServiceId: 12,
  },

  // Reviews for Young Scientists Club services (ServiceId 13-15)
  {
    body: "My 10-year-old looks forward to robotics every week! She's learning so much while having fun.",
    UserId: 1,
    ProviderId: 5,
    rating: 5,
    ServiceId: 13,
  },
  {
    body: "Junior Coding Club is great, but the age range is too broad. My 14-year-old was bored.",
    UserId: 1,
    ProviderId: 5,
    rating: 3,
    ServiceId: 14,
  },
  {
    body: "Science camp was the highlight of my son's summer! He still talks about the experiments.",
    UserId: 1,
    ProviderId: 5,
    rating: 5,
    ServiceId: 15,
  },

  // Reviews for Culinary Arts Institute services (ServiceId 16-17)
  {
    body: "Chef program is intensive but rewarding. The externship opportunity was invaluable.",
    UserId: 2,
    ProviderId: 6,
    rating: 5,
    ServiceId: 16,
  },
  {
    body: "Bread baking workshop was fun but overcrowded. Hard to get individual attention.",
    UserId: 2,
    ProviderId: 6,
    rating: 3,
    ServiceId: 17,
  },
  {
    body: "My sourdough has never been better after taking this workshop!",
    UserId: 2,
    ProviderId: 6,
    rating: 5,
    ServiceId: 17,
  },

  // Additional reviews to reach 30 total
  {
    body: "Worth every penny. Landed a developer job 2 months after completing the bootcamp!",
    UserId: 3,
    ProviderId: 1,
    rating: 5,
    ServiceId: 1,
  },
  {
    body: "The career services team needs improvement. Great education but poor job support.",
    UserId: 3,
    ProviderId: 1,
    rating: 3,
    ServiceId: 1,
  },
  {
    body: "Perfect for visual learners. The design exercises were creative and challenging.",
    UserId: 3,
    ProviderId: 2,
    rating: 5,
    ServiceId: 5,
  },
  {
    body: "Wish there were more advanced Japanese courses available.",
    UserId: 4,
    ProviderId: 3,
    rating: 4,
    ServiceId: 10,
  },
  {
    body: "Changed how I approach data at work. The Power BI templates alone were worth the price.",
    UserId: 4,
    ProviderId: 4,
    rating: 5,
    ServiceId: 11,
  },
  {
    body: "My daughter now wants to be a scientist after attending the summer camp!",
    UserId: 4,
    ProviderId: 5,
    rating: 5,
    ServiceId: 15,
  },
  {
    body: "Kitchen facilities were top-notch. Learned so much about professional cooking techniques.",
    UserId: 5,
    ProviderId: 6,
    rating: 5,
    ServiceId: 16,
  },
  {
    body: null, // No text review
    UserId: 5,
    ProviderId: 3,
    rating: 5,
    ServiceId: 8,
  },
  {
    body: "Good foundation course, but the mobile development field changes too fast for annual updates to be sufficient.",
    UserId: 5,
    ProviderId: 1,
    rating: 3,
    ServiceId: 4,
  },
];

export default async function reviewSeed() {
  await Review.bulkCreate(data);
}
