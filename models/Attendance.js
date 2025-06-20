const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 2 },
  latitude: Number,
  longitude: Number,
  markedStudents: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    markedAt: Date,
    location: {
      latitude: Number,
      longitude: Number
    }
  }]
});

module.exports = mongoose.model("Attendance", attendanceSchema);

// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema({
//   classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
//   startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   startTime: { type: Date, required: true },
//   durationMinutes: { type: Number, default: 2 },
//   latitude: {
//     type: Number,
//     required: true,
//     min: -90,
//     max: 90
//   },
//   longitude: {
//     type: Number,
//     required: true,
//     min: -180,
//     max: 180
//   },
//   markedStudents: [{
//     student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     markedAt: Date,
//     location: {
//       latitude: { type: Number, required: true, min: -90, max: 90 },
//       longitude: { type: Number, required: true, min: -180, max: 180 }
//     }
//   }]
// });


// attendanceSchema.virtual('endTime').get(function () {
//   return new Date(this.startTime.getTime() + this.durationMinutes * 60000);
// });

// module.exports = mongoose.model("Attendance", attendanceSchema);
