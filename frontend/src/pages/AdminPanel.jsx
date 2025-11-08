import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaRegCircleUser } from "react-icons/fa6";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import ROLE from "../common/role";
import { FaInfoCircle, FaProjectDiagram, FaRegUser, FaUsersCog } from "react-icons/fa";
import { MdContactMail, MdOutlineDashboard, MdOutlineDashboardCustomize, MdOutlineProductionQuantityLimits } from "react-icons/md";
import { GoProjectRoadmap } from "react-icons/go";
import { BsInfoCircle } from "react-icons/bs";
import { GrUnorderedList } from "react-icons/gr";
import { MdAdminPanelSettings } from "react-icons/md";
import { RiTimelineView } from "react-icons/ri";
import { markContactsAsRead } from "@/store/ContactSlice"; // import new action

const AdminPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.split("/").pop();

  const { user, loading } = useSelector((state) => state?.user);
  const { unreadCount } = useSelector((state) => state.contact); // get unread from Redux

  // Redirect if user not admin
  useEffect(() => {
    if (loading) return;
    if (!user || user?.role !== ROLE.ADMIN) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Reset unread count when user visits contact page
  useEffect(() => {
    if (currentPage === "contact-data" && unreadCount > 0) {
      dispatch(markContactsAsRead());
    }
  }, [currentPage, unreadCount, dispatch]);

  if (loading) {
    return <div className="pt-16 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-120px)] md:flex hidden pt-16">
      <aside className="bg-white min-h-full w-full max-w-60 customShadow">
        <div className="h-32 flex justify-center items-center flex-col">
          <div className="text-5xl cursor-pointer relative flex justify-center pt-6">
            {user?.profilePic ? (
              <img
                src={user?.profilePic}
                className="w-20 h-23 rounded-full"
                alt={user?.name}
              />
            ) : (
              <FaRegCircleUser />
            )}
          </div>
          <p className="capitalize text-lg font-semibold icon">
            <MdAdminPanelSettings /> {user?.name}
          </p>
          <p className="text-sm">({user?.role})</p>
        </div>

        {/* Navigation */}
        <div className="pt-7">
          <nav className="grid p-4 gap-2">
            <Link
              to={"dashboard"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon relative"
              style={
                currentPage === "dashboard"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <MdOutlineDashboardCustomize /> Dashboard
            </Link>

            <Link
              to={"all-users"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon"
              style={
                currentPage === "all-users"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <FaUsersCog /> All Users
            </Link>

            <Link
              to={"exp-projects"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon"
              style={
                currentPage === "exp-projects"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <GoProjectRoadmap /> Exp. Project
            </Link>

            <Link
              to={"relevant-project"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon"
              style={
                currentPage === "relevant-project"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <FaProjectDiagram />  Relevant Exp. Project
            </Link>

            <Link
              to={"about-us"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon"
              style={
                currentPage === "about-us"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <BsInfoCircle /> About Us
            </Link>

            <Link
              to={"banner-section"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon"
              style={
                currentPage === "banner-section"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <MdOutlineDashboard />  Banner
            </Link>

            <Link
              to={"timeline"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon"
              style={
                currentPage === "timeline"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <RiTimelineView /> Timeline
            </Link>

            {/* Contact Data with unread badge */}
            <Link
              to={"contact-data"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon relative"
              style={
                currentPage === "contact-data"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <MdContactMail /> Contact Data
              {unreadCount > 0 && (
                <span className="absolute right-2 top-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  +{unreadCount}
                </span>
              )}
            </Link>

             <Link
              to={"admin-chat"}
              className="px-2 py-1 hover:bg-[#f16b5030] rounded-[10px] icon relative"
              style={
                currentPage === "admin-chat"
                  ? { backgroundColor: "#F16B50", color: "white", fontWeight: "500", borderRadius: "10px" }
                  : {}
              }
            >
              <MdContactMail /> Messenger's
              {unreadCount > 0 && (
                <span className="absolute right-2 top-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  +{unreadCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </aside>

      <main className="w-full h-full p-2">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
