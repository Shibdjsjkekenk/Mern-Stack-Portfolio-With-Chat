import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
  FaGraduationCap,
  FaCertificate,
  FaTools,
  FaPaintBrush,
} from "react-icons/fa";
import { useTimeline } from "@/customHooks/useTimeLine";

const TimeLine = () => {
  const { timelineList, loading } = useTimeline();

  if (loading)
    return (
      <p className="text-center text-blue-500 font-semibold mt-6">
        Loading Timeline...
      </p>
    );

  if (!timelineList || timelineList.length === 0)
    return (
      <p className="text-center text-gray-500 mt-6">
        No timeline data available.
      </p>
    );

  // assuming single document
  const timeline = timelineList[0];

  if (!timeline.isActive)
    return (
      <p className="text-center text-gray-500 mt-6">
        Timeline is currently inactive.
      </p>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
      <VerticalTimeline lineColor="#d1d5db">
        {/* Education */}
        <VerticalTimelineElement
          className="vertical-timeline-element--education"
          contentStyle={{ background: "#F3F4F6", color: "#333" }}
          contentArrowStyle={{ borderRight: "7px solid #F3F4F6" }}
          date={
            <span className="text-[25px] font-bold text-black">Education</span>
          }
          iconStyle={{ background: "#3b82f6", color: "#fff" }}
          icon={<FaGraduationCap />}
        >
          <h3 className="text-[17px] font-bold">
            {timeline.educationTitle || "—"}
          </h3>
          <p className="text-sm !mt-1">{timeline.educationPara1 || ""}</p>
          <p className="text-sm mt-2 font-semibold"><b>{timeline.educationPara2 || ""}</b></p>
        </VerticalTimelineElement>

        {/* Certification */}
        <VerticalTimelineElement
          className="vertical-timeline-element--certification"
          contentStyle={{ background: "#F3F4F6", color: "#333" }}
          contentArrowStyle={{ borderRight: "7px solid #F3F4F6" }}
          date={
            <span className="text-[25px] font-bold text-black">Certification</span>
          }
          iconStyle={{ background: "#10b981", color: "#fff" }}
          icon={<FaCertificate />}
        >
          <h3 className="text-[17px] font-bold">
            {timeline.certificationTitle || "—"}
          </h3>
          <p className="text-sm !mt-1">{timeline.certificationPara1 || ""}</p>
          <p className="text-sm mt-2"><b>{timeline.certificationPara2 || ""}</b></p>
        </VerticalTimelineElement>

        {/* Extra Activities */}
        <VerticalTimelineElement
          className="vertical-timeline-element--activities"
          contentStyle={{ background: "#F3F4F6", color: "#333" }}
          contentArrowStyle={{ borderRight: "7px solid #F3F4F6" }}
          date={
            <span className="text-[25px] font-bold text-black">Extra Activities</span>
          }
          iconStyle={{ background: "#f97316", color: "#fff" }}
          icon={<FaTools />}
        >
          <h3 className="text-[17px] font-bold">{timeline.extraActivitiesTitle || "—"}</h3>
          <p className="text-sm !mt-1">{timeline.extraActivitiesPara || ""}</p>
        </VerticalTimelineElement>

        {/* Hobbies */}
        <VerticalTimelineElement
          className="vertical-timeline-element--hobbies"
          contentStyle={{ background: "#F3F4F6", color: "#333" }}
          contentArrowStyle={{ borderRight: "7px solid #F3F4F6" }}
          date={<span className="text-[25px] font-bold text-black">Hobbies</span>}
          iconStyle={{ background: "#ef4444", color: "#fff" }}
          icon={<FaPaintBrush />}
        >
          <p className="text-sm !mt-0">{timeline.hobbiesPara || ""}</p>
        </VerticalTimelineElement>
      </VerticalTimeline>
    </div>
  );
};

export default TimeLine;
