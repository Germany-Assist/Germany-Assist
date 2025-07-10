import Review from "../database/models/reviews.js";
import Services from "../database/models/services.js";

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User Id id required" });
    }
    const userReviews = await Review.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Services,
          as: "service",
          attributes: ["id", "title", "price"],
        },
      ],
    });

    return res.status(200).json({
      message: "Return user reviews successfully",
      userReviews,
    });
  } catch (error) {
    return res.status(500).json({ message: `Internal service error,${error}` });
  }
};
