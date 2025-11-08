import React from "react";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAboutUs } from "@/customHooks/useAboutUs";

const AboutUs = () => {
    const { aboutUsList, loading } = useAboutUs();

    if (loading)
        return (
            <p className="text-center text-blue-500 font-medium mt-10">
                Loading About Us...
            </p>
        );

    const activeAbout =
        aboutUsList && aboutUsList.find((item) => item.isActive === true);

    if (!activeAbout)
        return (
            <p className="text-center text-gray-500 mt-10">
                No active About Us data found.
            </p>
        );

    return (
        <>
            <div className="flex items-center justify-center max-w-auto pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center w-full max-w-7xl ">
                    {/* Right column: Image */}
                    <div className="w-full md:w-1/2 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.9 }}
                            viewport={{ once: false, amount: 0.2 }}
                        >
                            <img
                                src={activeAbout.image}
                                alt="About Image"
                                className="w-[500px] rounded-md"
                            />
                        </motion.div>
                    </div>

                    {/* Left column: Text */}
                    <div className="w-full md:w-1/2">
                        <div className="flex flex-col gap-3 my-10">
                            <span className="px-2 py-2 rounded-full bg-[rgba(226,229,235,0.72)] text-[#F83002] text-[18px] abt font-extrabold text-center w-[25%] hurry-up">
                                About <span className="text-[#6A38C2]">Us</span>
                            </span>

                            <h1 className="text-4xl font-bold leading-[56px] abt-title">
                                {activeAbout.title.split(" ").slice(0, -2).join(" ")}{" "}
                                <span className="text-[#6A38C2]">
                                    {activeAbout.title.split(" ").slice(-2).join(" ")}
                                </span>
                            </h1>


                            <p className="text-justify">{activeAbout.para1}</p>
                            <p className="text-justify">{activeAbout.para2}</p>

                            {activeAbout.resume && (
                                <div>
                                    <Button
                                        asChild
                                        className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-white text-lg font-medium transition-transform transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-[#6A38C2] bg-[#6A38C2] h-[56px] rounded-full shadow-[0px_4px_8px_rgba(0,0,0,0.3),inset_0px_-2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0px_6px_12px_rgba(0,0,0,0.4),inset_0px_-4px_6px_rgba(255,255,255,0.4)]"
                                    >
                                        <a
                                            href={`data:application/pdf;base64,${activeAbout.resume}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={activeAbout.resumeName || "resume.pdf"}
                                            className="flex items-center"
                                        >
                                            <h3 className="text-[20px] p-4">Download CV</h3>
                                            <div className="post-job-arrow">
                                                <ArrowUpRight className="h-5 w-5" />
                                            </div>
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;
