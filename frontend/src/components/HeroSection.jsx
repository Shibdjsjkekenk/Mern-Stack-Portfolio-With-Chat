import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";
import No1 from "../assets/no-1.webp";
import NoBg from "../assets/no-bg.webp";
import { FaFacebookF, FaInstagram, FaGithub, FaLinkedinIn, FaGlobe } from "react-icons/fa";
import { useBanner } from "@/customHooks/useBanner";

const HeroSection = () => {
    const { bannerList, loading } = useBanner();
    const [activeBanner, setActiveBanner] = useState(null);
    const [typewriterKey, setTypewriterKey] = useState(0);

    useEffect(() => {
        if (bannerList && bannerList.length > 0) {
            // Only pick active banners
            const active = bannerList.find((banner) => banner.isActive);
            setActiveBanner(active || null);
            setTypewriterKey(prev => prev + 1); // re-render typewriter on banner change
        }
    }, [bannerList]);

    if (loading) 
        return <div className="text-center py-10 text-blue-500 font-semibold">Loading Hero Section...</div>;

    if (!activeBanner) 
        return <div className="text-center py-10 text-gray-500 font-medium">No active banner found.</div>;

    const splitTitle = activeBanner.title ? activeBanner.title.split(" ") : ["I", "am", "Shubhanshu", "Tiwari"];
    const iamPart = splitTitle.slice(0, 2).join(" ");
    const restPart = splitTitle.slice(2).join(" ");

    const renderParagraph = (text) => {
        if (!text) return null;
        const regex = /\d+(\.\d+)?\s*years\+/gi;
        let lastIndex = 0;
        const elements = [];

        text.replace(regex, (match, offset) => {
            const start = text.indexOf(match, lastIndex);
            if (start > lastIndex) {
                elements.push(<span key={lastIndex}>{text.slice(lastIndex, start)}</span>);
            }
            elements.push(<span key={start} className="text-red-700 font-semibold">{match}</span>);
            lastIndex = start + match.length;
            return match;
        });

        if (lastIndex < text.length) {
            elements.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
        }

        return elements.length ? elements : text;
    };

    const typewriterText = activeBanner.italicTitle || "Turning ideas into impactful digital solutions.";

    return (
        <div className="flex items-center justify-center max-w-full bg-[#f6f6f6de] relative z-10 mt-16">
            <div className="flex flex-col md:flex-row items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Left Column */}
                <motion.div
                    className="w-full md:w-1/2"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex flex-col gap-5 my-10">
                        <div className="bg-[rgba(226,229,235,0.72)] w-[30%] md:w-[20%] rounded-full px-4 py-1">
                            <span className="text-xl md:text-2xl font-bold gradient-background">Hello,</span>
                        </div>

                        <h1 className="text-[28px] lg:text-5xl font-bold leading-[48px] md:leading-[56px]">
                            <span className="text-gray-900">{iamPart}</span>{" "}
                            <span className="text-[#6A38C2]">{restPart}</span>
                        </h1>

                        <h4 className="text-[18px] lg:text-[21px] font-medium text-gray-700">
                            {activeBanner.paragraph 
                                ? renderParagraph(activeBanner.paragraph) 
                                : renderParagraph("Crafting seamless web experiences with 2.5 years+ of professional expertise in modern web development.")}
                        </h4>

                        <h1 className="text-[15px] lg:text-[20px] font-bold italic text-gray-800 min-h-[28px]">
                            <Typewriter
                                key={typewriterKey}
                                onInit={(typewriter) => {
                                    typewriter
                                        .typeString(typewriterText)
                                        .pauseFor(2000)
                                        .deleteAll()
                                        .start();
                                }}
                                options={{ loop: true, delay: 50 }}
                            />
                        </h1>

                        <div className="mt-6 flex space-x-4">
                            <a href="https://www.facebook.com/shubhanshu.tiwari.167" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-300 p-1 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"><FaFacebookF className="text-blue-600" /></a>
                            <a href="https://www.instagram.com/phenomenalllt?igsh=MWtxM3dqMmg2bzl0cg==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-300 p-1 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"><FaInstagram className="text-pink-500" /></a>
                            <a href="https://github.com/Shibdjsjkekenk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-300 p-1 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"><FaGithub className="text-gray-800" /></a>
                            <a href="https://www.linkedin.com/in/tiwari-shubhanshu-93bb95267?trk=contact-info" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-300 p-1 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"><FaLinkedinIn className="text-blue-700" /></a>
                            <a href="https://www.shubhanshutiwari.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-300 p-1 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"><FaGlobe className="text-green-500" /></a>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-4" style={{ backgroundImage: `url(${NoBg})` }}>
                    <div className="bounce-custom">
                        <img src={activeBanner.image || No1} alt="Dynamic Banner" className="w-full rounded-md md:ml-[78px] max-w-[100%] md:max-w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
