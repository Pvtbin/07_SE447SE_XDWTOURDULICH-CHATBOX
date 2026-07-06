import axiosClient from "./axiosClient";

export const sendChatMessageApi = (messages) =>
  axiosClient.post("/chatbot/message", { messages });