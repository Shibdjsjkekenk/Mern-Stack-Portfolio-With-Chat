import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useRelevantProjects } from "@/customHooks/useRelevantProjects";

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 3 },
  desktop: { breakpoint: { max: 1024, min: 768 }, items: 3 },
  tablet: { breakpoint: { max: 768, min: 464 }, items: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const RelevantSlider = () => {
  const { relevantProjects, loading } = useRelevantProjects();

  if (loading) return <p className="text-center my-10">Loading projects...</p>;

  // ✅ Filter only active projects
  const activeProjects = relevantProjects.filter(
    (project) => project.status === "active"
  );

  if (!activeProjects.length)
    return <p className="text-center my-10">No active projects found.</p>;

  return (
    <div className="max-w-5xl mx-auto ">
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="all 0.5s"
        transitionDuration={500}
        containerClass="carousel-container"
        itemClass="px-4"
      >
        {activeProjects.map((project, index) => (
          <div
            key={project._id || index}
            className="bg-gradient-to-r from-[#F0F8FF] to-[#fefcf0] shadow-md rounded-lg overflow-hidden"
          >
            {project.relevantImage && (
              <img
                src={project.relevantImage}
                alt={project.relevantTitle}
                className="rounded-t-lg w-full h-40 object-cover"
              />
            )}

            <div className="px-4 py-4">
              {/* <h3 className="font-bold text-lg mb-2">{project.relevantTitle}</h3> */}

              <p className="text-sm font-medium text-gray-800 mb-4 text-justify">
                {project.description || "No description available."}
              </p>

              {project.relevantLink && (
                <a
                  href={project.relevantLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 inline-block text-red-600 text-sm font-medium transition-colors underline hover:text-red-800"
                >
                  View Project
                </a>
              )}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default RelevantSlider;
