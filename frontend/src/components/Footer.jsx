import React, { useState } from "react";
import Footerbg from "../assets/footer-bg.jpeg";
import WhatsApp from "../assets/whatsapp-icon.png";
import { FaComments } from "react-icons/fa";
import ChatBox from "../components/ChatBox";

const Footer = () => {
  const [showChat, setShowChat] = useState(false);
  const [emailNewsletter, setEmailNewsletter] = useState("");

  return (
    <>
      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/918779597022"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-10 right-4 z-50"
      >
        <img
          src={WhatsApp}
          alt="WhatsApp"
          className="w-12 h-12 hover:shadow-xl transition-shadow duration-300"
        />
      </a>

      {/* Chat Icon Floating Button */}
      <button
        onClick={() => setShowChat((p) => !p)}
        className="fixed bottom-24 right-4 z-50 bg-[#0060AF] text-white rounded-full p-3 shadow-xl hover:scale-110 transition-transform duration-300"
      >
        <FaComments className="w-6 h-6" />
      </button>

      {/* ChatBox Modal */}
      {showChat && (
        <div className="fixed bottom-24 right-4 w-80 h-96 bg-[#0f172a] text-white shadow-2xl rounded-xl border border-gray-700 overflow-hidden z-50">
          <ChatBox onClose={() => setShowChat(false)} />
        </div>
      )}


      {/* Footer Main Section */}
      <div
        className="flex flex-col lg:flex-row items-start justify-between gap-6 px-4 lg:px-10 py-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${Footerbg})` }}
      >
        {/* Newsletter Section */}
        <div className="lg:w-1/2 bg-opacity-80 p-6 lg:p-10 rounded-lg shadow-lg text-white">
          <h2 className="text-lg font-bold">Sign up to our newsletter</h2>
          <p className="text-sm">Get updates and latest news.</p>
          <div className="flex mt-4 border rounded-full overflow-hidden">
            <input
              type="text"
              value={emailNewsletter}
              onChange={(e) => setEmailNewsletter(e.target.value)}
              placeholder="Enter Email Address"
              className="flex-grow px-4 py-2 outline-none bg-transparent text-white placeholder-white"
            />
            <button
              onClick={() => {
                if (emailNewsletter)
                  alert(`Thanks for subscribing: ${emailNewsletter}`);
                setEmailNewsletter("");
              }}
              className="bg-[#0060AF] text-sm px-4 py-2 text-white rounded-r-full"
            >
              Enquire Now
            </button>
          </div>
        </div>

        {/* Quick Links / Services / Address */}
        <div className="lg:w-1/2 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-bold text-[#EEDCB2]">Quick Links</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Home</li>
              <li>Our Services</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h2 className="text-lg font-bold text-[#EEDCB2]">Our Services</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Website Development</li>
              <li>Software Development</li>
              <li>AI Integration</li>
              <li>SEO</li>
              <li>Digital Marketing</li>
            </ul>
          </div>

          {/* Address Section */}
          <div>
            <h2 className="text-lg font-bold text-[#EEDCB2]">Address</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Mahada, Ram Mandir (West), Mumbai</li>
              <li>+91–8779597022</li>
              <li>tiwarishubhanshu7@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="bg-[#0060AF] px-8">
        <div className="flex items-center justify-center text-white pt-3 pb-3">
          <p className="text-center font-bold">
            Copyright © 2025, Tiwari's, All Rights Reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
