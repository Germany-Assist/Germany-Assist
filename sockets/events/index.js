import chatNamespace from "./chat.js";
import handleConnection from "../connection.js";
export default function setupNamespaces(io) {
  //connection to the server
  io.on("connection", handleConnection);
  chatNamespace(io);
}
