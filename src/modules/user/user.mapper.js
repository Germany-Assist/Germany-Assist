import { generateDownloadUrl } from "../../configs/s3Configs.js";
import hashIdUtil from "../../utils/hashId.util.js";
const sanitizeUser = async (user) => {
  let favorites, orders, signedImage, imageKey;
  if (user.favorites && user.favorites.length > 0) {
    favorites = user.favorites.map((i) => {
      return {
        id: hashIdUtil.hashIdEncode(i.id),
        service: { ...i.Service, id: hashIdUtil.hashIdEncode(i.Service.id) },
      };
    });
  }
  if (user.Orders && user.Orders.length > 0) {
    orders = user.Orders.map((i) => {
      return {
        serviceId: hashIdUtil.hashIdEncode(i.Service.id),
        orderId: hashIdUtil.hashIdEncode(i.id),
        timelineId: hashIdUtil.hashIdEncode(i.Timeline.id),
        timelineLabel: i.Timeline.label,
      };
    });
  }
  if (user.profilePicture && user.profilePicture.length > 0) {
    if (user.googleId) {
      signedImage = user?.profilePicture[0]?.url;
    } else {
      signedImage = await generateDownloadUrl(user?.profilePicture[0]?.url);
    }
    imageKey = user?.profilePicture[0]?.name;
  }
  const levelCalc = () => {
    const role = user.UserRole.role;
    if (role == "client") {
      return "ready";
    } else if (
      role == "service_provider_root" ||
      role == "service_provider_rep"
    ) {
      return "accepted";
    } else if (role == "employer") {
      return "pending";
    } else if (role == "admin") {
      return "alert";
    }
  };
  return {
    id: hashIdUtil.hashIdEncode(user.id),
    firstName: user.firstName,
    lastName: user.lastName,
    dob: user.dob,
    email: user.email,
    image: signedImage,
    imageKey: imageKey,
    isVerified: user.isVerified,
    role: user.UserRole.role,
    relatedType: user.UserRole.relatedType,
    relatedId: user.UserRole.relatedId,
    favorites,
    orders,
    level: levelCalc(),
  };
};

const userMapper = {
  sanitizeUser,
};
export default userMapper;
