export interface PlantDiagnostic {
  plantType: string;
  status: string;
  diseaseName: string;
  confidence: string;
  symptoms: string;
  cause: string;
  solutions: string[];
  preventativeMeasures: string[];
}

export interface SoilAnalysis {
  pH: number;
  moisture: number;
  N: number;
  P: number;
  K: number;
  soilType: string;
  suitability?: string;
  status?: string;
  recommendations?: string[];
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  category: "bón phân" | "tưới nước" | "sâu bệnh" | "thu hoạch" | "chung";
  imageUrl?: string;
  areaId?: string;
  areaName?: string;
  soilData?: {
    pH: number;
    moisture: number;
    N: number;
    P: number;
    K: number;
    soilType: string;
  };
  linkedTodos?: Array<{ id: string; text: string; completed: boolean }>;
}

export interface CultivationArea {
  id: string;
  name: string;
  latitude: number; // Y coordinate on map
  longitude: number; // X coordinate on map
  description?: string;
  soilData?: {
    pH: number;
    moisture: number;
    N: number;
    P: number;
    K: number;
    soilType: string;
  };
}

export type ActiveTab = "home" | "scan" | "soil" | "diary";
