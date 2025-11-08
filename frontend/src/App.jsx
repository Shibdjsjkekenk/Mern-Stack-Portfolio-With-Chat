import Footer from './components/Footer';
import Navbar from './components/Navbar';
import './index.css';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import SummaryApi from './common';
import Context from './context';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from './store/userSlice';
import { useSocketManager } from './customHooks/useSocketManager'; // ✅ Global socket manager
import ROLE from './common/role'; // ✅ Import your role constants

function App() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user?.user); // 🟢 Get logged user from Redux (if any)

  // ✅ Fetch logged-in user details
  const fetchUserDetails = async () => {
    try {
      const dataResponse = await axios(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        withCredentials: true,
      });

      const dataApi = dataResponse.data;
      console.log('data-user', dataResponse);

      if (dataApi.success) {
        dispatch(setUserDetails(dataApi.data));
      }
    } catch (error) {
      console.error('⚠️ Error fetching user details:', error.message);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // ✅ Global socket connection (works for Admin & User both)
  useSocketManager({
    userId: user?._id,
    role: user?.role === 'ADMIN' ? ROLE.ADMIN : ROLE.GENERAL,
  });

  return (
    <>
      <Context.Provider
        value={{
          fetchUserDetails, // user detail fetch
        }}
      >
        <ToastContainer position="top-right" />

        {/* Navbar & Footer stay global */}
        <Navbar />
        <Outlet /> {/* 👇 Nested route rendering (like Home, Chat, etc.) */}
        <Footer />
      </Context.Provider>
    </>
  );
}

export default App;
