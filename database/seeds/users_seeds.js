import User from "../models/user.js";
const data = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqphvB2D1XjX.3qjLO6F6QY7GJUyW2", // "password123" hashed
    DOB: new Date("2023-01-15"),
    isVerified: true,
    image: "https://example.com/images/john-doe.jpg",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    password: "$2a$10$6y8XUJX9W8Jz7q3q2q2q2uLOickgx2ZMRZoMy.MrqphvB2D1XjX", // "securepass456" hashed
    DOB: new Date("2023-02-20"),
    isVerified: true,
    image: "https://example.com/images/jane-smith.jpg",
  },
  {
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.j@example.com",
    password: "$2a$10$9qo8uLOickgx2ZMRZoMy.MrqphvB2D1XjX.3qjLO6F6QY7GJUyW2", // "alex1234" hashed
    DOB: new Date("2023-03-10"),
    isVerified: false,
    image: null,
  },
  {
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.w@example.com",
    password: "$2a$10$3qjLO6F6QY7GJUyW2N9qo8uLOickgx2ZMRZoMy.MrqphvB2D1XjX", // "sarahpass" hashed
    DOB: new Date("2023-04-05"),
    isVerified: true,
    image: "https://example.com/images/sarah-w.jpg",
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.b@example.com",
    password: "$2a$10$MRZoMy.MrqphvB2D1XjX.3qjLO6F6QY7GJUyW2N9qo8uLOickgx2Z", // "mike7890" hashed
    DOB: null,
    isVerified: false,
    image: null,
  },
];
export default async function seedUsers() {
  await User.bulkCreate(data);
}
