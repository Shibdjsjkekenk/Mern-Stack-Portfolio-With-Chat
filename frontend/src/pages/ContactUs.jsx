import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useContact } from "@/customHooks/useContactUs";

const ContactUs = () => {
  const { createContact } = useContact();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createContact(formData);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 pt-20 pb-20">
        
        {/* Left - Static Contact Info */}
        <div className="space-y-6 col-span-1">
          <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow">
            <FaMapMarkerAlt className="text-blue-600 text-2xl" />
            <div>
              <h4 className="font-semibold text-lg">Address</h4>
              <p className="text-gray-600 text-sm">Mumbai, Maharashtra.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow">
            <FaPhoneAlt className="text-blue-600 text-2xl" />
            <div>
              <h4 className="font-semibold text-lg">Phone</h4>
              <p className="text-gray-600 text-sm">
                <a href="tel:+918779597022">+91-8779597022</a>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow">
            <FaEnvelope className="text-blue-600 text-2xl" />
            <div>
              <h4 className="font-semibold text-lg">E-mail</h4>
              <p className="text-gray-600 text-sm">
                <a href="mailto:tiwarishubhanshu7@gmail.com">
                  tiwarishubhanshu7@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right - Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow col-span-2">
          <h3 className="text-2xl font-bold mb-2">Send Us Message</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name *"
                value={formData.name}
                onChange={handleChange}
                required
                className="border px-4 py-2 rounded-lg w-full"
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail *"
                value={formData.email}
                onChange={handleChange}
                required
                className="border px-4 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone *"
                value={formData.phone}
                onChange={handleChange}
                required
                className="border px-4 py-2 rounded-lg w-full"
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg w-full"
              />
            </div>
            <textarea
              name="message"
              placeholder="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="border px-4 py-2 rounded-lg w-full"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-400 text-black rounded-full hover:bg-yellow-500"
            >
              Submit Now →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
