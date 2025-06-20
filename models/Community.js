const mongoose = require("mongoose");

// File sub-schema
const fileSchema = new mongoose.Schema(
  {
    url: { type: String },
    filename: { type: String },
    fileType: {
      type: String,
      enum: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    },
    fileSize: { type: Number },
  },
  { _id: false }
);

// Message schema
const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    default: "",
  },
  file: {
    type: fileSchema,
    default: null,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main community schema
const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

communitySchema.index({ name: 1 });
communitySchema.index({ teacherId: 1 });

communitySchema.virtual("memberCount").get(function () {
  return this.members.length;
});

communitySchema.methods.isMember = function (userId) {
  return this.members.some((id) => id.toString() === userId.toString());
};

communitySchema.methods.isTeacher = function (userId) {
  return this.teacherId.toString() === userId.toString();
};

communitySchema.statics.createForTeacher = async function (teacherId, teacherName) {
  const communityName = `${teacherName}'s Community`;
  return this.create({
    name: communityName,
    description: `Welcome to ${teacherName}'s community`,
    teacherId,
    members: [teacherId],
  });
};

module.exports = mongoose.model("Community", communitySchema);
