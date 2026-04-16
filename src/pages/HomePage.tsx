import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiLock } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import api from "../services/api";
import type { Course } from "../types/course";
import { useAuth } from "../context/AuthContext";

interface Enrollment {
  id: number;
  quantity: number;
  totalPrice: number;
  progress: number;
  completedAt: string | null;
  course: Course;
}

const SLIDES = [
  {
    id: 1,
    title: "Start learning something new today",
    subtitle:
      "Explore a wide range of expert-led courses in design, development, business, and more. Find the skills you need to grow your career and learn at your own pace.",
    cta: "Browse Courses",
    image:
      "https://images.unsplash.com/photo-1740568439425-8ef0deafe965?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/courses",
  },
  {
    id: 2,
    title: "Pick up where you left off",
    subtitle:
      "Your learning journey is already in progress. Continue your enrolled courses, track your progress, and stay on track toward completing your goals.",
    cta: "Start Learning",
    image:
      "https://images.unsplash.com/photo-1663970206579-c157cba7edda?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/courses",
  },
  {
    id: 3,
    title: "Learn together, grow faster",
    subtitle:
      "Join a community of learners. Collaborate, share insights, and advance your knowledge with peers from around the world.",
    cta: "Learn More",
    image:
      "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/courses",
  },
];

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
      className="relative w-full rounded-2xl overflow-hidden transition-all duration-500"
      style={{ height: "320px" }}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 flex h-full flex-col justify-center px-16 pb-12 max-w-[700px]">
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

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
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

      <button
        onClick={prev}
        className="absolute right-16 bottom-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/20 transition-colors"
      >
        <FiChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-5 bottom-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/20 transition-colors"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}

function FeaturedCourseCard({ course }: { course: Course }) {
  return (
    <div className="flex flex-col rounded-xl bg-white border border-gray-100 hover:border-indigo-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
      <div className="p-3 pb-0">
        <img
          src={course.image}
          alt={course.title}
          className="h-[220px] w-full object-cover rounded-lg"
        />
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>
            Lecturer{" "}
            <span className="font-medium text-gray-700">
              {course.instructor.name}
            </span>
          </span>
          {course.avgRating ? (
            <span className="flex items-center gap-1 font-medium">
              <FaStar className="text-xs" style={{ color: "#f4a316" }} />
              <span style={{ color: "#525252" }}>{course.avgRating}</span>
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
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Starting from</span>
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

function InProgressCard({
  enrollment,
  rating,
}: {
  enrollment: Enrollment;
  rating?: number;
}) {
  const { course, progress } = enrollment;
  const displayRating = rating || course.avgRating;

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 pt-2 pl-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-indigo-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all">
      <div className="flex gap-3 mb-1.5">
        <img
          src={course.image}
          alt={course.title}
          className="h-20 w-24 rounded-md object-cover shrink-0 self-end ml-1"
        />
        <div className="flex flex-col justify-center min-w-0">
          <p className="text-xs text-gray-400 mb-1">
            Lecturer{" "}
            <span className="font-medium text-gray-600">
              {course.instructor.name}
            </span>
          </p>
          <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
            {course.title}
          </h4>
        </div>
        {displayRating ? (
          <span className="flex items-start gap-1 text-xs font-medium shrink-0 ml-auto">
            <FaStar className="text-xs mt-0.5" style={{ color: "#f4a316" }} />
            <span style={{ color: "#525252" }}>{displayRating}</span>
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3 pl-1.5">
        <div className="flex-1 max-w-[70%]">
          <p className="text-xs text-gray-900 mb-1">{progress}% Complete</p>
          <div className="h-2.5 w-full rounded-full bg-indigo-100">
            <div
              className="h-2.5 rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <Link
          to={`/courses/${course.id}`}
          className="ml-auto rounded-md border border-indigo-400 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors shrink-0"
        >
          View
        </Link>
      </div>
    </div>
  );
}

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

function FeaturedCoursesSection() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/courses/featured")
      .then((res) => setFeaturedCourses(res.data.data))
      .catch(() => setFeaturedCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-900 mb-1">
        Start Learning Today
      </h2>
      <p className="text-sm text-gray-700 mb-8">
        Choose from our most popular courses and begin your journey
      </p>

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[420px] rounded-xl bg-gray-100 animate-pulse"
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
  );
}

function ContinueLearningSection() {
  const { isAuthenticated, openLogin, openSidebar } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseRatings, setCourseRatings] = useState<Record<number, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api
      .get("/courses/in-progress")
      .then((res) => {
        const data: Enrollment[] = res.data.data;
        setEnrollments(data);
        Promise.all(data.map((e) => api.get(`/courses/${e.course.id}`)))
          .then((responses) => {
            const ratings: Record<number, number> = {};
            responses.forEach((r) => {
              const course = r.data.data;
              if (course?.id) {
                const reviews = course.reviews ?? [];
                if (reviews.length > 0) {
                  const avg =
                    reviews.reduce(
                      (sum: number, rv: any) => sum + rv.rating,
                      0,
                    ) / reviews.length;
                  ratings[course.id] = Math.round(avg * 10) / 10;
                }
              }
            });
            setCourseRatings(ratings);
          })
          .catch(() => {});
      })
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Continue Learning
          </h2>
          <p className="text-sm text-gray-700 mt-1">Pick up where you left</p>
        </div>
        {isAuthenticated && enrollments.length > 0 && (
          <button
            onClick={isAuthenticated ? openSidebar : openLogin}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            See All
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <LockedContinueLearning />
      ) : loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-14 text-center">
          <p className="text-sm font-medium text-gray-600 mb-4">
            You haven't enrolled in any courses yet. Start your learning journey
            today!
          </p>
          <Link
            to="/courses"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <InProgressCard
              key={enrollment.id}
              enrollment={enrollment}
              rating={courseRatings[enrollment.course.id]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto w-full max-w-[1920px] px-24 py-10 space-y-14">
      <HeroSlider />

      {isAuthenticated ? (
        <>
          <ContinueLearningSection />
          <FeaturedCoursesSection />
        </>
      ) : (
        <>
          <FeaturedCoursesSection />
          <ContinueLearningSection />
        </>
      )}
    </div>
  );
}

export default HomePage;
