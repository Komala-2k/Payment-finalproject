import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

contactSchema.statics.checkPhoneNumber = async function(phoneNumber) {
    const existingContact = await this.findOne({ phoneNumber });
    if (existingContact) {
        throw new Error('Phone number already registered');
    }
    return true;
};

contactSchema.statics.addContact = async function(name, phoneNumber, userId) {
    await this.checkPhoneNumber(phoneNumber);

    const contact = new this({ name, phoneNumber, userId });
    return await contact.save();
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
