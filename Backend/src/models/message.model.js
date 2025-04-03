import mongoose, {Schema} from 'mongoose'

const messageSchema = Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
    sender: {
        type: String,
        enum: ["user", "ai"],
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    imageAttached: {
        type: String // URL to Cloudinary if image is sent
    },

},
{
    timestamps: true
})

export const Message = mongoose.model("Message", messageSchema);