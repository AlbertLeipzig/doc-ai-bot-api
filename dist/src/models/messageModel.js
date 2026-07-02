import mongoose from "mongoose";
const { model, Schema } = mongoose;
const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    tokens: {
        type: Number,
        default: 0,
        min: 0,
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
export const Message = model("Message", messageSchema);
