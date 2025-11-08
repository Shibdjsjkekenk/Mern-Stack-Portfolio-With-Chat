import React from "react";
import { useInView } from "react-intersection-observer";
import ExperienceSlider from "./ExperienceSlider";
import { FaCheckCircle } from "react-icons/fa";
import { useExperiences } from "@/customHooks/useExperiences";

const Experience = () => {
  const { experiences, loading } = useExperiences();

  // `useInView` hook for animation trigger (kept as original, even if not used for motion here)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  if (loading) {
    return <p className="text-center text-blue-500 font-medium mt-5">Loading experiences...</p>;
  }

  if (!experiences || experiences.length === 0) {
    return <p className="text-center text-gray-500 mt-6">No experiences found.</p>;
  }

  // We'll just pick the first experience for the main content
  const mainExp = experiences[0];

  return (
    <div className="max-w-auto bg-gradient-to-r from-[#F0F8FF] to-[#fefcf0]">
      <div className="pb-7 mt-20 mb-10 max-w-auto pt-13 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="experince-home-title-text font-bold text-center pb-5">
          Experience <span className="text-[#6A38C2]">&</span> Projects
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full max-w-7xl">
          {/* Left column: Professional Experience */}
          <div className="w-full md:w-1/2">
            <div className="flex flex-col gap-4 my-1">
              <h1 className="experince-home-subtitle-text font-bold leading-[40px]">
                {(() => {
                  const words = (mainExp.title || `Experience ${idx + 1}`).split(" ");
                  return (
                    <>
                      <span>{words[0]}</span>{" "}
                      {words[1] && <span className="text-[#6A38C2]">{words[1]}</span>}
                      {words.slice(2).length > 0 && " " + words.slice(2).join(" ")}
                    </>
                  );
                })()}
              </h1>


              {mainExp && (
                <>
                  <p className="text-justify">
                    {(() => {
                      if (!mainExp.shortPara) return null;

                      const words = mainExp.shortPara.split(" ");
                      const firstWord = words[0];
                      const restText = words.slice(1).join(" "); // All remaining words

                      return (
                        <>
                          <span className="text-[#F16B50] font-bold">{firstWord.charAt(0)}</span>
                          {firstWord.slice(1)} {restText}
                        </>
                      );
                    })()}
                  </p>

                  <ul>
                    {mainExp.bullet1 && (
                      <li className="pb-[10px] flex items-start gap-2 text-justify">
                        <FaCheckCircle className="text-[#6CB6D5] flex-shrink-0 mt-1" />
                        <span>{mainExp.bullet1}</span>
                      </li>
                    )}
                    {mainExp.bullet2 && (
                      <li className="flex items-start gap-2 text-justify">
                        <FaCheckCircle className="text-[#6CB6D5] flex-shrink-0 mt-1" />
                        <span>{mainExp.bullet2}</span>
                      </li>
                    )}
                  </ul>
                  {mainExp.footer && <p className="text-justify">{mainExp.footer}</p>}
                </>
              )}
            </div>
          </div>

          {/* Right column: Image Slider */}
          <div className="w-full md:w-1/1">
            <ExperienceSlider />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
