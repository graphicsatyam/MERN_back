import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    uploadedDate: { type: Date, required: true },
  eventName: { type: String, required: true },
  startingDate: { type: Date, required: true },
  endingDate: { type: Date, required: true },
  guest: { type: String, required: true },
  description: { type: String, required: true },
  currentUser: { type: String, required: true },
  userlimit: { type: Number, required: true },
  time: { type: String, required: true }
});

const Events = mongoose.model('Events', eventSchema);

export { Events };
