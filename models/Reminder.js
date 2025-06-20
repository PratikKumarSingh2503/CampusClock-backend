const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    dateTime: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    color: {
      type: String,
      default: "#3B82F6", // Tailwind's blue-500
    },
    repeat: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
// const mongoose = require("mongoose");

// const reminderSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "User",
//     required: true 
//   },
//   title: { 
//     type: String, 
//     required: [true, "Title is required"],
//     trim: true,
//     maxlength: [100, "Title cannot exceed 100 characters"]
//   },
//   description: {
//     type: String,
//     trim: true,
//     maxlength: [500, "Description cannot exceed 500 characters"]
//   },
//   dateTime: { 
//     type: Date, 
//     required: [true, "Date and time is required"]
//   },
//   priority: {
//     type: String,
//     enum: ["low", "medium", "high"],
//     default: "medium"
//   },
//   color: {
//     type: String,
//     default: "#3B82F6" // Default blue color
//   },
//   notified: { 
//     type: Boolean, 
//     default: false 
//   },
//   repeat: {
//     type: String,
//     enum: ["none", "daily", "weekly", "monthly"],
//     default: "none"
//   }
// }, { 
//   timestamps: true,
//   toJSON: {
//     transform: function(doc, ret) {
//       ret.id = ret._id;
//       delete ret._id;
//       delete ret.__v;
//       return ret;
//     }
//   }
// });

// // Add pre-save middleware to validate dateTime only for non-repeating reminders
// reminderSchema.pre('save', function(next) {
//   if (this.isNew && this.repeat === "none") {
//     if (this.dateTime <= new Date()) {
//       next(new Error("Reminder date must be in the future"));
//       return;
//     }
//   }
//   next();
// });

// // Index for faster queries
// reminderSchema.index({ user: 1, dateTime: 1 });
// reminderSchema.index({ dateTime: 1, notified: 1 });

// module.exports = mongoose.model("Reminder", reminderSchema);
