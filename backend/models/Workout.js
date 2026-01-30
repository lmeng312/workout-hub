const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sets: [{
    reps: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number, // in seconds
      default: 0
    },
    rest: {
      type: Number, // in seconds
      default: 60
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  }
});

const workoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exercises: [exerciseSchema],
  source: {
    type: {
      type: String,
      enum: ['custom', 'youtube', 'instagram'],
      default: 'custom'
    },
    url: {
      type: String,
      default: ''
    },
    originalText: {
      type: String,
      default: ''
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

workoutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
