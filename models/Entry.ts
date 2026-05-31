import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const FieldSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }, // ciphertext
    isSecret: { type: Boolean, default: true },
  },
  { _id: false }
);

const EntrySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    type: {
      type: String,
      enum: ["server", "email", "api", "database", "deployment", "note", "other"],
      default: "other",
    },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fields: { type: [FieldSchema], default: [] },
    tags: { type: [String], default: [], index: true },
    isPinned: { type: Boolean, default: false, index: true },
    environment: {
      type: String,
      enum: ["production", "staging", "development", "other"],
      default: "production",
    },
    notes: { type: String, default: "" },
    lastViewedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type EntryDoc = InferSchemaType<typeof EntrySchema> & { _id: mongoose.Types.ObjectId };
export const Entry = (models.Entry as mongoose.Model<EntryDoc>) || model<EntryDoc>("Entry", EntrySchema);
