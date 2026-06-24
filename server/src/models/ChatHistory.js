import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    sourcesUsed: {
      type: [String],
      default: [],
    },
    type: { type: String, enum: ["chat", "flow"], default: "chat" },
    flowData: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("ChatHistory", chatHistorySchema);
