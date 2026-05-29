import { create } from "zustand";

type MapStore = {
  uploadedMapUrl: string | null;
  setUploadedMapUrl: (url: string | null) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  uploadedMapUrl: null,
  setUploadedMapUrl: (url) => set({ uploadedMapUrl: url }),
}));
