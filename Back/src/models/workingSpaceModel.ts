import mongoose from "mongoose";

interface WorkingSpaceTypes {
  name: string;
  creator: mongoose.Types.ObjectId;
  users: [
    {
      user: mongoose.Types.ObjectId;
      role: string;
    }
  ];
  rooms: any;
}

const workingSpaceSchema = new mongoose.Schema<WorkingSpaceTypes>({
  name: String,
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  users: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: {
          values: ["guest", "administrator"],
          message: "Role is either: guest or administrator",
        },
        default: "guest",
      },
    },
  ],
  rooms: {},
});
workingSpaceSchema.index({ creator: 1 }, { unique: true });

const WorkingSpace = mongoose.model<WorkingSpaceTypes>(
  "WorkingSpace",
  workingSpaceSchema
);

export default WorkingSpace;
