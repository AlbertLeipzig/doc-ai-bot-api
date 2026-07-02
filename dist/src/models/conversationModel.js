import mongoose from "mongoose";
const { model, Schema } = mongoose;
const conversationSchema = new Schema({
    vectorProfileId: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        default: "Untitled conversation",
        trim: true,
    },
    topK: { type: Number, required: true },
    benchmark: Boolean,
}, {
    timestamps: true,
});
export const Conversation = model("Conversation", conversationSchema);
