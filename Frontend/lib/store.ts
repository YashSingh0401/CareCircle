import { create } from "zustand";
import { api } from "./api";
import {
  QueueItem,
  QueueStatus,
  DoctorRow,
  EmergencyCase,
  FeedItem,
  ToastEvent,
  MedicalReport,
} from "./realtime/realtimeSimulatorStore";

export type AppState = {
  // Queue
  liveQueue: QueueItem[];
  fetchQueue: (queueId: string) => Promise<void>;

  // Doctors
  liveDoctors: DoctorRow[];
  fetchDoctors: () => Promise<void>;

  // Emergencies
  liveEmergencies: EmergencyCase[];
  fetchEmergencies: () => Promise<void>;

  // Generic Feed/Toast wrappers for UI
  feedItems: FeedItem[];
  toastQueue: ToastEvent[];
  addToast: (toast: Omit<ToastEvent, "id">) => void;
  addFeedItem: (item: Omit<FeedItem, "id">) => void;

  // Derived / Settings
  emergencyPulseOn: boolean;

  // Medical Reports
  reports: MedicalReport[];
  fetchReports: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  liveQueue: [],
  liveDoctors: [],
  liveEmergencies: [],
  feedItems: [],
  toastQueue: [],
  emergencyPulseOn: false,
  reports: [],

  fetchQueue: async (queueId: string) => {
    try {
      const res = await api.get(`/api/queue/${queueId}/entries`);
      // Map backend entries to frontend QueueItem format
      const entries = res.data.entries.map((entry: any) => ({
        token: `T-${entry.token_number}`,
        patient: entry.patient_full_name || "Unknown Patient",
        wait: "0m", // Needs predictor mapping
        status: entry.status as QueueStatus,
      }));
      set({ liveQueue: entries });
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  },

  fetchDoctors: async () => {
    try {
      const res = await api.get("/api/doctors/");
      const doctors = res.data.doctors.map((d: any) => ({
        name: d.user_name || d.name || "Dr. Unknown",
        specialty: d.specialization || "General",
        state: d.is_available ? "available" : "busy",
        consults: d.total_reviews || 0,
      }));
      set({ liveDoctors: doctors });
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  },

  fetchEmergencies: async () => {
    try {
      const res = await api.get("/api/queue/emergency-alerts");
      const alerts = res.data.alerts.map((a: any) => ({
        title: "Emergency Alert",
        room: a.hospital_id || "ER",
        priority: a.severity_level >= 4 ? "critical" : a.severity_level >= 2 ? "high" : "stable",
        status: a.status,
      }));
      set({ liveEmergencies: alerts, emergencyPulseOn: alerts.some((a: any) => a.priority === "critical") });
    } catch (err) {
      console.error("Failed to fetch emergencies", err);
    }
  },

  addToast: (toast) => {
    set((state) => ({
      toastQueue: [{ id: `toast-${Date.now()}`, ...toast }, ...state.toastQueue],
    }));
  },

  addFeedItem: (item) => {
    set((state) => ({
      feedItems: [{ id: `feed-${Date.now()}`, ...item }, ...state.feedItems],
    }));
  },

  fetchReports: async () => {
    try {
      const userId = (await import("@/lib/authStore")).useAuthStore.getState().user?.id || "patient-123";
      const res = await api.get(`/api/records/patient/${userId}`);
      const reports = res.data.records.map((r: any) => ({
        id: r.id,
        patientId: r.patient_id,
        reportName: r.file_name,
        uploadedAt: new Date(r.uploaded_at).toLocaleDateString(),
        proof: "Blockchain verified", // Placeholder for actual verification
      }));
      set({ reports });
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  },
}));
