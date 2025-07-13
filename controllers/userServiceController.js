// import Services from "../database/models/services.js";

// export const getUserWithServices = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     if (!userId) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const userService = await Services.findAll({
//       where: { userId },
//       order: [["createdAt", "DESC"]],
//     });

//     return res.status(200).json({
//       message: "Successfully retrieved user services",
//       userService,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: `Internal service Error: ${error.message || error}`,
//     });
//   }
// };
