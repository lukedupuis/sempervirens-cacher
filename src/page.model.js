import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  url: { type: String },
  html: { type: String }
}, {
  timestamps: true,
  versionKey: false
});

export default {
  name: 'Page',
  schema: pageSchema
};