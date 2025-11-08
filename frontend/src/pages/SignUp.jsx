import React, { useState } from 'react'
import loginIcons from '../assets/signin.gif'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import imageTobase64 from '../helpers/imageTobase64';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import axios from 'axios';


const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [data, setData] = useState({
        email: "",
        password: "",
        name: "",
        confirmPassword: "",
        profilePic: "",
    })
    const navigate = useNavigate()

    const handleOnChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const handleUploadPic = async (e) => {
        const file = e.target.files[0]
        const imagePic = await imageTobase64(file)
        setData((preve) => {
            return {
                ...preve,
                profilePic: imagePic
            }
        })
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (data.password === data.confirmPassword) {
            try {
                const response = await axios({
                    method: SummaryApi.signUP.method,
                    url: SummaryApi.signUP.url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                });

                const dataApi = response.data;

                if (dataApi.success) {
                    toast.success(dataApi.message);
                    navigate("/login");
                }

                if (dataApi.error) {
                    toast.error(dataApi.message);
                }

            } catch (error) {
                toast.error(error.response?.data?.message || "Something went wrong");
            }

        } else {
            toast.error("Please check password and confirm password");
        }
    };

    return (
        <section id='signup'>
            <div className='mx-auto container p-4'>

                <div className='bg-slate-100  p-5 w-full max-w-sm mx-auto mt-25 mb-15 login-shadow'>

                    <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full'>
                        <div>
                            <img src={data.profilePic || loginIcons} alt='login icons' />
                        </div>
                        <form >

                            <label>
                                <div className='text-xs bg-opacity-80 bg-slate-200 pb-4 pt-2 cursor-pointer text-center absolute bottom-0 w-full'>
                                    Upload  Photo
                                </div>
                                <input type='file' className='hidden' onChange={handleUploadPic} />
                            </label>
                        </form>
                    </div>

                        <form className='pt-6 flex flex-col gap-2' onSubmit={handleSubmit}>
                        <div className='grid'>
                            <label>Name : </label>
                            <div className='bg-white mt-2 p-2 rounded-[11px]'>
                                <input
                                    type='text'
                                    placeholder='enter your name'
                                    name='name'
                                    value={data.name}
                                    onChange={handleOnChange}
                                    required
                                    className='w-full h-full outline-none bg-transparent' />
                            </div>
                        </div>
                        <div className='grid'>
                            <label>Email : </label>
                            <div className='bg-white mt-2 p-2 rounded-[11px]'>
                                <input
                                    type='email'
                                    placeholder='enter email'
                                    name='email'
                                    value={data.email}
                                    onChange={handleOnChange}
                                    required
                                    className='w-full h-full outline-none bg-transparent' />
                            </div>
                        </div>

                        <div>
                            <label>Password : </label>
                            <div className='bg-white mt-2 p-2 rounded-[11px] flex'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder='enter password'
                                    value={data.password}
                                    name='password'
                                    onChange={handleOnChange}
                                    required
                                    className='w-full h-full outline-none bg-transparent' />
                                <div className='cursor-pointer text-xl' onClick={() => setShowPassword((preve) => !preve)}>
                                    <span>
                                        {
                                            showPassword ? (
                                                <FaEyeSlash />
                                            )
                                                :
                                                (
                                                    <FaEye />
                                                )
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label>Confirm Password : </label>
                            <div className='bg-white mt-2 p-2 rounded-[11px] flex'>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder='enter confirm password'
                                    value={data.confirmPassword}
                                    name='confirmPassword'
                                    onChange={handleOnChange}
                                    required
                                    className='w-full h-full outline-none bg-transparent' />

                                <div className='cursor-pointer text-xl' onClick={() => setShowConfirmPassword((preve) => !preve)}>
                                    <span>
                                        {
                                            showConfirmPassword ? (
                                                <FaEyeSlash />
                                            )
                                                :
                                                (
                                                    <FaEye />
                                                )
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center pt-3">
                            <button className='text-[18px] p-2 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-transform transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[#6A38C2] disabled:pointer-events-none disabled:opacity-50 text-white px-4 py-2 rounded-full bg-[#6A38C2] w-full max-w-[150px] shadow-[0px_4px_8px_rgba(0,0,0,0.3),inset_0px_-2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4),inset_0px_-4px_6px_rgba(255,255,255,0.4)] h-[40px]'>Sign Up</button>
                        </div>
                    </form>

                    <p className='my-5'>Already have account ? <Link to={"/login"} className=' text-red-600 hover:text-red-700 hover:underline'>Login</Link></p>
                </div>


            </div>
        </section>
    )
}

export default SignUp