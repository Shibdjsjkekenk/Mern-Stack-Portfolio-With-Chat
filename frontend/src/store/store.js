import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import projectReducer from "./projectSlice";
import experienceReducer from "./experienceSlice";
import relevantProjectReducer from "./relevantProjectSlice";
import relevantContentReducer from "./relevantContentSlice";
import aboutUsReducer from "./aboutUsSlice";
import bannerReducer from "./bannerSlice";
import timeLineReducer from "./timeLineSlice";
import contactReducer from "./ContactSlice";
import chatAuthReducer from "./chatAuthSlice"; // ✅ Import chatAuth slice
import chatReducer from "./chatSlice"; // ✅ Chat message slice added


export const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectReducer,
    experience: experienceReducer,
    relevantProject: relevantProjectReducer,
    relevantContent: relevantContentReducer,
    aboutUs: aboutUsReducer,
    banner: bannerReducer,
    timeline: timeLineReducer,
    contact: contactReducer,
    chatAuth: chatAuthReducer, // ✅ Add chatAuth reducer
    chat: chatReducer, // ✅ Add chat reducer for messages

  },
});

export default store; // ✅ Export store for Provider
