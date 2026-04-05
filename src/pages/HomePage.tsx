import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiLock } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import api from "../services/api";
import type { Course } from "../types/course";
import { useAuth } from "../context/AuthContext";

// Hero slides data
const SLIDES = [
  {
    id: 1,
    title: "Start learning something new today",
    subtitle:
      "Explore a wide range of expert-led courses in design, development, business, and more. Find the skills you need to grow your career and learn at your own pace.",
    cta: "Browse Courses",
    bg: "from-pink-500 via-red-400 to-orange-300",
    href: "/courses",
  },
  {
    id: 2,
    title: "Pick up where you left off",
    subtitle:
      "Your learning journey is already in progress. Continue your enrolled courses, track your progress, and stay on track toward completing your goals.",
    cta: "Start Learning",
    bg: "from-orange-400 via-yellow-400 to-amber-300",
    href: "/courses",
  },
  {
    id: 3,
    title: "Learn together, grow faster",
    subtitle:
      "Join a community of learners. Collaborate, share insights, and advance your knowledge with peers from around the world.",
    cta: "Learn More",
    bg: "from-violet-500 via-purple-400 to-indigo-400",
    href: "/courses",
  },
];

// Hero Slider
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-r ${slide.bg} overflow-hidden transition-all duration-500`}
      style={{ height: "320px" }}
    >
      <div className="flex h-full flex-col justify-center px-16 max-w-[700px]">
        <h1 className="text-3xl font-bold text-white leading-tight mb-4">
          {slide.title}
        </h1>
        <p className="text-white/80 text-sm leading-relaxed mb-6">
          {slide.subtitle}
        </p>
        <Link
          to={slide.href}
          className="w-fit rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          {slide.cta}
        </Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-5 bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute right-16 bottom-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/20 transition-colors"
      >
        <FiChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-5 bottom-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/20 transition-colors"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}

// Featured Course Card
function FeaturedCourseCard({ course }: { course: Course }) {
  return (
    <div className="flex flex-col rounded-2xl bg-white overflow-hidden shadow-sm border border-gray-100">
      <img
        src={course.image}
        alt={course.title}
        className="h-[220px] w-full object-cover"
      />
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>
            Lecturer{" "}
            <span className="font-medium text-gray-700">
              {course.instructor.name}
            </span>
          </span>
          {course.avgRating ? (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <FaStar className="text-xs" />
              {course.avgRating}
            </span>
          ) : null}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed flex-1">
          {course.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Starting from </span>
            <span className="text-2xl font-bold text-gray-900">
              ${Math.round(course.basePrice)}
            </span>
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// Locked / Blurred Continue Learning
const MOCK_CARDS = [1, 2, 3];

function LockedContinueLearning() {
  const { openLogin } = useAuth();

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-6 select-none pointer-events-none">
        {MOCK_CARDS.map((i) => (
          <div
            key={i}
            className="flex gap-4 rounded-2xl bg-white border border-gray-100 p-4 blur-sm"
          >
            <div className="h-16 w-20 rounded-lg bg-indigo-200 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
              <div className="h-2 w-full rounded-full bg-indigo-100 mt-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white border border-gray-100 px-10 py-8 shadow-lg">
          <FiLock className="text-4xl text-indigo-400" />
          <p className="text-sm font-medium text-gray-600">
            Sign in to track your learning progress
          </p>
          <button
            onClick={openLogin}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

// HomePage
function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/courses/featured")
      .then((res) => {
        setFeaturedCourses(res.data.data);
      })
      .catch(() => setFeaturedCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1920px] px-24 py-10 space-y-14">
      {/* Hero */}
      <HeroSlider />

      {/* Featured Courses */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Start Learning Today
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Choose from our most popular courses and begin your journey
        </p>

        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <FeaturedCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Continue Learning */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Continue Learning
            </h2>
            <p className="text-sm text-gray-500 mt-1">Pick up where you left</p>
          </div>
          <button className="text-sm font-medium text-indigo-600 hover:underline">
            See All
          </button>
        </div>

        <LockedContinueLearning />
      </section>
    </div>
  );
}

export default HomePage;