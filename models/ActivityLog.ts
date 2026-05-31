import mongoose, { Schema, type InferSchemaType, models, model } from "mongoose";

const ActivityLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, required: true },
  entryId: { type: Schema.Types.ObjectId, ref: "Entry", default: null },
  entryTitle: { type: String, default: "" },
  clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
  timestamp: { type: Date, default: Date.now, index: true },
});

export type ActivityLogDoc = InferSchemaType<typeof ActivityLogSchema> & { _id: mongoose.Types.ObjectId };
export const ActivityLog =
  (models.ActivityLog as mongoose.Model<ActivityLogDoc>) ||
  model<ActivityLogDoc>("ActivityLog", ActivityLogSchema);
