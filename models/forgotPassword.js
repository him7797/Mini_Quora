const mongoose = require('mongoose');
const forgotPasswordSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    phone: {
        type: String,
    },
    code: {
        type: Number
    },
    status: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

module.exports = mongoose.model('forgotPasswords', forgotPasswordSchema);