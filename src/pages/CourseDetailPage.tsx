import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiChevronRight,
  FiClock,
  FiCalendar,
  FiMapPin,
  FiMonitor,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";
import ProfileModal from "../components/modals/ProfileModal";

interface WeeklySchedule {
  id: number;
  label: string;
  days: string[];
}

interface TimeSlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
}

interface SessionType {
  id: number;
  courseScheduleId: number;
  name: string;
  priceModifier: number;
  availableSeats: number;
  location: string | null;
}

interface EnrolledSchedule {
  weeklySchedule: WeeklySchedule;
  timeSlot: TimeSlot;
  sessionType: SessionType;
  location: string | null;
}

interface Enrollment {
  id: number;
  progress: number;
  totalPrice: number;
  completedAt: string | null;
  schedule: EnrolledSchedule;
}

interface CourseDetail extends Course {
  description: string;
  reviews: { userId: number; rating: number }[];
  isRated: boolean;
  enrollment: Enrollment | null;
}

function ConflictModal({
  conflict,
  onCancel,
  onContinue,
}: {
  conflict: { conflictingCourseName: string; schedule: string };
  onCancel: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <FiAlertTriangle className="text-2xl text-amber-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Enrollment Conflict
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          You are already enrolled in{" "}
          <span className="font-semibold text-gray-700">
            "{conflict.conflictingCourseName}"
          </span>{" "}
          with the same schedule:{" "}
          <span className="font-semibold text-gray-700">
            {conflict.schedule}
          </span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continue Anyway
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({
  courseName,
  onClose,
}: {
  courseName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">🎉</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Enrollment Confirmed!
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          You've successfully enrolled in the{" "}
          <span className="font-semibold text-gray-700">"{courseName}"</span>{" "}
          Course!
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function CongratsModal({
  courseName,
  onClose,
  onRate,
  isRated,
}: {
  courseName: string;
  onClose: () => void;
  onRate: (rating: number) => void;
  isRated: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Congratulations!
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          You've completed{" "}
          <span className="font-semibold text-gray-700">"{courseName}"</span>{" "}
          Course!
        </p>

        {isRated ? (
          <p className="text-sm text-indigo-600 font-medium mb-6">
            You've already rated this course
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Rate your experience
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                >
                  <FaStar
                    className={`text-2xl transition-colors ${
                      star <= (hovered || rating)
                        ? "text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <button
                onClick={() => onRate(rating)}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors mb-3"
              >
                Submit Rating
              </button>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user, openLogin } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);

  const [selectedWeekly, setSelectedWeekly] = useState<WeeklySchedule | null>(
    null,
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  );
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(
    null,
  );

  const [conflictData, setConflictData] = useState<{
    conflictingCourseName: string;
    schedule: string;
    conflictingEnrollmentId: number;
    courseScheduleId: number;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const formatWeeklyLabel = (label: string) => {
    return label
      .replace(/Monday/gi, "Mon")
      .replace(/Tuesday/gi, "Tue")
      .replace(/Wednesday/gi, "Wed")
      .replace(/Thursday/gi, "Thu")
      .replace(/Friday/gi, "Fri")
      .replace(/Saturday/gi, "Sat")
      .replace(/Sunday/gi, "Sun");
  };

  const formatTimeValue = (raw: string) => {
    const [hStr, mStr] = raw.split(":");
    const hours24 = Number(hStr);
    const minutes = Number(mStr ?? "0");
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const getTimeSlotTitle = (slot: TimeSlot) => {
    return slot.label.split("(")[0].trim();
  };

  useEffect(() => {
    setLoading(true);
    api
      .get(`/courses/${id}`)
      .then((res) => setCourse(res.data.data))
      .catch(() => navigate("/courses"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!course || course.enrollment) return;
    api
      .get(`/courses/${id}/weekly-schedules`)
      .then((res) => setWeeklySchedules(res.data.data));
  }, [course]);

  useEffect(() => {
    if (!selectedWeekly) return;
    setSelectedTimeSlot(null);
    setSelectedSession(null);
    setTimeSlots([]);
    setSessionTypes([]);
    api
      .get(`/courses/${id}/time-slots?weekly_schedule_id=${selectedWeekly.id}`)
      .then((res) => setTimeSlots(res.data.data));
  }, [selectedWeekly]);

  useEffect(() => {
    if (!selectedWeekly || !selectedTimeSlot) return;
    setSelectedSession(null);
    setSessionTypes([]);
    api
      .get(
        `/courses/${id}/session-types?weekly_schedule_id=${selectedWeekly.id}&time_slot_id=${selectedTimeSlot.id}`,
      )
      .then((res) => setSessionTypes(res.data.data));
  }, [selectedTimeSlot]);

  const totalPrice = course
    ? Number(course.basePrice) + Number(selectedSession?.priceModifier ?? 0)
    : 0;

  const handleEnroll = async (force = false) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (!user?.profileComplete) {
      setEnrollError("Please complete your profile to enroll in courses.");
      return;
    }
    if (!selectedSession) {
      setEnrollError("Please select all schedule options.");
      return;
    }

    setEnrolling(true);
    setEnrollError("");

    try {
      await api.post("/enrollments", {
        courseId: Number(id),
        courseScheduleId: selectedSession.courseScheduleId,
        force,
      });
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data);
      setShowSuccess(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        const conflict = err.response.data.conflicts[0];
        setConflictData({
          conflictingCourseName: conflict.conflictingCourseName,
          schedule: conflict.schedule,
          conflictingEnrollmentId: conflict.conflictingEnrollmentId,
          courseScheduleId: selectedSession.courseScheduleId,
        });
      } else if (err.response?.status === 422) {
        setEnrollError(err.response.data.message ?? "Validation error.");
      } else {
        setEnrollError("Something went wrong. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleComplete = async () => {
    if (!course?.enrollment) return;
    setCompleting(true);
    try {
      await api.patch(`/enrollments/${course.enrollment.id}/complete`);
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data);
      setShowCongrats(true);
    } catch {
    } finally {
      setCompleting(false);
    }
  };

  const handleRate = async (rating: number) => {
    try {
      await api.post(`/courses/${id}/reviews`, { rating });
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data);
      setShowCongrats(false);
    } catch {
      setShowCongrats(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1920px] px-24 py-10">
        <div className="h-8 w-64 rounded-lg bg-gray-100 animate-pulse mb-8" />
        <div className="flex gap-10">
          <div className="flex-1 space-y-4">
            <div className="h-10 w-3/4 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-[400px] rounded-2xl bg-gray-100 animate-pulse" />
          </div>
          <div className="w-[320px] h-[400px] rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  const enrollment = course.enrollment;
  const courseRating =
    course.reviews?.length > 0
      ? Math.round(
          (course.reviews.reduce((sum, r) => sum + r.rating, 0) /
            course.reviews.length) *
            10,
        ) / 10
      : null;
  const isCompleted = enrollment?.progress === 100;

  return (
    <div className="mx-auto w-full max-w-[1920px] px-24 py-10">
      {conflictData && (
        <ConflictModal
          conflict={conflictData}
          onCancel={() => setConflictData(null)}
          onContinue={async () => {
            setConflictData(null);
            await handleEnroll(true);
          }}
        />
      )}
      {showSuccess && (
        <SuccessModal
          courseName={course.title}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showCongrats && (
        <CongratsModal
          courseName={course.title}
          onClose={() => setShowCongrats(false)}
          onRate={handleRate}
          isRated={course.isRated}
        />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-indigo-600">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <Link to="/courses" className="hover:text-indigo-600">
          Browse
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-indigo-600 font-medium">
          {course.category.name}
        </span>
      </div>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {course.title}
          </h1>

          <img
            src={course.image}
            alt={course.title}
            className="w-full rounded-2xl object-cover mb-6"
            style={{ maxHeight: "420px" }}
          />

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <FiCalendar className="text-gray-400" />
                {course.durationWeeks} Weeks
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock className="text-gray-400" />
                {course.durationWeeks * 8} Hours
              </span>
            </div>
            <div className="flex items-center gap-4">
              {courseRating ? (
                <span className="flex items-center gap-1.5">
                  <FaStar style={{ color: "#f4a316" }} />
                  <span style={{ color: "#525252" }}>{courseRating}</span>
                </span>
              ) : null}
              <span className="flex items-center gap-1.5 text-gray-500 bg-white rounded-lg px-3 py-1">
                {"</>"} {course.category.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 bg-white rounded-lg px-3 py-1.5 w-fit">
            {course.instructor.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="h-7 w-7 rounded-md object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-md bg-indigo-100" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {course.instructor.name}
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Course Description
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
            {course.description}
          </p>
        </div>

        <div className="w-[340px] shrink-0 mt-15">
          {enrollment ? (
            <div className="space-y-4 pt-1">
              <div>
                <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Enrolled
                </span>

                <div className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-gray-400 shrink-0" />
                    {enrollment.schedule.weeklySchedule.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-gray-400 shrink-0" />
                    {enrollment.schedule.timeSlot.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMonitor className="text-gray-400 shrink-0" />
                    <span className="capitalize">
                      {enrollment.schedule.sessionType.name}
                    </span>
                  </div>
                  {enrollment.schedule.location && (
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-gray-400 shrink-0" />
                      {enrollment.schedule.location}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2.5">
                  {enrollment.progress}% Complete
                </p>
                <div className="h-2.5 w-full rounded-full bg-indigo-100">
                  <div
                    className="h-2.5 rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>

              {isCompleted ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-3 text-sm font-semibold text-green-700">
                    Course Completed! 🎉
                  </div>
                  {course.isRated ? (
                    <p className="text-center text-xs text-gray-400">
                      You've already rated this course
                    </p>
                  ) : (
                    <button
                      onClick={() => setShowCongrats(true)}
                      className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Rate Course
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {completing ? "Completing..." : "Complete Course ✓"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5 pt-1">
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-indigo-300 text-[11px] font-bold text-indigo-600">
                    1
                  </span>
                  <h3 className="text-sm font-semibold text-indigo-600">
                    Weekly Schedule
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weeklySchedules.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => setSelectedWeekly(ws)}
                      className={`rounded-lg border px-4 py-6 text-sm font-medium transition-colors ${
                        selectedWeekly?.id === ws.id
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      {formatWeeklyLabel(ws.label)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[11px] font-bold text-gray-500">
                    2
                  </span>
                  <h3 className="text-sm font-semibold text-gray-500">
                    Time Slot
                  </h3>
                </div>
                {timeSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((ts) => (
                      <button
                        key={ts.id}
                        onClick={() => setSelectedTimeSlot(ts)}
                        className={`min-w-[170px] rounded-xl border px-4 py-3 text-left transition-colors ${
                          selectedTimeSlot?.id === ts.id
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        }`}
                      >
                        <span className="block text-sm font-semibold leading-tight">
                          {getTimeSlotTitle(ts)}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {formatTimeValue(ts.startTime)} -{" "}
                          {formatTimeValue(ts.endTime)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    {selectedWeekly
                      ? "No time slots available"
                      : "Select a weekly schedule first"}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[11px] font-bold text-gray-500">
                    3
                  </span>
                  <h3 className="text-sm font-semibold text-gray-500">
                    Session Type
                  </h3>
                </div>
                {sessionTypes.length > 0 ? (
                  <div className="space-y-2">
                    {sessionTypes.map((st) => {
                      const isFull = st.availableSeats === 0;
                      const isLow =
                        st.availableSeats > 0 && st.availableSeats < 5;
                      return (
                        <button
                          key={st.id}
                          disabled={isFull}
                          onClick={() => !isFull && setSelectedSession(st)}
                          className={`w-full rounded-xl border p-3 text-left transition-colors ${
                            isFull
                              ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                              : selectedSession?.id === st.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                                : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold capitalize text-gray-800">
                              {st.name}
                            </span>
                            <span className="text-sm font-semibold text-indigo-600">
                              {st.priceModifier > 0
                                ? `+$${st.priceModifier}`
                                : "Included"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            {isFull ? (
                              <span className="text-red-500 font-medium">
                                Fully Booked
                              </span>
                            ) : isLow ? (
                              <span className="text-amber-500 font-medium">
                                Only {st.availableSeats} seats left!
                              </span>
                            ) : (
                              <span>{st.availableSeats} seats available</span>
                            )}
                            {st.location && (
                              <span className="flex items-center gap-1">
                                <FiMapPin className="text-xs" />
                                {st.location}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    {selectedTimeSlot
                      ? "No session types available"
                      : "Select a time slot first"}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-900">Total Price</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${Math.round(totalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Base Price</span>
                  <span>+ ${Math.round(course.basePrice)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Session Type</span>
                  <span>+ ${selectedSession?.priceModifier ?? 0}</span>
                </div>

                <button
                  onClick={() => handleEnroll(false)}
                  disabled={enrolling || (isAuthenticated && !selectedSession)}
                  className="mt-3 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              </div>

              {enrollError && (
                <p className="text-xs text-red-500 text-center">
                  {enrollError}
                </p>
              )}

              {isAuthenticated && !user?.profileComplete && (
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      Complete Your Profile
                    </p>
                    <p className="text-xs text-amber-600">
                      You need to fill in your profile details before enrolling.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="ml-3 shrink-0 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    Complete →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
