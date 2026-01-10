import metaRepository from "./meta.repository.js";

export const initCall = async () => {
  const results = await metaRepository.initCall();
  return results;
};

const metaServices = { initCall };

export default metaServices;
