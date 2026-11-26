import mongoose from 'mongoose'

const rsvpSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    attendance: { type: String, enum: ['Yes', 'No', 'Maybe'], required: true },
    guests: { type: Number, min: 1, max: 20, default: 1 },
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    paid: { type: Boolean, default: false },
    paymentRef: { type: String, default: '' },
  },
  { timestamps: true },
)

export const Rsvp = mongoose.model('Rsvp', rsvpSchema)
