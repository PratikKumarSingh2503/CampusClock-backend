const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  getAllCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunity,
  updateMessage,
  deleteMessage,
  postMessage,
  listCommunities,
  deleteCommunityAdmin,
} = require("../controllers/communityController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// === File Upload Setup ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// === Routes ===
router.get("/all", protect, getAllCommunities);
router.post("/join/:id", protect, joinCommunity);
router.post("/leave/:id", protect, leaveCommunity);
router.post("/:id/message", protect, upload.single("file"), postMessage);
router.put("/:communityId/message/:messageId", protect, updateMessage);
router.delete("/:communityId/message/:messageId", protect, deleteMessage);

router.get("/:id", protect, getCommunity);

// Admin: List all communities
router.get('/admin/communities', protect, listCommunities);
// Admin: Delete a community
router.delete('/admin/communities/:id', protect, deleteCommunityAdmin);

module.exports = router;