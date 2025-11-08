const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");

// --------------------- USER CONTROLLERS ---------------------
const userSignUpController = require('../controller/user/userSignUp.js');
const userSignInController = require('../controller/user/userSignIn.js');
const userDetailsController = require('../controller/user/userDetails.js');
const authToken = require('../middleware/authToken.js');
const userLogout = require('../controller/user/userLogout.js');
const allUsers = require('../controller/user/allUsers.js');
const updateUser = require('../controller/user/updateUser.js');

// --------------------- PROJECT CONTROLLERS ---------------------
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
} = require('../controller/projects/projectController.js');

// --------------------- RELEVANT PROJECT CONTROLLERS ---------------------
const {
  createRelevant,
  getAllRelevants,
  getRelevantById,
  updateRelevant,
  deleteRelevant,
  updateRelevantStatus,
} = require('../controller/relevant/relevantController.js');

// --------------------- RELEVANT CONTENT CONTROLLERS ---------------------
const {
  createRelevantContent,
  getRelevantContents,
  getRelevantContentById,
  updateRelevantContent,
  deleteRelevantContent,
} = require('../controller/relevant/relevantContentController.js');

// --------------------- EXPERIENCE CONTROLLERS ---------------------
const {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
} = require('../controller/projects/projectContentController.js');

// --------------------- ABOUT US CONTROLLERS ---------------------
const {
  createAboutUs,
  getAllAboutUs,
  getAboutUsById,
  updateAboutUs,
  deleteAboutUs,
  updateAboutUsStatus,
} = require('../controller/about/AboutUsController.js');

// --------------------- BANNER CONTROLLERS ---------------------
const {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  updateBannerStatus,
} = require('../controller/banner/BannerController.js');

// --------------------- TIMELINE CONTROLLERS ---------------------
const {
  createTimeline,
  getAllTimelines,
  getTimelineById,
  updateTimeline,
  deleteTimeline,
  updateTimelineStatus,
} = require('../controller/timeline/timeLineController.js');

// --------------------- CONTACT US CONTROLLERS ---------------------
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  markAllContactsRead,
} = require('../controller/contactus/ContactUsController.js');

const { replyToContact } = require("../controller/contactus/ContactReplyController.js");


// --------------------- USER ROUTES ---------------------
router.post('/signup', userSignUpController);
router.post('/signin', userSignInController);
router.get('/user-details', authToken, userDetailsController);
router.post('/userLogout', userLogout);

// --------------------- ADMIN ROUTES ---------------------
router.get('/all-user', authToken, allUsers);
router.post('/update-user', authToken, updateUser);

// --------------------- PROJECT ROUTES ---------------------
router.post('/projects', authToken, createProject);
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.put('/projects/:id', authToken, updateProject);
router.delete('/projects/:id', authToken, deleteProject);
router.patch('/projects/:id/status', authToken, updateProjectStatus);

// --------------------- RELEVANT PROJECT ROUTES ---------------------
router.post('/relevant-project', authToken, createRelevant);
router.get('/relevant-project', getAllRelevants);
router.get('/relevant-project/:id', getRelevantById);
router.put('/relevant-project/:id', authToken, updateRelevant);
router.delete('/relevant-project/:id', authToken, deleteRelevant);
router.patch('/relevant-project/:id/status', authToken, updateRelevantStatus);

// --------------------- RELEVANT CONTENT ROUTES ---------------------
router.post('/relevant-content', authToken, createRelevantContent);
router.get('/relevant-content', getRelevantContents);
router.get('/relevant-content/:id', getRelevantContentById);
router.put('/relevant-content/:id', authToken, updateRelevantContent);
router.delete('/relevant-content/:id', authToken, deleteRelevantContent);

// --------------------- EXPERIENCE ROUTES ---------------------
router.post('/experience', authToken, createExperience);
router.get('/experience', getExperiences);
router.get('/experience/:id', getExperienceById);
router.put('/experience/:id', authToken, updateExperience);
router.delete('/experience/:id', authToken, deleteExperience);

// --------------------- ABOUT US ROUTES ---------------------
router.post('/about-us', authToken, createAboutUs);
router.get('/about-us', getAllAboutUs);
router.get('/about-us/:id', getAboutUsById);
router.put('/about-us/:id', authToken, updateAboutUs);
router.delete('/about-us/:id', authToken, deleteAboutUs);
router.patch('/about-us/:id/status', authToken, updateAboutUsStatus);

// --------------------- BANNER ROUTES ---------------------
router.post('/banner', authToken, createBanner);
router.get('/banner', getAllBanners);
router.get('/banner/:id', getBannerById);
router.put('/banner/:id', authToken, updateBanner);
router.delete('/banner/:id', authToken, deleteBanner);
router.patch('/banner/:id/status', authToken, updateBannerStatus);

// --------------------- TIMELINE ROUTES ---------------------
router.post('/timeline', authToken, createTimeline);
router.get('/timeline', getAllTimelines);
router.get('/timeline/:id', getTimelineById);
router.put('/timeline/:id', authToken, updateTimeline);
router.delete('/timeline/:id', authToken, deleteTimeline);
router.patch('/timeline/:id/status', authToken, updateTimelineStatus);

// --------------------- CONTACT US ROUTES ---------------------
router.post('/contact-us', createContact);
router.get('/contact-us', authToken, getAllContacts);
router.get('/contact-us/:id', authToken, getContactById);
router.put('/contact-us/:id', authToken, updateContact);
router.delete('/contact-us/:id', authToken, deleteContact);
router.patch('/contact-us/mark-read', authToken, markAllContactsRead);
router.post("/contact-us/reply/:id", replyToContact);



module.exports = router;
