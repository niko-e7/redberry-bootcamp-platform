import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMapPin,
  FiBookOpen,
} from "react-icons/fi";
import api from "../services/api";
import type { Course } from "../types/course";

interface SessionType {
  id: number;
  courseScheduleId: number;
  name: string;
  priceModifier: number;
  availableSeats: number;
  location: string | null;
}

interface Schedule {
  weeklySchedule: { id: number; label: string; days: string[] };
  timeSlot: { id: number; label: string; startTime: string; endTime: string };
  sessionType: SessionType;
  location: string | null;
}

interface Enrollment {
  id: number;
  quantity: number;
  totalPrice: number;
  progress: number;
  completedAt: string | null;
  course: Course;
  schedule: Schedule;
}

interface Props {
  onClose: () => void;
}

function EnrolledSidebar({ onClose }: Props) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseRatings, setCourseRatings] = useState<Record<number, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    api
      .get("/enrollments")
      .then((res) => setEnrollments(res.data.data))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (enrollments.length === 0) return;
    Promise.all(enrollments.map((e) => api.get(`/courses/${e.course.id}`)))
      .then((responses) => {
        const ratings: Record<number, number> = {};
        responses.forEach((r) => {
          const course = r.data.data;
          if (course?.id) {
            const reviews = course.reviews ?? [];
            if (reviews.length > 0) {
              const avg =
                reviews.reduce((sum: number, rv: any) => sum + rv.rating, 0) /
                reviews.length;
              ratings[course.id] = Math.round(avg * 10) / 10;
            }
          }
        });
        setCourseRatings(ratings);
      })
      .catch(() => {});
  }, [enrollments]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const totalPrice = enrollments.reduce(
    (sum, e) => sum + Number(e.totalPrice),
    0,
  );

  const handleCompleteEnrollment = async () => {
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <>
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative z-10 w-full max-w-[440px] max-h-[90vh] rounded-2xl bg-white shadow-xl flex flex-col">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Complete Enrollment
              </h3>
              <p className="text-sm text-gray-500 text-center">
                You are enrolled in the following courses:
              </p>
            </div>
            <ul className="overflow-y-auto px-8 space-y-2 mb-4 flex-1">
              {enrollments.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <img
                    src={e.course.image}
                    alt={e.course.title}
                    className="h-10 w-12 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {e.course.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {e.schedule.weeklySchedule.label} ·{" "}
                      {e.schedule.timeSlot.label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 p-8 pt-0">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteEnrollment}
                className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-[#F0F2F7] shadow-2xl">
        <div className="flex items-center justify-between bg-[#F0F2F7] px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Enrolled Courses</h2>
          {enrollments.length > 0 && (
            <span className="text-sm text-gray-500">
              Total Enrollments {enrollments.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-white/60 animate-pulse"
                />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <FiBookOpen className="text-4xl text-indigo-200 mb-4" />
              <p className="text-sm font-medium text-gray-600 mb-1">
                Your learning journey starts here!
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Browse courses to get started.
              </p>
              <Link
                to="/courses"
                onClick={onClose}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-indigo-400 hover:shadow-md"
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-[160px] shrink-0 self-stretch">
                    <img
                      src={enrollment.course.image}
                      alt={enrollment.course.title}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        Instructor {enrollment.course.instructor.name}
                      </span>
                      {!!(
                        courseRatings[enrollment.course.id] ||
                        enrollment.course.avgRating
                      ) && (
                        <span className="flex items-center gap-0.5 shrink-0 ml-1">
                          <FaStar className="text-xs" style={{ color: "#f4a316" }} />
                          <span className="text-xs font-semibold" style={{ color: "#525252" }}>
                            {courseRatings[enrollment.course.id] ||
                              enrollment.course.avgRating}
                          </span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-bold text-[#1A1A2E] leading-snug line-clamp-2 mb-2">
                      {enrollment.course.title}
                    </h3>
                    <div className="space-y-1 text-[13px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-gray-400 shrink-0" />
                        {enrollment.schedule.weeklySchedule.label}
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <FiClock className="text-gray-400 shrink-0" />
                        {enrollment.schedule.timeSlot.label}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiUser className="text-gray-400 shrink-0" />
                        <span className="capitalize">
                          {enrollment.schedule.sessionType.name}
                        </span>
                      </div>
                      {enrollment.schedule.location && (
                        <div className="flex items-center gap-1.5">
                          <FiMapPin className="text-gray-400 shrink-0" />
                          {enrollment.schedule.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-900 mb-1">
                      {enrollment.progress}% Complete
                    </p>
                    <div className="h-2.5 w-full rounded-full bg-indigo-100">
                      <div
                        className="h-2.5 rounded-full bg-[#4F46E5] transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/courses/${enrollment.course.id}`}
                    onClick={onClose}
                    className="shrink-0 rounded-md border border-[#4F46E5] bg-white px-[18px] py-[6px] text-xs font-semibold text-[#4F46E5] transition-all duration-300 hover:bg-[#4F46E5] hover:text-white"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {enrollments.length > 0 && (
          <div className="bg-[#F0F2F7] border-t border-gray-200 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Total ({enrollments.length} course
                {enrollments.length > 1 ? "s" : ""})
              </span>
              <span className="font-bold text-gray-900">
                ${Math.round(totalPrice)}
              </span>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Complete Enrollment
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default EnrolledSidebar;
