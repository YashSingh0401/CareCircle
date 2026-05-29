import { create } from "zustand";

export type Personnel = {
  id: string;
  name: string;
  role: "Doctor" | "Nurse" | "Technician" | "Support";
  department: string;
  credentials: {
    loginId: string;
    password: string;
  };
};

type PersonnelStore = {
  personnelList: Personnel[];
  addPersonnel: (personnel: Omit<Personnel, "id" | "credentials">) => Personnel;
  removePersonnel: (id: string) => void;
};

// Initial mock data
const initialPersonnel: Personnel[] = [
  {
    id: "p1",
    name: "Dr. Sarah Chen",
    role: "Doctor",
    department: "Cardiology",
    credentials: { loginId: "DOC-8392", password: "••••••••" },
  },
  {
    id: "p2",
    name: "Dr. Marcus Thorne",
    role: "Doctor",
    department: "Neurology",
    credentials: { loginId: "DOC-1042", password: "••••••••" },
  },
  {
    id: "p3",
    name: "Elena Rodriguez",
    role: "Nurse",
    department: "Emergency",
    credentials: { loginId: "EMP-4421", password: "••••" },
  },
];

export const usePersonnelStore = create<PersonnelStore>((set, get) => ({
  personnelList: initialPersonnel,
  addPersonnel: (data) => {
    const isDoctor = data.role === "Doctor";
    const loginId = isDoctor
      ? `DOC-${Math.floor(1000 + Math.random() * 9000)}`
      : `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const password = isDoctor
      ? Math.random().toString(36).slice(-8) + "D#"
      : Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit PIN for staff

    const newPersonnel: Personnel = {
      ...data,
      id: `p${Date.now()}`,
      credentials: {
        loginId,
        password,
      },
    };

    set((state) => ({
      personnelList: [newPersonnel, ...state.personnelList],
    }));

    return newPersonnel;
  },
  removePersonnel: (id) => {
    set((state) => ({
      personnelList: state.personnelList.filter((p) => p.id !== id),
    }));
  },
}));
