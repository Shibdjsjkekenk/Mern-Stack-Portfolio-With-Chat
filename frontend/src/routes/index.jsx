// src/routes/index.js
import App from '../App.jsx';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import Login from '@/pages/Login.jsx';
import SignUp from '@/pages/SignUp.jsx';
import AdminPanel from '@/pages/AdminPanel.jsx';
import AllUsers from '@/pages/AllUsers.jsx';
import ExperienceProject from '@/pages/ExperienceProject.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import RelevantProjects from '@/pages/RelevantProjects.jsx';
import AboutUs from '@/pages/AboutUs.jsx';
import BannerSection from '@/pages/BannerSection.jsx';
import Timeline from '@/pages/TimeLine.jsx';
import ContactUs from '@/pages/ContactUs.jsx';
import ContactForm from '@/pages/ContactForm.jsx';
import AdminChatDashboard from '@/pages/AdminChatDashboard.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Home />,
      },
        {
        path: 'contact-us',
        element: <ContactUs/>,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'sign-up',
        element: <SignUp />,
      },
      {
        path: "admin-panel",
        element: <AdminPanel />,
        children: [
          {
            path: "all-users",
            element: <AllUsers />
          },
          {
            path: "exp-projects",
            element: <ExperienceProject />
          },
          {
            path: "dashboard",
            element: <Dashboard />
          },
          {
            path: "relevant-project",
            element: <RelevantProjects />
          },
          {
            path: "about-us",
            element: <AboutUs />
          },
          {
            path: "banner-section",
            element: <BannerSection />
          },
          {
            path: "timeline",
            element: <Timeline/>
          },
          {
            path: "contact-data",
            element: <ContactForm/>
          },
          {
            path: "admin-chat",
            element: <AdminChatDashboard/>
          }
        ]
      },
    ],
  },
]);

export default router;
