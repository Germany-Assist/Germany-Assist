import { infoLogger } from "../../../utils/loggers.js";

async function handleCommentCreated(data) {
  infoLogger("Comment created notification received", data);
}

export default handleCommentCreated;
