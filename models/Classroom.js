const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true },           // <-- Add this
  description: { type: String },                     // <-- And this
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

classroomSchema.index({ code: 1 });


module.exports = mongoose.model("Classroom", classroomSchema);
// const mongoose = require("mongoose");

// const classroomSchema = new mongoose.Schema({
//   code: { type: String, unique: true, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   joinedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Classroom", classroomSchema);
