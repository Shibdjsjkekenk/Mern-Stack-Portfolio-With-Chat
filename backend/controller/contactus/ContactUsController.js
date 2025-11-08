const ContactUs = require("../../models/ContactUsModal");

// Create Contact
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Phone are required" });
    }

    const contact = new ContactUs({
      name,
      email,
      phone,
      subject,
      message,
      read: false, // ✅ Ensure new contact is unread
    });

    await contact.save();

    res
      .status(201)
      .json({ success: true, message: "Contact created successfully", contact });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating contact", error });
  }
};

// Get All Contacts
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching contacts", error });
  }
};

// Get Single Contact by ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await ContactUs.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching contact", error });
  }
};

// Update Contact
exports.updateContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, read } = req.body; // ✅ include read

    const updatedContact = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, subject, message, read }, // ✅ update read status
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating contact", error });
  }
};

// Delete Contact
exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await ContactUs.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting contact", error });
  }
};

// ✅ New Endpoint: Mark all contacts as read
exports.markAllContactsRead = async (req, res) => {
  try {
    await ContactUs.updateMany({ read: false }, { read: true });
    res.status(200).json({ success: true, message: "All contacts marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error marking contacts as read", error });
  }
};
