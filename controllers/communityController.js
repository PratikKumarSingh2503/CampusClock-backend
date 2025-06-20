const Community = require("../models/Community.js");
const User = require("../models/User");
const path = require("path");

// GET all communities
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("teacherId", "user_name profilePic user_role")
      .populate("members", "user_name profilePic user_role");

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching communities", error: error.message });
  }
};

// POST join community
const joinCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member of this community" });
    }

    community.members.push(userId);
    await community.save();

    res.json({ message: "Joined successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error joining community", error: error.message });
  }
};

// POST leave community
const leaveCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (!community.members.includes(userId)) {
      return res.status(400).json({ message: "Not a member of this community" });
    }

    await Community.findByIdAndUpdate(communityId, {
      $pull: { members: userId },
    });

    res.json({ message: "Left community" });
  } catch (error) {
    res.status(500).json({ message: "Error leaving community", error: error.message });
  }
};

// PUT /api/communities/:communityId/message/:messageId
const updateMessage = async (req, res) => {
  try {
    const { communityId, messageId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text cannot be empty" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const message = community.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this message" });
    }

    message.text = text;
    await community.save();

    res.status(200).json({ message: "Message updated successfully" });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({ message: "Error updating message", error: error.message });
  }
};


// DELETE /api/communities/:communityId/message/:messageId
// const deleteMessage = async (req, res) => {
//   try {
//     const { communityId, messageId } = req.params;
//     const userId = req.user._id;

//     const community = await Community.findById(communityId);
//     if (!community) {
//       return res.status(404).json({ message: "Community not found" });
//     }

//     const message = community.messages.id(messageId);
//     if (!message) {
//       return res.status(404).json({ message: "Message not found" });
//     }

//     if (message.uploadedBy.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "You are not authorized to delete this message" });
//     }

//     message.remove();
//     await community.save();

//     res.status(200).json({ message: "Message deleted successfully" });
//   } catch (error) {
//     console.error("Delete message error:", error);
//     res.status(500).json({ message: "Error deleting message", error: error.message });
//   }
// };
const deleteMessage = async (req, res) => {
  try {
    const { communityId, messageId } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const message = community.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this message" });
    }

    // Use pull to remove the subdocument from the array
    community.messages.pull(message._id);
    await community.save();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Error deleting message", error: error.message });
  }
};

// POST message (text and/or file)
const postMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const file = req.file;
    const communityId = req.params.id;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.teacherId.toString() !== userId && req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Only the teacher or admin can post messages' });
    }

    if (!text && !file) {
      return res.status(400).json({ message: "Message must contain text or a file" });
    }

    // File validation
    let fileMeta = null;
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedExtensions = [".pdf", ".doc", ".docx"];
      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({ message: "Invalid file type. Only PDF, DOC, DOCX allowed." });
      }

      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "File size too large. Max 5MB allowed." });
      }

      fileMeta = {
        url: `/uploads/${file.filename}`,
        filename: file.originalname,
        fileType: ext.replace(".", ""),
        fileSize: file.size,
      };
    }

    const message = {
      text: text || "",
      file: fileMeta,
      createdAt: new Date(),
      uploadedBy: userId,
    };

    community.messages.push(message);
    await community.save();

    res.json({ message: "Posted successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Error posting message", error: error.message });
  }
};

// GET one community
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("teacherId", "user_name profilePic user_role")
      .populate("members", "user_name profilePic user_role");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: "Error fetching community", error: error.message });
  }
};


// Utility: Create a community for a teacher
const createTeacherCommunity = async (teacherId, teacherName) => {
  try {
    const community = await Community.createForTeacher(teacherId, teacherName);
    return community;
  } catch (error) {
    console.error("Error creating teacher community:", error);
    throw error;
  }
};

// List all communities (admin only)
const listCommunities = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const communities = await Community.find().populate('teacherId', 'user_name user_email');
    res.json(communities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a community (admin only)
const deleteCommunityAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Community.findByIdAndDelete(req.params.id);
    res.json({ message: 'Community deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export all
module.exports = {
  getAllCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  updateMessage,
  deleteMessage,
  postMessage,
  createTeacherCommunity,
  listCommunities,
  deleteCommunityAdmin,
};