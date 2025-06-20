const express = require("express");
const router = express.Router();
const Reminder = require("../models/Reminder");
const authMiddleware = require("../middleware/authMiddleware");

// Get all reminders for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ dateTime: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new reminder
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, dateTime, priority, color, repeat } = req.body;
  try {
    const reminder = await Reminder.create({
      userId: req.user._id,
      title,
      description,
      dateTime,
      priority,
      color,
      repeat,
    });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// Update a reminder
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});

// Delete a reminder
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const Reminder = require("../models/Reminder");
// const auth = require("../middleware/authMiddleware");

// // Create reminder
// router.post("/", auth, async (req, res) => {
//   try {
//     const { title, description, dateTime, priority, color, repeat } = req.body;

//     const reminder = await Reminder.create({
//       user: req.user.id,
//       title,
//       description,
//       dateTime: new Date(dateTime),
//       priority,
//       color,
//       repeat
//     });

//     res.status(201).json(reminder);
//   } catch (err) {
//     if (err.name === 'ValidationError' || err.message === "Reminder date must be in the future") {
//       return res.status(400).json({ error: err.message });
//     }
//     console.error("Error creating reminder:", err);
//     res.status(500).json({ error: "Error creating reminder" });
//   }
// });

// // Get all reminders
// router.get("/", auth, async (req, res) => {
//   try {
//     const reminders = await Reminder.find({ user: req.user.id })
//       .sort({ dateTime: 1 });
//     res.json(reminders);
//   } catch (err) {
//     console.error("Error fetching reminders:", err);
//     res.status(500).json({ error: "Error fetching reminders" });
//   }
// });

// // Get due reminders (for notifications) - MUST be before /:id route
// router.get("/due", auth, async (req, res) => {
//   try {
//     const now = new Date();
//     const upcoming = await Reminder.find({
//       user: req.user.id,
//       dateTime: { $lte: now },
//       notified: false
//     }).sort({ dateTime: 1 });

//     // Mark them as notified and handle repeating reminders
//     const processedReminders = [];
//     for (const rem of upcoming) {
//       try {
//         rem.notified = true;
//         await rem.save();

//         // Handle repeating reminders
//         if (rem.repeat !== "none") {
//           const nextDate = new Date(rem.dateTime);
//           switch (rem.repeat) {
//             case "daily":
//               nextDate.setDate(nextDate.getDate() + 1);
//               break;
//             case "weekly":
//               nextDate.setDate(nextDate.getDate() + 7);
//               break;
//             case "monthly":
//               nextDate.setMonth(nextDate.getMonth() + 1);
//               break;
//           }

//           // Only create new reminder if next date is in the future
//           if (nextDate > now) {
//             const newReminder = await Reminder.create({
//               user: req.user.id,
//               title: rem.title,
//               description: rem.description,
//               dateTime: nextDate,
//               priority: rem.priority,
//               color: rem.color,
//               repeat: rem.repeat
//             });
//             processedReminders.push(newReminder);
//           }
//         }
//         processedReminders.push(rem);
//       } catch (err) {
//         console.error("Error processing reminder:", err);
//         // Continue with other reminders even if one fails
//         continue;
//       }
//     }

//     res.json(processedReminders);
//   } catch (err) {
//     console.error("Error checking due reminders:", err);
//     res.status(500).json({ error: "Error checking due reminders" });
//   }
// });

// // Get reminder by ID - MUST be after /due route
// router.get("/:id", auth, async (req, res) => {
//   try {
//     const reminder = await Reminder.findOne({
//       _id: req.params.id,
//       user: req.user.id
//     });

//     if (!reminder) {
//       return res.status(404).json({ error: "Reminder not found" });
//     }

//     res.json(reminder);
//   } catch (err) {
//     console.error("Error fetching reminder:", err);
//     res.status(500).json({ error: "Error fetching reminder" });
//   }
// });

// // Update reminder
// router.put("/:id", auth, async (req, res) => {
//   try {
//     const { title, description, dateTime, priority, color, repeat } = req.body;

//     const reminder = await Reminder.findOneAndUpdate(
//       { _id: req.params.id, user: req.user.id },
//       {
//         title,
//         description,
//         dateTime: new Date(dateTime),
//         priority,
//         color,
//         repeat,
//         notified: false // Reset notification status when updating
//       },
//       { new: true, runValidators: true }
//     );

//     if (!reminder) {
//       return res.status(404).json({ error: "Reminder not found" });
//     }

//     res.json(reminder);
//   } catch (err) {
//     if (err.name === 'ValidationError' || err.message === "Reminder date must be in the future") {
//       return res.status(400).json({ error: err.message });
//     }
//     console.error("Error updating reminder:", err);
//     res.status(500).json({ error: "Error updating reminder" });
//   }
// });

// // Delete reminder
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const reminder = await Reminder.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user.id
//     });

//     if (!reminder) {
//       return res.status(404).json({ error: "Reminder not found" });
//     }

//     res.json({ message: "Reminder deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting reminder:", err);
//     res.status(500).json({ error: "Error deleting reminder" });
//   }
// });

// module.exports = router;
