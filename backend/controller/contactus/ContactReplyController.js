// controllers/contact/ContactReplyController.js
const nodemailer = require("nodemailer");
const ContactUs = require("../../models/ContactUsModal");

exports.replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const contactId = req.params.id;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ success: false, message: "Reply message cannot be empty" });
    }

    const contact = await ContactUs.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ success: false, message: "Email credentials not configured" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Verify connection (optional but useful for debugging)
    await transporter.verify();

    // Unique subject to avoid Gmail duplicate filter
    const mailSubject = `[Ref: ${contact._id}] Reply: ${contact.subject || "No Subject"}`;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: mailSubject,
      text: replyMessage.replace(/<[^>]*>?/gm, ""), // plain text
      html: `<p>Hi ${contact.name || ""},</p>
             <div>${replyMessage}</div>
             <p>Best regards,<br/>Your Company Name</p>`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Update contact as replied
    contact.replied = true;
    contact.reply = replyMessage;
    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      info: {
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      },
      contact: { _id: contact._id, replied: contact.replied },
    });
  } catch (err) {
    console.error("Reply Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: err.message || "Internal server error",
    });
  }
};
