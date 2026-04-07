import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiX, FiCalendar, FiClock, FiMonitor, FiMapPin, FiBookOpen } from "react-icons/fi";
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
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api
      .get("/enrollments")
      .then((res) => setEnrollments(res.data.data))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const totalPrice = enrollments.reduce((sum, e) => sum + Number(e.totalPrice), 0);

  const handleCompleteEnrollment = async () => {
    setCompleting(true);
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <>
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Complete Enrollment
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              You are enrolled in the following courses:
            </p>
            <ul className="space-y-2 mb-6">
              {enrollments.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
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
                      {e.schedule.weeklySchedule.label} · {e.schedule.timeSlot.label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
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

      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Enrolled Courses</h2>
          <div className="flex items-center gap-4">
            {enrollments.length > 0 && (
              <span className="text-sm text-gray-500">
                {enrollments.length} course{enrollments.length > 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-gray-100 animate-pulse"
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
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-3 mb-3">
                    <img
                      src={enrollment.course.image}
                      alt={enrollment.course.title}
                      className="h-16 w-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-600">
                        ${Math.round(enrollment.totalPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Schedule info */}
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="text-gray-400 shrink-0" />
                      {enrollment.schedule.weeklySchedule.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiClock className="text-gray-400 shrink-0" />
                      {enrollment.schedule.timeSlot.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiMonitor className="text-gray-400 shrink-0" />
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

                  {/* Progress */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {enrollment.progress}% Complete
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {enrollments.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Total ({enrollments.length} course{enrollments.length > 1 ? "s" : ""})
              </span>
              <span className="font-bold text-gray-900">
                ${Math.round(totalPrice)}
              </span>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
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