const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  profilePic: {
    type: String,
    default: "",
    validate: {
      validator: function(v) {
        return v === "" || v.startsWith("http");
      },
      message: "Profile picture must be a valid URL"
    }
  },
  user_name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  user_email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  user_id: { 
    type: String, 
    required: [true, "User ID is required"], 
    unique: true,
    trim: true,
    minlength: [3, "User ID must be at least 3 characters long"],
    maxlength: [20, "User ID cannot exceed 20 characters"]
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
  user_role: { 
    type: String, 
    enum: {
      values: ["student", "teacher", "admin"],
      message: "{VALUE} is not a valid role"
    },
    default: "student"
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Index for faster queries
userSchema.index({ user_email: 1 });
userSchema.index({ user_id: 1 });

module.exports = mongoose.model("User", userSchema);
