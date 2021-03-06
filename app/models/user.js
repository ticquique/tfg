
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = mongoose.Schema({
  role: {
    type: Schema.Types.ObjectId, required: true, ref: 'Role'
  },
  email: {
    type: String, required: true, unique: true
  },
  username: {
    type: String, required: true, index: true
  },
  password: {
    type: String, required: true, minlength: 7, maxlength: 80
  },
  posts: {
    type: [{ type: Schema.Types.ObjectId, required: false, ref: 'Post' }]
  },
  likes: [{
    type: Schema.Types.ObjectId  ,
    required: false, 
    ref: 'Like'
  }],
  dislikes: [{
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Dislike' 
  }],
  numComments: {
    type: Number, default: 0, required: false
  },
  privileges: {
    type: String,
    enum: ['Member', 'Client', 'Owner', 'admin'],
    default: 'Member'
  },
  profile: {
    city: { type: String, required: false },
    country: { type: Schema.Types.ObjectId, required: false, rel: 'Country' },
    age: { type: Number, required: false },
    sex: { type: String, required: false },
    phone: { type: String, required: false },
    employment_situation: { type: String, required: false },
    employment: { type: String, required: false },
    hobbies: { type: String, required: false },
  },
  points: {
    firstreg: { type: Number, default: 10, required: false },
    numComments: { type: Number, default: 0, required: false },
    numLikes: { type: Number, default: 0, required: false }
  },
  langKey: {
    type: String,
    default: 'en'
  }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

UserSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
      this.password = hash;
      next();
  });
});


UserSchema.methods.comparePassword = function (candidatePassword) {
  let password = this.password;
  return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, password, (err, success) => {
          if (err) return reject(err);
          return resolve(success);
      });
  });
};

const User = module.exports = mongoose.model('User', UserSchema);

const _updateUser = function (id, query, callback) {
  
  if (query.password) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(query.password, salt, (err, hash) => {
        if (err) throw err;
        query.password = hash;
        User.findByIdAndUpdate(id, { $set: query }, callback);
      });
    });
  } else {
    User.findByIdAndUpdate(id, { $set: query }, callback);
  }
}

module.exports.updateUser = _updateUser;