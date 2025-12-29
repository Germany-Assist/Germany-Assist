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
  };
};

const userMapper = {
  sanitizeUser,
};
export default userMapper;
