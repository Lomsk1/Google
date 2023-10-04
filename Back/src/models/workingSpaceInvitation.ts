import mongoose from "mongoose";

interface WorkingSpaceInvitationTypes {
  host: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
}

const workingSpaceInvitationSchema =
  new mongoose.Schema<WorkingSpaceInvitationTypes>({
    host: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Choose creator"],
    },
    guest: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Choose Guest"],
    },
  });

const WorkingSpaceInvitation = mongoose.model<WorkingSpaceInvitationTypes>(
  "WorkingSpaceInvitation",
  workingSpaceInvitationSchema
);

export default WorkingSpaceInvitation;
