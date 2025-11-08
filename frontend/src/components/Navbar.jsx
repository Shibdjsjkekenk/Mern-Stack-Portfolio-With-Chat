import React, { useState } from "react";
import logo from '../assets/logo.png'
import { useDispatch, useSelector } from "react-redux";
import { FaRegCircleUser } from "react-icons/fa6";
import { toast } from 'react-toastify'
import { setUserDetails } from '../store/userSlice';
import SummaryApi from '../common';
import { CgLogOut } from "react-icons/cg";
import axios from 'axios';
import ROLE from '../common/role';
import { Link } from "react-router-dom";
import socket from "@/socket";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [menuDisplay, setMenuDisplay] = useState(false)


    const user = useSelector(state => state?.user?.user)
    const dispatch = useDispatch()

    const handleLogout = async () => {
        try {
            const adminId = user?._id;
            if (!adminId) {
                toast.error("User ID not found. Please login again.");
                return;
            }

            // ✅ 1️⃣ Instantly broadcast offline event to all connected users
            socket.emit("admin_status", { adminId, isOnline: false });
            socket.emit("admin_logged_out", { adminId }); // ensures backend updates DB immediately
            console.log("🚪 Admin going offline + logout broadcast:", adminId);

            // ✅ 2️⃣ Cleanly disconnect socket after short delay
            setTimeout(() => {
                if (socket.connected) {
                    socket.disconnect();
                    console.log("🔴 Socket forcibly disconnected after admin logout");
                }
            }, 300);

            // ✅ 3️⃣ Proceed with backend logout API
            const response = await axios.post(
                SummaryApi.logout_user.url,
                { adminId },
                { withCredentials: true }
            );

            const data = response.data;

            if (data.success) {
                toast.success(data.message || "Logged out successfully.");
                dispatch(setUserDetails(null));

                // ✅ 4️⃣ Remove all tokens from localStorage & sessionStorage
                localStorage.removeItem("token"); // 🔒 JWT auth token
                localStorage.removeItem("adminFcmToken"); // 🔔 Firebase token
                localStorage.removeItem("userData"); // optional user cache
                sessionStorage.clear();

                console.log("🧹 Cleared all auth + FCM tokens from storage");

                // ✅ 5️⃣ Refresh / redirect safely
                setTimeout(() => {
                    window.location.href = "/"; // replaces navigate("/") for full refresh
                }, 800);
            } else {
                toast.error(data.message || "Logout failed.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Something went wrong during logout.");
        }
    };

    return (
        <nav className="bg-gradient-to-b from-white to-[#e6e6f3] fixed top-0 left-0 w-full z-50 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <a href="/" className=" ">
                            <img src={logo} alt="logo" className="w-36 h-12" />
                        </a>
                    </div>

                    <div className="hidden md:flex space-x-6 gap-5">
                        <a href="/" className=" font-bold text-[17px] hover:text-red-600">
                            Home
                        </a>
                        <div className="relative">
                            <a href="#services" className="font-bold text-[17px] hover:text-red-600">
                                Our Services
                            </a>
                            <span className="absolute -top-3 -right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0 rounded-full">
                                New
                            </span>
                        </div>
                        <a href="contact-us" className=" font-bold text-[17px] hover:text-red-600">
                            Contact Us
                        </a>
                    </div>


                    <div className="flex">
                        {
                            user?._id && (
                                <div className='w-12 h-8  rounded-full shadow-[0px_4px_8px_rgba(0,0,0,0.3),inset_0px_-2px_4px_rgba(255,255,255,0.3)] text-3xl cursor-pointer relative flex justify-center' onClick={() => setMenuDisplay(preve => !preve)}>
                                    {
                                        user?.profilePic ? (
                                            <img src={user?.profilePic} className='rounded-full' alt={user?.name} />
                                        ) : (
                                            <FaRegCircleUser />
                                        )
                                    }
                                </div>
                            )
                        }

                        {
                            menuDisplay && (
                                <div className='absolute bg-white bottom-0 top-11 h-fit p-2 shadow-lg rounded' >
                                    <nav>
                                        {
                                            user?.role === ROLE.ADMIN && (
                                                <Link to={"/admin-panel/all-users"} className='whitespace-nowrap hidden md:block hover:bg-slate-100 p-2' onClick={() => setMenuDisplay(preve => !preve)}>Admin Panel</Link>

                                            )
                                        }

                                    </nav>
                                </div>
                            )
                        }


                        {
                            user?._id ? (
                                <div onClick={handleLogout} className="md:block w-full max-w-md mx-4 flex justify-end">
                                    <div className="inline-flex items-center cursor-pointer  justify-center gap-2 whitespace-nowrap text-sm font-medium transition-transform transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[#6A38C2] disabled:pointer-events-none disabled:opacity-50 text-white px-4 py-2 rounded-full bg-[#6A38C2] shadow-[0px_4px_8px_rgba(0,0,0,0.3),inset_0px_-2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4),inset_0px_-4px_6px_rgba(255,255,255,0.4)] h-[40px]">
                                        <h3 className="text-[15px] p-2 flex items-center gap-[6px]"> <CgLogOut />  Logout</h3>
                                    </div>

                                </div>
                            )
                                : (
                                    <div className="md:block w-full max-w-md mx-4 flex justify-end">
                                        <div>
                                            <a
                                                href="tel:+918779597022"
                                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-transform transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[#6A38C2] disabled:pointer-events-none disabled:opacity-50 text-white px-4 py-2 rounded-full bg-[#6A38C2] shadow-[0px_4px_8px_rgba(0,0,0,0.3),inset_0px_-2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4),inset_0px_-4px_6px_rgba(255,255,255,0.4)] h-[40px]"
                                            >
                                                <h3 className="text-[15px] p-2">Enquiry Now</h3>
                                            </a>
                                        </div>

                                    </div>
                                )
                        }

                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-black hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        <svg
                            className="w-6 h-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <a href="/" className="block px-4 py-2 text-black font-bold hover:bg-gray-200">
                        Home
                    </a>
                    <a href="#services" className="block px-4 py-2 text-black font-bold hover:bg-gray-200">
                        Services
                    </a>
                    <a href="/" className="block px-4 py-2 text-black font-bold hover:bg-gray-200">
                        Contact Us
                    </a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
