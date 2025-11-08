import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import SummaryApi from "@/common";
import {
  setUser,
  setToken,
  setLoading,
  setError,
  setMessage,
  clearError,
  logout as logoutAction,
} from "../store/chatAuthSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🧩 ADD THIS IMPORT
import socket from "@/socket";

export const useChatAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error, message } = useSelector(
    (state) => state.chatAuth
  );

  const [localError, setLocalError] = useState(null);
  const [localMessage, setLocalMessage] = useState(null);

  // ------------------ Toastify Position Config ------------------
  const showToast = (msg, type = "info") => {
    toast.dismiss();
    const options = {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: false,
      pauseOnHover: true,
      theme: "colored",
    };
    if (type === "success") toast.success(msg, options);
    else if (type === "error") toast.error(msg, options);
    else toast.info(msg, options);
  };

  // ------------------ Load from localStorage ------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("chatUser");
    const storedToken = localStorage.getItem("chatToken");
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
      dispatch(setToken(storedToken));

      // ✅ Auto-register socket if user already logged in
      if (parsedUser?._id) {
        socket.emit("register", { userId: parsedUser._id, userType: "ChatUser" });
        console.log("🟢 Socket auto-registered for saved user:", parsedUser.email);
      }
    }
  }, [dispatch]);

  // ------------------ SIGNUP ------------------
  const signUp = async (formData) => {
    try {
      dispatch(setLoading(true));
      console.log("🚀 Starting Signup...");
      dispatch(clearError());
      setLocalError(null);
      setLocalMessage(null);

      const fixedFormData = new FormData();
      const chatName = formData.get
        ? formData.get("name") || formData.get("chatName")
        : formData.name;

      fixedFormData.append("chatName", chatName);
      fixedFormData.append(
        "email",
        formData.get ? formData.get("email") : formData.email
      );
      fixedFormData.append(
        "password",
        formData.get ? formData.get("password") : formData.password
      );

      const file =
        formData.get && formData.get("profilePic")
          ? formData.get("profilePic")
          : formData.profilePic;

      if (file) {
        console.log("📸 File selected:", file.name, file.size, "bytes");
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Only JPG, JPEG, PNG, or WEBP images are allowed.");
        }
        if (file.size > 30 * 1024) {
          throw new Error("File too large. Please upload under 30KB.");
        }
        fixedFormData.append("profilePic", file);
      }

      console.log("📤 Sending request to:", SummaryApi.authSignUp.url);

      const { data } = await axios.post(SummaryApi.authSignUp.url, fixedFormData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Uploading... ${percent}%`);
        },
        timeout: 10000,
      });

      if (!data?.success && !data?.user) {
        throw new Error(data?.message || "Signup failed, please try again.");
      }

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      dispatch(setMessage(data.message || "Signup successful"));

      localStorage.setItem("chatUser", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("chatToken", data.token);

      // ✅ Register socket after signup success
      if (data?.user?._id) {
        socket.emit("register", { userId: data.user._id, userType: "ChatUser" });
        console.log("🟢 Socket registered after signup:", data.user.email);
      }

      setLocalMessage(data.message || "Signup successful");
      showToast("🎉 Signup successful!", "success");
      console.log("🎉 Signup success:", data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("❌ Signup Error:", msg);
      dispatch(setError(msg));
      setLocalError(msg);
      showToast(msg, "error");
      return null;
    } finally {
      dispatch(setLoading(false));
      console.log("🟡 Signup process finished.");
    }
  };

  // ------------------ SEND OTP ------------------
  const sendOtp = async (email) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      setLocalError(null);
      setLocalMessage(null);

      const { data } = await axios.post(SummaryApi.authSendOtp.url, { email });
      if (!data?.success) throw new Error(data?.message || "Failed to send OTP");

      dispatch(setMessage(data.message));
      setLocalMessage(data.message);
      showToast("📩 OTP sent to your email!", "success");
      console.log("📩 OTP Sent to:", email);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("❌ OTP Error:", msg);
      dispatch(setError(msg));
      setLocalError(msg);
      showToast(msg, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ------------------ VERIFY OTP ------------------
  const verifyOtp = async (email, otp) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      setLocalError(null);
      setLocalMessage(null);

      const { data } = await axios.post(SummaryApi.authVerifyOtp.url, { email, otp });
      if (!data?.success && !data?.user)
        throw new Error(data?.message || "OTP verification failed");

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      dispatch(setMessage("OTP verified successfully!"));

      localStorage.setItem("chatUser", JSON.stringify(data.user));
      localStorage.setItem("chatToken", data.token);

      // ✅ Register socket after OTP verification
      if (data?.user?._id) {
        socket.emit("register", { userId: data.user._id, userType: "ChatUser" });
        console.log("🟢 Socket registered after OTP verification:", data.user.email);
      }

      setLocalMessage("OTP verified successfully!");
      showToast("✅ OTP verified successfully!", "success");
      console.log("✅ OTP Verified for:", email);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("❌ OTP Verification Error:", msg);
      dispatch(setError(msg));
      setLocalError(msg);
      showToast(msg, "error");
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ------------------ LOGIN ------------------
  const login = async (email, password) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      setLocalError(null);
      setLocalMessage(null);

      const { data } = await axios.post(SummaryApi.authLogin.url, { email, password });
      if (!data?.success && !data?.user)
        throw new Error(data?.message || "Invalid credentials");

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      dispatch(setMessage("Login successful!"));

      localStorage.setItem("chatUser", JSON.stringify(data.user));
      localStorage.setItem("chatToken", data.token);

      // ✅ Register socket after login success
      if (data?.user?._id) {
        socket.emit("register", { userId: data.user._id, userType: "ChatUser" });
        console.log("🟢 Socket registered after login:", data.user.email);
      }

      setLocalMessage("Login successful!");
      showToast("🎉 Logged in successfully!", "success");
      console.log("✅ Logged in as:", data.user.email);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("❌ Login Error:", msg);
      dispatch(setError(msg));
      setLocalError(msg);
      showToast(msg, "error");
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ------------------ LOGOUT ------------------
  const logout = () => {
    dispatch(logoutAction());
    localStorage.removeItem("chatUser");
    localStorage.removeItem("chatToken");

    // ❌ Disconnect socket on logout
    if (socket && socket.connected) {
      socket.disconnect();
      console.log("🔴 Socket disconnected after logout");
    }

    showToast("🚪 Logged out successfully!", "success");
    console.log("🚪 Logged out");
  };

  return {
    user,
    token,
    loading,
    error: error || localError,
    message: message || localMessage,
    signUp,
    sendOtp,
    verifyOtp,
    login,
    logout,
  };
};
