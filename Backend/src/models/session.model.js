import mongoose, {Schema} from "mongoose";

const sessionSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: { 
        type: String,
        default: "Untitled Chat"
    },

    imageUrl: { type: String },
    medicalHistory: { type: String },
},
{
    timestamps: true
})

export const Session = mongoose.model('Session', sessionSchema);