export const backendDomin = "http://localhost:8080";
// const backendDomin = import.meta.env.VITE_BACKEND_URL;

// ✅ Get Authorization headers safely
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SummaryApi = {
  // ------------------ AUTH ------------------
  signUP: {
    url: `${backendDomin}/api/signup`,
    method: "post",
  },
  signIn: {
    url: `${backendDomin}/api/signin`,
    method: "post",
  },
  current_user: {
    url: `${backendDomin}/api/user-details`,
    method: "get",
  },
  logout_user: {
    url: `${backendDomin}/api/userLogout`,
    method: "post",
  },

  // ------------------ USERS ------------------
  allUser: {
    url: `${backendDomin}/api/all-user`,
    method: "get",
  },
  updateUser: {
    url: `${backendDomin}/api/update-user`,
    method: "post",
  },

  // ------------------ PROJECTS ------------------
  createProject: {
    url: `${backendDomin}/api/projects`,
    method: "post",
  },
  getAllProjects: {
    url: `${backendDomin}/api/projects`,
    method: "get",
  },
  getProjectById: (id) => ({
    url: `${backendDomin}/api/projects/${id}`,
    method: "get",
  }),
  updateProject: (id) => ({
    url: `${backendDomin}/api/projects/${id}`,
    method: "put",
  }),
  deleteProject: (id) => ({
    url: `${backendDomin}/api/projects/${id}`,
    method: "delete",
  }),
  updateProjectStatus: (id) => ({
    url: `${backendDomin}/api/projects/${id}/status`,
    method: "patch",
  }),

  // ------------------ RELEVANT CONTENT ------------------
  getAllRelevantContent: {
    url: `${backendDomin}/api/relevant-content`,
    method: "get",
  },
  createRelevantContent: {
    url: `${backendDomin}/api/relevant-content`,
    method: "post",
  },
  updateRelevantContent: (id) => ({
    url: `${backendDomin}/api/relevant-content/${id}`,
    method: "put",
  }),
  deleteRelevantContent: (id) => ({
    url: `${backendDomin}/api/relevant-content/${id}`,
    method: "delete",
  }),

  // ------------------ RELEVANT PROJECTS ------------------
  createRelevantProject: {
    url: `${backendDomin}/api/relevant-project`,
    method: "post",
  },
  getAllRelevantProjects: {
    url: `${backendDomin}/api/relevant-project`,
    method: "get",
  },
  getRelevantProjectById: (id) => ({
    url: `${backendDomin}/api/relevant-project/${id}`,
    method: "get",
  }),
  updateRelevantProject: (id) => ({
    url: `${backendDomin}/api/relevant-project/${id}`,
    method: "put",
  }),
  deleteRelevantProject: (id) => ({
    url: `${backendDomin}/api/relevant-project/${id}`,
    method: "delete",
  }),
  updateRelevantProjectStatus: (id) => ({
    url: `${backendDomin}/api/relevant-project/${id}/status`,
    method: "patch",
  }),

  // ------------------ EXPERIENCE CONTENT ------------------
  createExperience: {
    url: `${backendDomin}/api/experience`,
    method: "post",
  },
  getAllExperience: {
    url: `${backendDomin}/api/experience`,
    method: "get",
  },
  getExperienceById: (id) => ({
    url: `${backendDomin}/api/experience/${id}`,
    method: "get",
  }),
  updateExperience: (id) => ({
    url: `${backendDomin}/api/experience/${id}`,
    method: "put",
  }),
  deleteExperience: (id) => ({
    url: `${backendDomin}/api/experience/${id}`,
    method: "delete",
  }),

  // ------------------ ABOUT US ------------------
  getAllAboutUs: {
    url: `${backendDomin}/api/about-us`,
    method: "get",
  },
  createAboutUs: {
    url: `${backendDomin}/api/about-us`,
    method: "post",
  },
  updateAboutUs: (id) => ({
    url: `${backendDomin}/api/about-us/${id}`,
    method: "put",
  }),
  deleteAboutUs: (id) => ({
    url: `${backendDomin}/api/about-us/${id}`,
    method: "delete",
  }),
  updateAboutUsStatus: (id) => ({
    url: `${backendDomin}/api/about-us/${id}/status`,
    method: "patch",
  }),

  // ------------------ BANNERS ------------------
  getAllBanners: {
    url: `${backendDomin}/api/banner`,
    method: "get",
  },
  createBanner: {
    url: `${backendDomin}/api/banner`,
    method: "post",
  },
  getBannerById: (id) => ({
    url: `${backendDomin}/api/banner/${id}`,
    method: "get",
  }),
  updateBanner: (id) => ({
    url: `${backendDomin}/api/banner/${id}`,
    method: "put",
  }),
  deleteBanner: (id) => ({
    url: `${backendDomin}/api/banner/${id}`,
    method: "delete",
  }),
  updateBannerStatus: (id) => ({
    url: `${backendDomin}/api/banner/${id}/status`,
    method: "patch",
  }),

  // ------------------ TIMELINE ------------------
  createTimeline: {
    url: `${backendDomin}/api/timeline`,
    method: "post",
  },
  getAllTimelines: {
    url: `${backendDomin}/api/timeline`,
    method: "get",
  },
  getTimelineById: (id) => ({
    url: `${backendDomin}/api/timeline/${id}`,
    method: "get",
  }),
  updateTimeline: (id) => ({
    url: `${backendDomin}/api/timeline/${id}`,
    method: "put",
  }),
  deleteTimeline: (id) => ({
    url: `${backendDomin}/api/timeline/${id}`,
    method: "delete",
  }),
  updateTimelineStatus: (id) => ({
    url: `${backendDomin}/api/timeline/${id}/status`,
    method: "patch",
  }),

  // ------------------ CONTACT US ------------------
  createContact: {
    url: `${backendDomin}/api/contact-us`,
    method: "post", // public form submit
  },
  getAllContacts: {
    url: `${backendDomin}/api/contact-us`,
    method: "get", // admin only
    headers: getAuthHeaders(),
  },
  getContactById: (id) => ({
    url: `${backendDomin}/api/contact-us/${id}`,
    method: "get",
    headers: getAuthHeaders(),
  }),
  updateContact: (id) => ({
    url: `${backendDomin}/api/contact-us/${id}`,
    method: "put",
    headers: getAuthHeaders(),
  }),
  deleteContact: (id) => ({
    url: `${backendDomin}/api/contact-us/${id}`,
    method: "delete",
    headers: getAuthHeaders(),
  }),
  markAllContactsRead: {
    url: `${backendDomin}/api/contact-us/mark-read`,
    method: "patch",
    headers: getAuthHeaders(),
  },
  replyToContact: (id) => ({
    url: `${backendDomin}/api/contact-us/reply/${id}`,
    method: "post",
    headers: getAuthHeaders(),
  }),


  // ------------------ AUTH ------------------
  authSignUp: {
    url: `${backendDomin}/api/auth/signup`,
    method: "post",
  },
  authSendOtp: {
    url: `${backendDomin}/api/auth/send-otp`,
    method: "post",
  },
  authVerifyOtp: {
    url: `${backendDomin}/api/auth/verify-otp`,
    method: "post",
  },
  authLogin: {
    url: `${backendDomin}/api/auth/login`,
    method: "post",
  },
  authLogout: {
    url: `${backendDomin}/api/auth/logout`,
    method: "post",
    headers: getAuthHeaders(),
  },


  // ------------------ CHAT / MESSAGES ------------------
  // 🟢 Send a new message (for ChatUser or Admin)
  // ------------------ CHAT (USER ↔ ADMIN) ------------------

  sendMessage: {
    url: `${backendDomin}/api/chat/send`,
    method: "post",
  },

  // 🟢 Get chat history between ChatUser and Admin
  getMessages: (userId, adminId) => ({
    url: `${backendDomin}/api/chat/messages/${userId}/${adminId}`,
    method: "get",
  }),

  // 🟢 Get all ChatUsers who have chatted with Admin
  getChatUsers: {
    url: `${backendDomin}/api/chat/users`,
    method: "get",
  },

  // 🟢 Get chat summary (recent message + unread count)
  getChatSummary: (adminId) => ({
    url: `${backendDomin}/api/chat/summary/${adminId}`,
    method: "get",
  }),

  markMessagesRead: (userId, adminId) => ({
    url: `${backendDomin}/api/chat/read/${userId}/${adminId}`,
    method: "put",
  }),

  

};


export default SummaryApi;
