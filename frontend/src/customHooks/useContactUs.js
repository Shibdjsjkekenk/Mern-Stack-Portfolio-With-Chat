import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import { toast } from "react-toastify";
import {
  setContactList,
  addContact,
  updateContact,
  removeContact,
  markContactsAsRead,
  setLoading,
  setError,
  setSelectedContact,
  replyToContact,
} from "@/store/ContactSlice";

export const useContact = () => {
  const dispatch = useDispatch();
  const { contacts, loading, error, selectedContact } = useSelector(
    (state) => state.contact
  );

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(SummaryApi.getAllContacts.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });

      if (res.data.success) {
        dispatch(setContactList(res.data.data));
      } else {
        toast.error(res.data.message || "Failed to fetch contacts");
      }
    } catch {
      dispatch(setError("Error fetching contacts"));
      toast.error("Error fetching contacts");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Reply to a contact
  const replyToContactEmail = async (id, replyMessage) => {
    try {
      if (!replyMessage || !replyMessage.trim()) {
        toast.error("Reply message cannot be empty");
        return;
      }

      // Send reply to backend
      const res = await axios.post(
        SummaryApi.replyToContact(id).url,
        { replyMessage },
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        }
      );

      if (res.data.success) {
        // Log email delivery info for debugging
        console.log("Email info:", res.data.info);

        // Update Redux state immediately
        dispatch(
          replyToContact({
            _id: id,
            reply: replyMessage,
            replied: true,
          })
        );

        toast.success("Reply sent to user via email!");
      } else {
        toast.error(res.data.message || "Failed to send reply");
      }
    } catch (error) {
      console.error("Reply Error:", error.response || error);
      toast.error(error.response?.data?.message || "Error sending reply");
    }
  };

  // Other hooks
  const createContact = async (data) => {
    try {
      const res = await axios.post(SummaryApi.createContact.url, data, {
        withCredentials: false,
      });
      if (res.data.success) {
        dispatch(addContact(res.data.contact));
        toast.success(
          "Your email has been sent successfully!\n(Our representative will call you shortly.)"
        );
      } else {
        toast.error(res.data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
    }
  };

  const updateContactData = async (id, data) => {
    try {
      const res = await axios.put(SummaryApi.updateContact(id).url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(updateContact(res.data.data));
        toast.success("Contact updated");
      } else {
        toast.error(res.data.message || "Failed to update contact");
      }
    } catch {
      toast.error("Error updating contact");
    }
  };

  const deleteContactById = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    dispatch(removeContact(id));
    try {
      const res = await axios.delete(SummaryApi.deleteContact(id).url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) toast.success("Contact deleted");
      else toast.error(res.data.message || "Delete failed");
    } catch {
      toast.error("Delete failed");
      fetchContacts();
    }
  };

  const selectContact = (contact) => dispatch(setSelectedContact(contact));

  const markContactAsRead = async (id) => {
    try {
      const contact = contacts.find((c) => c._id === id);
      if (!contact || contact.read) return;
      const updatedContact = { ...contact, read: true };
      await updateContactData(id, updatedContact);
    } catch (error) {
      toast.error("Failed to mark contact as read");
    }
  };

  const markAllContactsRead = async () => {
    try {
      await axios.patch(SummaryApi.markAllContactsRead.url, null, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      dispatch(markContactsAsRead());
    } catch {
      toast.error("Failed to mark all contacts as read");
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("token");
    if (isAdmin) fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    selectedContact,
    fetchContacts,
    createContact,
    updateContactData,
    deleteContactById,
    selectContact,
    markContactAsRead,
    markAllContactsRead,
    replyToContactEmail,
  };
};
