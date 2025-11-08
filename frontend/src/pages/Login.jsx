import React, { useContext, useState } from "react";
import loginIcons from "../assets/signin.gif";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import axios from "axios";
import Context from "../context";
import { requestForToken } from "../firebase"; // ✅ Firebase import

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { fetchUserDetails } = useContext(Context);

  // ✅ Handle input change
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios({
        method: SummaryApi.signIn.method,
        url: SummaryApi.signIn.url,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        data,
      });

      const dataApi = response.data;

      if (dataApi.success) {
        toast.success(dataApi.message);

        // ✅ Step 1: Save Backend Auth Token (JWT)
        const jwtToken = dataApi?.data?.token;
        if (jwtToken) {
          console.log("🟢 JWT Auth Token:", jwtToken);
          localStorage.setItem("token", jwtToken);
        } else {
          console.warn("⚠️ No JWT token received from backend (data.data.token missing).");
        }

        // ✅ Step 2: Request Firebase Token (FCM)
        try {
          const fcmToken = await requestForToken();
          if (fcmToken) {
            console.log("🔑 Admin FCM Token:", fcmToken);
            localStorage.setItem("adminFcmToken", fcmToken);

            // Optional: send both tokens to backend
            // await axios.post(SummaryApi.saveAdminFcmToken.url, {
            //   jwtToken,
            //   fcmToken,
            // });
          } else {
            console.warn("⚠️ FCM token not generated for admin.");
          }
        } catch (firebaseError) {
          console.warn("⚠️ Firebase token error:", firebaseError.message);
        }

        // ✅ Fetch details & redirect
        fetchUserDetails();
        navigate("/");
      } else if (dataApi.error) {
        toast.error(dataApi.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <section id="login">
      <div className="mx-auto container p-4">
        <div className="bg-slate-100 p-5 w-full max-w-sm mx-auto mt-25 mb-15 login-shadow">
          <div className="w-20 h-20 mx-auto">
            <img src={loginIcons} alt="login icons" />
          </div>

          {/* ✅ Login Form */}
          <form className="pt-6 flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="grid">
              <label>Email : </label>
              <div className="bg-white mt-2 p-2 rounded-[11px]">
                <input
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={data.email}
                  onChange={handleOnChange}
                  required
                  className="w-full h-full outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label>Password : </label>
              <div className="bg-white mt-2 p-2 flex rounded-[11px]">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={data.password}
                  name="password"
                  onChange={handleOnChange}
                  required
                  className="w-full h-full outline-none bg-transparent"
                />
                <div
                  className="cursor-pointer text-xl"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              <Link
                to={"/forgot-password"}
                className="block w-fit ml-auto hover:underline hover:text-red-600"
              >
                Forgot password ?
              </Link>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="text-[18px] p-2 inline-flex items-center justify-center gap-2 whitespace-nowrap
                  text-sm font-medium transition-transform transform hover:scale-105 active:scale-95
                  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
                  focus-visible:ring-[#6A38C2] disabled:pointer-events-none disabled:opacity-50
                  text-white px-4 py-2 rounded-full bg-[#6A38C2] w-full max-w-[150px]
                  shadow-[0px_4px_8px_rgba(0,0,0,0.3),inset_0px_-2px_4px_rgba(255,255,255,0.3)]
                  hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4),inset_0px_-4px_6px_rgba(255,255,255,0.4)] h-[40px]"
              >
                Login
              </button>
            </div>
          </form>

          <p className="my-5">
            Don't have account?{" "}
            <Link
              to={"/sign-up"}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
