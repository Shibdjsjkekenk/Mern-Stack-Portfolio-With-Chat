import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import RelevantSlider from './RelevantSlider';
import { useRelevantContents } from "@/customHooks/useRelevantContents";

const RelevantExperience = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const { relevantContents, loading } = useRelevantContents();
  const [currentContent, setCurrentContent] = useState(null);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  useEffect(() => {
    if (relevantContents && relevantContents.length > 0) {
      // Sirf ACTIVE content pick karo
      const activeContent = relevantContents.find(c => c.status === "active");
      setCurrentContent(activeContent || null);
    }
  }, [relevantContents]);

  const renderHeader = () => {
    if (!currentContent) return null; // agar active content nahi hai, sirf header hi hide hoga

    const words = currentContent.title.split(" ");
    const firstWord = words[0] || "";
    const secondWord = words[1] || "";
    const remainingWords = words.slice(2).join(" ");

    return (
      <motion.div
        ref={ref}
        className="text-center"
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="experince-home-title-text font-bold leading-[56px]">
          {firstWord}{" "}
          <span className="text-[#6A38C2] font-bold">
            {secondWord}
          </span>{" "}
          {remainingWords}
        </h1>
        <p className="pt-3">
          {currentContent.para.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}<br/>
            </React.Fragment>
          ))}
        </p>
      </motion.div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header - only render if active content */}
      {renderHeader()}

      {/* Relevant Projects Slider - untouched */}
      <div className="mt-10">
        <RelevantSlider />
      </div>
    </section>
  );
};

export default RelevantExperience;
