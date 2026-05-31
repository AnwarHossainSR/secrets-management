import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    description: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & { _id: mongoose.Types.ObjectId };
export const Project = (models.Project as mongoose.Model<ProjectDoc>) || model<ProjectDoc>("Project", ProjectSchema);
