import hashIdUtil from "../../utils/hashId.util.js";
import categoryRepository from "../category/category.repository.js";
import metaRepository from "./meta.repository.js";

export const initCall = async () => {
  const allCat = await categoryRepository.getAllCategories();
  const categories = allCat.map((i) => ({
    ...i,
    id: hashIdUtil.hashIdEncode(i.id),
  }));
  return { categories };
};

const metaServices = { initCall };

export default metaServices;
