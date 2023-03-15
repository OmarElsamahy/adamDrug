const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const companySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
companySchema.plugin(toJSON);
companySchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The company's email
 * @param {ObjectId} [excludeCompanyId] - The id of the company to be excluded
 * @returns {Promise<boolean>}
 */
companySchema.statics.isEmailTaken = async function (email, excludeCompanyId) {
  const company = await this.findOne({ email, _id: { $ne: excludeCompanyId } });
  return !!company;
};

/**
 * Check if password matches the company's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
companySchema.methods.isPasswordMatch = async function (password) {
  const company = this;
  return bcrypt.compare(password, company.password);
};

companySchema.pre('save', async function (next) {
  const company = this;
  if (user.isModified('password')) {
    company.password = await bcrypt.hash(company.password, 8);
  }
  next();
});

/**
 * @typedef Company
 */
const Company = mongoose.model('Company', companySchema);

module.exports = Company;
