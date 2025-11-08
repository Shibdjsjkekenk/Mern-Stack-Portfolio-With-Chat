import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineMail } from "react-icons/ai";
import { useContact } from "@/customHooks/useContactUs";

const ContactForm = () => {
  const {
    contacts,
    fetchContacts,
    deleteContactById,
    markContactAsRead,
    replyToContactEmail,
    loading,
  } = useContact();

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const openReplyModal = (contact) => {
    setSelectedContact(contact);
    setReplyMessage(""); // reset previous reply
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      alert("Please type a reply message");
      return;
    }

    if (!selectedContact) return;

    setSendingReply(true);
    await replyToContactEmail(selectedContact._id, replyMessage);
    setSendingReply(false);
    setShowReplyModal(false);
    fetchContacts(); // Refresh table to show replied status
  };

  if (loading)
    return (
      <p className="text-center text-blue-500 font-medium">
        Loading contacts...
      </p>
    );

  if (!contacts || contacts.length === 0)
    return (
      <p className="text-center text-gray-500 mt-6">No contacts found.</p>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Contact Messages
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg userTable overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Replied</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact, index) => (
              <tr
                key={contact._id}
                className={`text-center hover:bg-gray-50 transition cursor-pointer ${!contact.read ? "bg-yellow-50" : ""
                  }`}
                onClick={() => markContactAsRead(contact._id)}
              >
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border font-medium white-space">{contact.name || "-"}</td>
                <td className="p-2 border">{contact.email}</td>
                <td className="p-2 border">{contact.phone}</td>
                <td className="p-2 border">{contact.subject || "-"}</td>
                <td className="p-2 border white-space">{contact.message || "-"}</td>
                <td className="p-2 border white-space">
                  {new Date(contact.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">
                  {contact.replied ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600 font-medium">No</span>
                  )}
                </td>
                <td className="!p-4 border flex justify-center gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      openReplyModal(contact);
                    }}
                    title="Reply to Contact"
                  >
                    <AiOutlineMail size={20} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteContactById(contact._id);
                    }}
                    title="Delete Contact"
                  >
                    <AiOutlineDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Reply Modal ---------------- */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-4 relative">
            <h3 className="text-lg font-bold mb-2">Reply to {selectedContact.name}</h3>
            <p className="mb-3 text-gray-700">
              <strong>Original Message:</strong><br />
              {selectedContact.message}
            </p>
            <textarea
              className="w-full border rounded p-2 mb-3"
              rows={5}
              placeholder="Type your reply here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              disabled={sendingReply}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowReplyModal(false)}
                disabled={sendingReply}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSendReply}
                disabled={sendingReply}
              >
                {sendingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
