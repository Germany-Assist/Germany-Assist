import Review from "../models/review.js";

const data = [
  // Reviews for CodeMaster Academy services (serviceId 1-4)
  {
    body: "This bootcamp completely changed my career trajectory! The instructors were knowledgeable and the projects were relevant to real-world work.",
    userId: 1,
    providersProfileId: 1,
    rating: 5,
    serviceId: 1,
  },
  {
    body: "Great content but the pace was too fast for complete beginners. Would benefit from more TA support.",
    userId: 1,
    providersProfileId: 1,
    rating: 4,
    serviceId: 1,
  },
  {
    body: "The Python course was excellent. I went from zero to building my first ML model in 8 weeks!",
    userId: 1,
    providersProfileId: 1,
    rating: 5,
    serviceId: 2,
  },
  {
    body: "Good introduction to data science concepts, but the final project could be more challenging.",
    userId: 1,
    providersProfileId: 1,
    rating: 4,
    serviceId: 2,
  },
  {
    body: "Cybersecurity course was eye-opening. The hands-on labs were particularly valuable.",
    userId: 2,
    providersProfileId: 1,
    rating: 5,
    serviceId: 3,
  },
  {
    body: "Flutter course needs updating - some modules use deprecated packages.",
    userId: 2,
    providersProfileId: 1,
    rating: 3,
    serviceId: 4,
  },

  // Reviews for Design Thinkers services (serviceId 5-7)
  {
    body: "The UX course gave me the confidence to switch careers. Portfolio reviews were incredibly helpful.",
    userId: 2,
    providersProfileId: 2,
    rating: 5,
    serviceId: 5,
  },
  {
    body: null, // No text review
    userId: 3,
    providersProfileId: 2,
    rating: 4,
    serviceId: 5,
  },
  {
    body: "Photoshop course was fantastic! Learned techniques I've been trying to figure out for years.",
    userId: 3,
    providersProfileId: 2,
    rating: 5,
    serviceId: 6,
  },
  {
    body: "Design Thinking workshop was too theoretical. Needed more practical exercises.",
    userId: 3,
    providersProfileId: 2,
    rating: 3,
    serviceId: 7,
  },

  // Reviews for Language Bridge services (serviceId 8-10)
  {
    body: "Spanish immersion was intense but worth it! My fluency improved dramatically in just a month.",
    userId: 4,
    providersProfileId: 3,
    rating: 5,
    serviceId: 8,
  },
  {
    body: "Business English course was exactly what I needed for my international job. Highly recommend!",
    userId: 4,
    providersProfileId: 3,
    rating: 5,
    serviceId: 9,
  },
  {
    body: "Japanese teacher was very patient. Would like more kanji instruction though.",
    userId: 4,
    providersProfileId: 3,
    rating: 4,
    serviceId: 10,
  },

  // Reviews for Business Analytics Pro services (serviceId 11-12)
  {
    body: "Passed my PL-300 exam on first try thanks to this course! The practice tests were spot-on.",
    userId: 5,
    providersProfileId: 4,
    rating: 5,
    serviceId: 11,
  },
  {
    body: "Excel course covered everything from basics to advanced formulas. Perfect for my analyst role.",
    userId: 5,
    providersProfileId: 4,
    rating: 5,
    serviceId: 12,
  },
  {
    body: "Content was good but video quality could be better in some modules.",
    userId: 5,
    providersProfileId: 4,
    rating: 4,
    serviceId: 12,
  },

  // Reviews for Young Scientists Club services (serviceId 13-15)
  {
    body: "My 10-year-old looks forward to robotics every week! She's learning so much while having fun.",
    userId: 1,
    providersProfileId: 5,
    rating: 5,
    serviceId: 13,
  },
  {
    body: "Junior Coding Club is great, but the age range is too broad. My 14-year-old was bored.",
    userId: 1,
    providersProfileId: 5,
    rating: 3,
    serviceId: 14,
  },
  {
    body: "Science camp was the highlight of my son's summer! He still talks about the experiments.",
    userId: 1,
    providersProfileId: 5,
    rating: 5,
    serviceId: 15,
  },

  // Reviews for Culinary Arts Institute services (serviceId 16-17)
  {
    body: "Chef program is intensive but rewarding. The externship opportunity was invaluable.",
    userId: 2,
    providersProfileId: 6,
    rating: 5,
    serviceId: 16,
  },
  {
    body: "Bread baking workshop was fun but overcrowded. Hard to get individual attention.",
    userId: 2,
    providersProfileId: 6,
    rating: 3,
    serviceId: 17,
  },
  {
    body: "My sourdough has never been better after taking this workshop!",
    userId: 2,
    providersProfileId: 6,
    rating: 5,
    serviceId: 17,
  },

  // Additional reviews to reach 30 total
  {
    body: "Worth every penny. Landed a developer job 2 months after completing the bootcamp!",
    userId: 3,
    providersProfileId: 1,
    rating: 5,
    serviceId: 1,
  },
  {
    body: "The career services team needs improvement. Great education but poor job support.",
    userId: 3,
    providersProfileId: 1,
    rating: 3,
    serviceId: 1,
  },
  {
    body: "Perfect for visual learners. The design exercises were creative and challenging.",
    userId: 3,
    providersProfileId: 2,
    rating: 5,
    serviceId: 5,
  },
  {
    body: "Wish there were more advanced Japanese courses available.",
    userId: 4,
    providersProfileId: 3,
    rating: 4,
    serviceId: 10,
  },
  {
    body: "Changed how I approach data at work. The Power BI templates alone were worth the price.",
    userId: 4,
    providersProfileId: 4,
    rating: 5,
    serviceId: 11,
  },
  {
    body: "My daughter now wants to be a scientist after attending the summer camp!",
    userId: 4,
    providersProfileId: 5,
    rating: 5,
    serviceId: 15,
  },
  {
    body: "Kitchen facilities were top-notch. Learned so much about professional cooking techniques.",
    userId: 5,
    providersProfileId: 6,
    rating: 5,
    serviceId: 16,
  },
  {
    body: null, // No text review
    userId: 5,
    providersProfileId: 3,
    rating: 5,
    serviceId: 8,
  },
  {
    body: "Good foundation course, but the mobile development field changes too fast for annual updates to be sufficient.",
    userId: 5,
    providersProfileId: 1,
    rating: 3,
    serviceId: 4,
  },
];

export default async function reviewSeed() {
  await Review.bulkCreate(data);
}
