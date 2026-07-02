import { Schema, model } from "mongoose";
const vectorProfileSchema = new Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    chunkSize: { type: Number, required: true },
    chunkOverlap: { type: Number, required: true },
}, { timestamps: false });
export const VectorProfile = model("VectorProfile", vectorProfileSchema);
