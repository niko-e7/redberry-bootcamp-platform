import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { PiSparkleFill } from "react-icons/pi";
import api from "../services/api";
import type { Course } from "../types/course";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Topic {
  id: number;
  name: string;
  categoryId: number;
}

interface Instructor {
  id: number;
  name: string;
  avatar: string;
}

interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "title_asc", label: "Title: A-Z" },
];

// Course Card
function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex flex-col rounded-2xl bg-white overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <img
        src={course.image}
        alt={course.title}
        className="h-[160px] w-full object-cover"
      />
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span className="flex items-center gap-1 text-indigo-500 font-medium">
            <PiSparkleFill />
            {course.category.name}
          </span>
          {course.avgRating ? (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <FaStar className="text-xs" />
              {course.avgRating}
            </span>
          ) : null}
        </div>

        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-xs text-gray-400 mb-3">
          {course.durationWeeks} Weeks
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Starting from </span>
            <span className="text-lg font-bold text-gray-900">
              ${Math.round(course.basePrice)}
            </span>
          </div>
          <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
            Details
          </span>
        </div>
      </div>
    </Link>
  );
}

// Courses Page
function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Load filters
  useEffect(() => {
    Promise.all([
      api.get("/categories"),
      api.get("/instructors"),
    ]).then(([catRes, instRes]) => {
      setCategories(catRes.data.data);
      setInstructors(instRes.data.data);
    });
  }, []);

  // Load topics dynamically based on selected categories
  useEffect(() => {
    const params = new URLSearchParams();
    selectedCategories.forEach((id) => params.append("categories[]", String(id)));
    api.get(`/topics?${params.toString()}`).then((res) => {
      setTopics(res.data.data);
      // Clear topics that no longer belong to selected categories
      if (selectedCategories.length > 0) {
        setSelectedTopics((prev) =>
          prev.filter((tid) =>
            res.data.data.some((t: Topic) => t.id === tid)
          )
        );
      }
    });
  }, [selectedCategories]);

  // Load courses
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("sort", sort);
    selectedCategories.forEach((id) => params.append("categories[]", String(id)));
    selectedTopics.forEach((id) => params.append("topics[]", String(id)));
    selectedInstructors.forEach((id) => params.append("instructors[]", String(id)));

    api
      .get(`/courses?${params.toString()}`)
      .then((res) => {
        setCourses(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [page, sort, selectedCategories, selectedTopics, selectedInstructors]);

  const toggleCategory = (id: number) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleTopic = (id: number) => {
    setPage(1);
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleInstructor = (id: number) => {
    setPage(1);
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedTopics([]);
    setSelectedInstructors([]);
    setPage(1);
  };

  const activeFilterCount =
    selectedCategories.length + selectedTopics.length + selectedInstructors.length;

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Newest First";

  // Pagination pages
  const getPages = () => {
    const pages = [];
    const total = meta.lastPage;
    const current = meta.currentPage;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="mx-auto w-full max-w-[1920px] px-24 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <FiChevronRight className="text-xs" />
        <span className="text-indigo-600 font-medium">Browse</span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-[260px] shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={clearAll}
              className="text-xs text-indigo-600 hover:underline"
            >
              Clear All Filters {activeFilterCount > 0 && `· ${activeFilterCount}`}
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTopics.includes(topic.id)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {topic.name}
                </button>
              ))}
              {topics.length === 0 && (
                <p className="text-xs text-gray-400">
                  {selectedCategories.length === 0
                    ? "Select a category to see topics"
                    : "No topics found"}
                </p>
              )}
            </div>
          </div>

          {/* Instructors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Instructor
            </h3>
            <div className="space-y-2">
              {instructors.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => toggleInstructor(inst.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                    selectedInstructors.includes(inst.id)
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {inst.avatar ? (
                    <img
                      src={inst.avatar}
                      alt={inst.name}
                      className="h-7 w-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-indigo-100 shrink-0" />
                  )}
                  <span className="truncate">{inst.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">{meta.total}</span>{" "}
              {meta.total === 1 ? "course" : "courses"}
            </p>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown((p) => !p)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-indigo-400 transition-colors"
              >
                Sort By: <span className="font-medium">{currentSortLabel}</span>
                <FiChevronRight
                  className={`transition-transform ${showSortDropdown ? "rotate-90" : ""}`}
                />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-lg py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setPage(1);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        sort === opt.value
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[320px] rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">
                No courses found
              </p>
              <p className="text-xs text-gray-400">
                Try adjusting your filters
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="mt-4 flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                >
                  <FiX /> Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.lastPage > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-400 disabled:opacity-40 transition-colors"
              >
                <FiChevronLeft />
              </button>

              {getPages().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-1 text-gray-400 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(Number(p))}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                      meta.currentPage === p
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:border-indigo-400"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
                disabled={meta.currentPage === meta.lastPage}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-400 disabled:opacity-40 transition-colors"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;