import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useProjects } from "@/customHooks/useProjects";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 3 },
  desktop: { breakpoint: { max: 1024, min: 768 }, items: 3 },
  tablet: { breakpoint: { max: 768, min: 464 }, items: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const FALLBACK_IMAGE = "/fallback-project.png";

const ExperienceSlider = () => {
  const { projects, loading } = useProjects();

  const getImageSrc = (img) => img || FALLBACK_IMAGE;

  // Filter only active projects
  const activeProjects = projects.filter(project => project.status === "active");

  // Skeleton array to simulate number of items
  const skeletons = Array(3).fill(0);

  return (
    <div className="max-w-3xl mx-auto my-10">
      <Carousel
        responsive={responsive}
        infinite={!loading}
        autoPlay={!loading}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="all 0.5s"
        transitionDuration={500}
        containerClass="carousel-container"
        itemClass="px-4"
      >
        {loading
          ? skeletons.map((_, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden p-4">
                <Skeleton height={180} className="rounded-lg mb-3" />
                <Skeleton width={`80%`} height={20} className="mb-2" />
                <Skeleton count={3} height={15} className="mb-2" />
                <Skeleton width={`50%`} height={25} className="mt-2" />
              </div>
            ))
          : activeProjects.length > 0
          ? activeProjects.map((project, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Project Image */}
                <img
                  src={getImageSrc(project.projectImage)}
                  alt={project.projectTitle || `Project ${index + 1}`}
                  className="rounded-t-lg w-full h-30 object-cover"
                />

                <div className="px-3 py-4">
                  {/* Project Description */}
                  <p className="text-sm font-medium text-gray-700 mb-4 text-justify">
                    {project.description || "No description available."}
                  </p>

                  {/* Project Link */}
                  {project.projectLink && (
                    <a
                      href={project.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 inline-block text-red-600 text-sm font-medium transition-colors underline hover:text-red-800"
                    >
                      View Project
                    </a>
                  )}
                </div>
              </div>
            ))
          : <p className="text-center my-10">No active projects found.</p>
        }
      </Carousel>
    </div>
  );
};

export default ExperienceSlider;
