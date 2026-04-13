import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import api from "../services/api";
import type { Course } from "../types/course";
import {
  FiCode,
  FiPenTool,
  FiBriefcase,
  FiTrendingUp,
  FiDatabase,
} from "react-icons/fi";

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  development: <FiCode className="text-xs" />,
  design: <FiPenTool className="text-xs" />,
  business: <FiBriefcase className="text-xs" />,
  marketing: <FiTrendingUp className="text-xs" />,
  "data-science": <FiDatabase className="text-xs" />,
};

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex flex-col rounded-2xl bg-white border border-gray-100 hover:border-indigo-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all"
    >
      <div className="p-3 pb-0">
        <img
          src={course.image}
          alt={course.title}
          className="h-[160px] w-full object-cover rounded-xl"
        />
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span className="text-xs text-gray-400">
            {course.instructor.name} <span className="mx-1">|</span>{" "}
            {course.durationWeeks} Weeks
          </span>
          {course.avgRating ? (
            <span className="flex items-center gap-1 font-medium shrink-0">
              <FaStar className="text-xs" style={{ color: "#f4a316" }} />
              <span style={{ color: "#525252" }}>{course.avgRating}</span>
            </span>
          ) : null}
        </div>

        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
          {course.title}
        </h3>

        <span className="w-fit flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-500 mb-3">
          {CATEGORY_ICONS[course.category.icon] ?? null}
          {course.category.name}
        </span>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col justify-center">
            <span className="text-xs text-gray-400">Starting from</span>
            <span className="text-lg font-bold text-gray-900">
              ${Math.round(course.basePrice)}
            </span>
          </div>
          <span className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white">
            Details
          </span>
        </div>
      </div>
    </Link>
  );
}

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

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/instructors")]).then(
      ([catRes, instRes]) => {
        setCategories(catRes.data.data);
        setInstructors(instRes.data.data);
      },
    );
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    selectedCategories.forEach((id) =>
      params.append("categories[]", String(id)),
    );
    api.get(`/topics?${params.toString()}`).then((res) => {
      setTopics(res.data.data);
      if (selectedCategories.length > 0) {
        setSelectedTopics((prev) =>
          prev.filter((tid) => res.data.data.some((t: Topic) => t.id === tid)),
        );
      }
    });
  }, [selectedCategories]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("sort", sort);
    selectedCategories.forEach((id) =>
      params.append("categories[]", String(id)),
    );
    selectedTopics.forEach((id) => params.append("topics[]", String(id)));
    selectedInstructors.forEach((id) =>
      params.append("instructors[]", String(id)),
    );

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
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleTopic = (id: number) => {
    setPage(1);
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const toggleInstructor = (id: number) => {
    setPage(1);
    setSelectedInstructors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedTopics([]);
    setSelectedInstructors([]);
    setPage(1);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedTopics.length +
    selectedInstructors.length;

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Newest First";

  const getPages = () => {
    const pages = [];
    const total = meta.lastPage;
    const current = meta.currentPage;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="mx-auto w-full max-w-[1920px] px-24 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-indigo-600">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-indigo-600 font-medium">Browse</span>
      </div>

      <div className="flex gap-8">
        <aside className="w-[260px] shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors duration-200"
            >
              Clear All Filters{" "}
              {activeFilterCount > 0 && `· ${activeFilterCount}`}
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? "border border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border border-gray-100 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {CATEGORY_ICONS[cat.icon] && (
                    <span>{CATEGORY_ICONS[cat.icon]}</span>
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedTopics.includes(topic.id)
                      ? "border border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border border-gray-100 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
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

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Instructor
            </h3>
            <div className="flex flex-col items-start gap-2">
              {instructors.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => toggleInstructor(inst.id)}
                  className={`inline-flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm transition-colors ${
                    selectedInstructors.includes(inst.id)
                      ? "border border-indigo-500 bg-indigo-50 text-indigo-600 font-medium"
                      : "border border-gray-100 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {inst.avatar ? (
                    <img
                      src={inst.avatar}
                      alt={inst.name}
                      className="h-7 w-7 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-md bg-indigo-100 shrink-0" />
                  )}
                  <span className="truncate">{inst.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">{meta.total}</span>{" "}
              {meta.total === 1 ? "course" : "courses"}
            </p>

            <div className="relative">
              <button
                onClick={() => setShowSortDropdown((p) => !p)}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm transition-colors duration-200"
              >
                <span className="text-gray-400">Sort By:</span>
                <span className="font-medium text-indigo-600">
                  {currentSortLabel}
                </span>
                <FiChevronDown
                  className={`ml-auto text-gray-400 transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1 z-20 w-full rounded-lg border border-gray-100 bg-white shadow-md">
                  {SORT_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setPage(1);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors duration-150 ${
                        i === 0 ? "rounded-t-lg" : ""
                      } ${i === SORT_OPTIONS.length - 1 ? "rounded-b-lg" : ""} ${
                        sort === opt.value
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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
                ),
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
