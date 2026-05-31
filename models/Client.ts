import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const ClientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, uppercase: true, trim: true, maxlength: 6 },
    color: { type: String, required: true, default: "#f59e0b" },
    status: { type: String, enum: ["active", "maintenance", "archived"], default: "active" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

ClientSchema.index({ owner: 1, slug: 1 }, { unique: true });

export type ClientDoc = InferSchemaType<typeof ClientSchema> & { _id: mongoose.Types.ObjectId };
export const Client = (models.Client as mongoose.Model<ClientDoc>) || model<ClientDoc>("Client", ClientSchema);
