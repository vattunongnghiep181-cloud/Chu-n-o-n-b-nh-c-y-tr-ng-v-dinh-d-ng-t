import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  Trash2, 
  Folder, 
  Tag, 
  Image, 
  Check, 
  FileText,
  AlertCircle,
  Share2,
  MapPin,
  Map,
  Layers,
  Compass,
  Droplets,
  Activity,
  ChevronRight,
  Info,
  Settings,
  Trash,
  Sliders,
  CheckCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Locate,
  ListTodo
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiaryEntry, CultivationArea } from "../types";
import ShareModal from "./ShareModal";

const SOIL_TYPES = [
  "Đất đỏ bazan (Lâm Đồng, Tây Nguyên)",
  "Đất thịt phù sa (Đồng bằng sông Hồng/Cửu Long)",
  "Đất phèn / Đất chua",
  "Đất cát pha / Đất nghèo hữu cơ"
];

const INITIAL_AREAS: CultivationArea[] = [
  {
    id: "area-1",
    name: "Khu A - Cà phê Cầu Đất (Sườn đồi)",
    latitude: 38, // representing percentage of map Y
    longitude: 65, // representing percentage of map X
    description: "Đất đỏ bazan dốc nhẹ, thoát nước tốt chuyên trồng Robusta xen bơ.",
    soilData: {
      pH: 4.9,
      moisture: 58,
      N: 95,
      P: 38,
      K: 125,
      soilType: "Đất đỏ bazan (Lâm Đồng, Tây Nguyên)"
    }
  },
  {
    id: "area-2",
    name: "Khu B - Sầu riêng Dona (Thung lũng Di Linh)",
    latitude: 72,
    longitude: 32,
    description: "Đất bằng phẳng mỡ màng cạnh suối tự nhiên, chuyên canh sầu riêng Ri6 và Dona.",
    soilData: {
      pH: 5.8,
      moisture: 68,
      N: 140,
      P: 52,
      K: 190,
      soilType: "Đất đỏ bazan (Lâm Đồng, Tây Nguyên)"
    }
  }
];

const INITIAL_ENTRIES: DiaryEntry[] = [
  {
    id: "entry-1",
    date: "2026-06-25",
    title: "Bón compost hữu cơ đợt đầu mùa mưa",
    category: "bón phân",
    content: "Ủ phân bã cà phê và vỏ đậu hoai mục với chế phẩm Trichoderma được 2 tháng, hôm nay mang ra bón rải quanh tán cho 120 gốc cà phê non. Đất rất xốp, ẩm tốt. Bác Lưu ý bón cách gốc 15-20cm để không nóng rễ rây tổn thương.",
    areaId: "area-1",
    areaName: "Khu A - Cà phê Cầu Đất (Sườn đồi)",
    soilData: {
      pH: 4.9,
      moisture: 58,
      N: 95,
      P: 38,
      K: 125,
      soilType: "Đất đỏ bazan (Lâm Đồng, Tây Nguyên)"
    }
  },
  {
    id: "entry-2",
    date: "2026-06-28",
    title: "Xử lý đốm lá rỉ sắt lốm đốm",
    category: "sâu bệnh",
    content: "Phát hiện khoảng 5 gốc cà phê tơ bị đốm vàng cam hình elip lốm đốm dưới mặt lá. Đã cắt bỏ hết các lá bị bệnh nặng đem gom đốt tiêu huỷ. Chuẩn bị phun nước vôi trong khử nấm phòng bệnh lây lan.",
    areaId: "area-1",
    areaName: "Khu A - Cà phê Cầu Đất (Sườn đồi)",
    soilData: {
      pH: 4.9,
      moisture: 58,
      N: 95,
      P: 38,
      K: 125,
      soilType: "Đất đỏ bazan (Lâm Đồng, Tây Nguyên)"
    }
  }
];

export default function TabDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [areas, setAreas] = useState<CultivationArea[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("tất cả");
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Cultivation Area Map & Creation State
  const [clickedCoords, setClickedCoords] = useState<{ x: number, y: number } | null>(null);
  const [selectedAreaOnMap, setSelectedAreaOnMap] = useState<CultivationArea | null>(null);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [isEditingArea, setIsEditingArea] = useState(false);

  // New Area Form Inputs
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaDesc, setNewAreaDesc] = useState("");
  const [newAreaSoilType, setNewAreaSoilType] = useState(SOIL_TYPES[0]);
  const [newAreaPH, setNewAreaPH] = useState<number>(5.8);
  const [newAreaMoisture, setNewAreaMoisture] = useState<number>(60);
  const [newAreaN, setNewAreaN] = useState<number>(110);
  const [newAreaP, setNewAreaP] = useState<number>(45);
  const [newAreaK, setNewAreaK] = useState<number>(140);

  // Selected Area for link to a diary entry
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Share modal state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareSubtitle, setShareSubtitle] = useState("");
  const [shareText, setShareText] = useState("");

  // Garden To-Do List state with localStorage persistence
  const [todos, setTodos] = useState<Array<{ id: string; text: string; completed: boolean }>>(() => {
    const saved = localStorage.getItem("vtnn_todos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Lỗi parse todos từ localStorage:", e);
      }
    }
    return [
      { id: "1", text: "Kiểm tra sâu bệnh bọ xít lá cà phê", completed: false },
      { id: "2", text: "Tưới bổ sung giữ ẩm cho gốc hoa màu", completed: true },
      { id: "3", text: "Pha chế phẩm sinh học Trichoderma bón gốc", completed: false },
      { id: "4", text: "Kiểm tra độ ẩm đất bồn cà phê", completed: false }
    ];
  });
  const [newTodoText, setNewTodoText] = useState("");

  useEffect(() => {
    localStorage.setItem("vtnn_todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false
    };
    setTodos((prev) => [newTodo, ...prev]);
    setNewTodoText("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const loadDefaultTodos = () => {
    setTodos([
      { id: "1", text: "Kiểm tra sâu bệnh bọ xít lá cà phê", completed: false },
      { id: "2", text: "Tưới bổ sung giữ ẩm cho gốc hoa màu", completed: false },
      { id: "3", text: "Pha chế phẩm sinh học Trichoderma bón gốc", completed: false },
      { id: "4", text: "Kiểm tra độ ẩm đất bồn cà phê", completed: false }
    ]);
  };

  const handleShareEntry = (entry: DiaryEntry) => {
    let areaInfo = "";
    if (entry.areaName && entry.soilData) {
      areaInfo = `
📍 Khu vực: ${entry.areaName}
🧪 Độ chua pH: ${entry.soilData.pH.toFixed(1)} | 💧 Độ ẩm: ${entry.soilData.moisture}%
🌾 Chỉ số NPK: N ${entry.soilData.N} - P ${entry.soilData.P} - K ${entry.soilData.K} ppm
----------------------------------------`;
    }

    const formattedText = `[NHẬT KÝ SỔ TAY NÔNG NGHIỆP]
📅 Ngày ghi chép: ${entry.date}
🏷️ Danh mục: ${entry.category.toUpperCase()}${areaInfo}
📝 Tiêu đề: ${entry.title}

----------------------------------------
NỘI DUNG CHI TIẾT:
${entry.content}
----------------------------------------

-- Chia sẻ từ ứng dụng Sổ tay Nông nghiệp Lâm Đồng --`;

    setShareTitle(`Chia sẻ Nhật ký: ${entry.title}`);
    setShareSubtitle(`Gửi thông tin ghi chép ngày ${entry.date} kèm chỉ số đất đai`);
    setShareText(formattedText);
    setIsShareOpen(true);
  };
  
  // New entry form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<DiaryEntry["category"]>("chung");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Selected To-Dos to link with the new diary entry
  const [selectedNewTodoIds, setSelectedNewTodoIds] = useState<string[]>([]);
  // Entry ID of the diary entry that is currently integrating / editing To-Dos
  const [integratingEntryId, setIntegratingEntryId] = useState<string | null>(null);
  // Temporary list of To-Do IDs during integration into an existing diary entry
  const [tempSelectedTodoIds, setTempSelectedTodoIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    // 1. Load Diary Entries
    const savedEntries = localStorage.getItem("vntt_diary_entries");
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (e) {
        setEntries(INITIAL_ENTRIES);
      }
    } else {
      setEntries(INITIAL_ENTRIES);
      localStorage.setItem("vntt_diary_entries", JSON.stringify(INITIAL_ENTRIES));
    }

    // 2. Load Cultivation Areas
    const savedAreas = localStorage.getItem("vntt_cultivation_areas");
    if (savedAreas) {
      try {
        setAreas(JSON.parse(savedAreas));
      } catch (e) {
        setAreas(INITIAL_AREAS);
      }
    } else {
      setAreas(INITIAL_AREAS);
      localStorage.setItem("vntt_cultivation_areas", JSON.stringify(INITIAL_AREAS));
    }
  }, []);

  const saveEntries = (updated: DiaryEntry[]) => {
    setEntries(updated);
    localStorage.setItem("vntt_diary_entries", JSON.stringify(updated));
  };

  const saveAreas = (updated: CultivationArea[]) => {
    setAreas(updated);
    localStorage.setItem("vntt_cultivation_areas", JSON.stringify(updated));
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const matchedArea = areas.find(a => a.id === selectedAreaId);
    const linkedTodosData = todos.filter(t => selectedNewTodoIds.includes(t.id));

    const entry: DiaryEntry = {
      id: "entry-" + Date.now(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      date: newDate,
      imageUrl: newImageUrl ? newImageUrl : undefined,
      areaId: selectedAreaId || undefined,
      areaName: matchedArea ? matchedArea.name : undefined,
      soilData: matchedArea ? matchedArea.soilData : undefined,
      linkedTodos: linkedTodosData.length > 0 ? linkedTodosData.map(t => ({ ...t, completed: true })) : undefined
    };

    const updated = [entry, ...entries];
    saveEntries(updated);

    // Auto mark these todos as completed in the main todos list
    if (selectedNewTodoIds.length > 0) {
      setTodos(prev => prev.map(t => selectedNewTodoIds.includes(t.id) ? { ...t, completed: true } : t));
    }

    // Reset Form
    setNewTitle("");
    setNewContent("");
    setNewCategory("chung");
    setNewImageUrl("");
    setSelectedAreaId("");
    setSelectedNewTodoIds([]);
    setShowAddForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Bác có chắc chắn muốn xóa ghi chép nhật ký này không?")) {
      const updated = entries.filter(e => e.id !== id);
      saveEntries(updated);
    }
  };

  // Integration helper for existing entries
  const startIntegrateTodos = (entry: DiaryEntry) => {
    setIntegratingEntryId(entry.id);
    setTempSelectedTodoIds(entry.linkedTodos?.map(t => t.id) || []);
  };

  const handleSaveIntegratedTodos = (entryId: string) => {
    const linked = todos.filter(t => tempSelectedTodoIds.includes(t.id));
    const updated = entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          linkedTodos: linked.length > 0 ? linked.map(t => ({ ...t, completed: true })) : undefined
        };
      }
      return entry;
    });
    saveEntries(updated);

    // Also mark them as completed in the main todos list to keep in sync
    if (tempSelectedTodoIds.length > 0) {
      setTodos(prev => prev.map(t => tempSelectedTodoIds.includes(t.id) ? { ...t, completed: true } : t));
    }

    setIntegratingEntryId(null);
    setTempSelectedTodoIds([]);
  };

  // Map Click to place a pin and create/inspect area
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid double trigger if clicking on an actual pin button
    if ((e.target as HTMLElement).closest(".map-pin-btn")) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setClickedCoords({ x, y });
    setSelectedAreaOnMap(null);
    setIsEditingArea(false);
    
    // Auto populate defaults
    setNewAreaName(`Lô đất mới (Điểm ${x}% - ${y}%)`);
    setNewAreaDesc("Đất đai canh tác sườn đồi.");
    setNewAreaSoilType(SOIL_TYPES[0]);
    setNewAreaPH(5.8);
    setNewAreaMoisture(60);
    setNewAreaN(110);
    setNewAreaP(45);
    setNewAreaK(140);
    
    setShowAreaForm(true);
  };

  // Save new or edited cultivation area
  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    if (isEditingArea && selectedAreaOnMap) {
      // Edit mode
      const updated = areas.map(a => {
        if (a.id === selectedAreaOnMap.id) {
          return {
            ...a,
            name: newAreaName,
            description: newAreaDesc,
            soilData: {
              soilType: newAreaSoilType,
              pH: newAreaPH,
              moisture: newAreaMoisture,
              N: newAreaN,
              P: newAreaP,
              K: newAreaK
            }
          };
        }
        return a;
      });
      saveAreas(updated);
      setSelectedAreaOnMap(updated.find(a => a.id === selectedAreaOnMap.id) || null);
      setIsEditingArea(false);
    } else if (clickedCoords) {
      // Create mode
      const newArea: CultivationArea = {
        id: "area-" + Date.now(),
        name: newAreaName,
        latitude: clickedCoords.y,
        longitude: clickedCoords.x,
        description: newAreaDesc,
        soilData: {
          soilType: newAreaSoilType,
          pH: newAreaPH,
          moisture: newAreaMoisture,
          N: newAreaN,
          P: newAreaP,
          K: newAreaK
        }
      };
      const updated = [...areas, newArea];
      saveAreas(updated);
      setSelectedAreaOnMap(newArea); // focus newly created area
      setClickedCoords(null);
      setShowAreaForm(false);
    }
  };

  const handleDeleteArea = (id: string) => {
    if (confirm("Bác có chắc chắn muốn xóa khu vực canh tác này khỏi bản đồ không?")) {
      const updated = areas.filter(a => a.id !== id);
      saveAreas(updated);
      setSelectedAreaOnMap(null);
      setClickedCoords(null);
      setShowAreaForm(false);
    }
  };

  const startEditArea = (area: CultivationArea) => {
    setNewAreaName(area.name);
    setNewAreaDesc(area.description || "");
    if (area.soilData) {
      setNewAreaSoilType(area.soilData.soilType);
      setNewAreaPH(area.soilData.pH);
      setNewAreaMoisture(area.soilData.moisture);
      setNewAreaN(area.soilData.N);
      setNewAreaP(area.soilData.P);
      setNewAreaK(area.soilData.K);
    }
    setIsEditingArea(true);
    setShowAreaForm(true);
  };

  const filteredEntries = categoryFilter === "tất cả" 
    ? entries 
    : entries.filter(e => e.category === categoryFilter);

  const getCategoryColor = (cat: DiaryEntry["category"]) => {
    switch (cat) {
      case "bón phân": return "bg-emerald-50 text-emerald-800 border-emerald-200/50";
      case "tưới nước": return "bg-sky-50 text-sky-800 border-sky-200/50";
      case "sâu bệnh": return "bg-red-50 text-red-800 border-red-200/50";
      case "thu hoạch": return "bg-amber-50 text-amber-800 border-amber-200/50";
      default: return "bg-brand-low text-brand-text-variant border-brand-high";
    }
  };

  const getCategoryCardStyle = (cat: DiaryEntry["category"]) => {
    switch (cat) {
      case "bón phân": 
        return "border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-brand-surface to-emerald-500/10 dark:from-emerald-500/5 dark:to-emerald-500/15";
      case "tưới nước": 
        return "border-sky-500/25 bg-gradient-to-br from-sky-500/5 via-brand-surface to-sky-500/10 dark:from-sky-500/5 dark:to-sky-500/15";
      case "sâu bệnh": 
        return "border-red-500/25 bg-gradient-to-br from-red-500/5 via-brand-surface to-red-500/10 dark:from-red-500/5 dark:to-red-500/15";
      case "thu hoạch": 
        return "border-amber-500/25 bg-gradient-to-br from-amber-500/5 via-brand-surface to-amber-500/10 dark:from-amber-500/5 dark:to-amber-500/15";
      default: 
        return "border-brand-high bg-gradient-to-br from-brand-surface-dim/30 via-brand-surface to-brand-surface-dim/50";
    }
  };

  const getPHRating = (pH: number) => {
    if (pH < 5.0) return { label: "Axit nặng (Đất chua)", color: "text-red-500" };
    if (pH <= 6.8) return { label: "Lý tưởng (Màu mỡ)", color: "text-emerald-500" };
    return { label: "Kiềm nhẹ", color: "text-blue-500" };
  };

  const getMoistureRating = (m: number) => {
    if (m < 45) return { label: "Khô hạn", color: "text-amber-500" };
    if (m <= 78) return { label: "Đủ ẩm", color: "text-emerald-500" };
    return { label: "Ngập úng", color: "text-blue-500" };
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <span className="text-[11px] uppercase tracking-[0.3em] text-brand-tertiary font-bold">Ghi chép nông học</span>
          <h2 className="font-display font-light text-3xl md:text-4xl text-brand-primary leading-tight">Nhật ký Canh tác</h2>
          <p className="text-xs md:text-sm text-brand-text-variant font-light">
            Ghi lại nhật trình chăm sóc, liên kết dữ liệu đất đai cụ thể và đánh dấu khu vực canh tác trên bản đồ số hóa.
          </p>
        </div>
        
        {/* Toggle Form Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-primary hover:bg-brand-primary-light text-white py-2.5 px-4.5 rounded-xl flex items-center gap-1.5 font-bold shadow-md transition-all flex-shrink-0 active:scale-98 cursor-pointer text-xs uppercase tracking-wider"
        >
          {showAddForm ? "Đóng lại" : (
            <>
              <Plus className="w-4 h-4" />
              <span>Viết nhật ký</span>
            </>
          )}
        </button>
      </div>

      {/* DIGITAL MAP SECTION */}
      <div className="glass p-5 rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 via-brand-surface to-brand-surface shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-brand-high pb-3">
          <div className="flex items-center gap-2 text-left">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600">
              <Map className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-brand-primary">Bản đồ Số hóa Khu canh tác</h3>
              <p className="text-[10px] text-brand-text-variant font-light">Bấm vào bất kỳ điểm nào trên bản đồ để đăng ký lô đất hoặc chọn ghim để xem chỉ số đất</p>
            </div>
          </div>
          {areas.length > 0 && (
            <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-xl border border-brand-primary/15">
              ĐÃ GHI NHẬN {areas.length} KHU VỰC
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map interactive canvas */}
          <div className="lg:col-span-2 space-y-2">
            <div 
              onClick={handleMapClick}
              className="relative h-80 w-full rounded-3xl bg-slate-900 border border-brand-high/80 overflow-hidden shadow-inner cursor-crosshair group transition-all"
            >
              {/* Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              
              {/* Stylized vector map artwork representing mountains, rivers, agriculture zones of Lam Dong */}
              <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Hills / contours */}
                <path d="M 0 35 Q 25 15, 50 45 T 100 25" fill="none" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.4" />
                <path d="M 0 55 Q 35 35, 60 75 T 100 60" fill="none" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.3" />
                <path d="M 0 75 Q 20 65, 45 90 T 100 85" fill="none" stroke="#22c55e" strokeWidth="0.4" strokeOpacity="0.2" />
                
                {/* Water source winding path */}
                <path d="M 15 0 Q 35 45, 20 65 T 45 100" fill="none" stroke="#0ea5e9" strokeWidth="1.2" strokeOpacity="0.5" />
                <text x="25" y="45" fill="#0ea5e9" fillOpacity="0.4" fontSize="2.2" fontWeight="bold" transform="rotate(75 25 45)">Suối tự nhiên</text>
                
                {/* Lô zones marked */}
                <rect x="5" y="8" width="22" height="18" rx="2" fill="#10b981" fillOpacity="0.04" stroke="#10b981" strokeWidth="0.15" strokeDasharray="1 1" />
                <text x="7" y="12" fill="#10b981" fillOpacity="0.5" fontSize="2" fontWeight="bold">LÔ CÀ PHÊ ROB</text>
                
                <rect x="55" y="12" width="38" height="25" rx="3" fill="#84cc16" fillOpacity="0.04" stroke="#84cc16" strokeWidth="0.15" strokeDasharray="1 1" />
                <text x="57" y="17" fill="#84cc16" fillOpacity="0.5" fontSize="2" fontWeight="bold">PHÂN KHU SẦU RIÊNG</text>

                <rect x="42" y="62" width="48" height="28" rx="3" fill="#22c55e" fillOpacity="0.04" stroke="#22c55e" strokeWidth="0.15" strokeDasharray="1 1" />
                <text x="44" y="67" fill="#22c55e" fillOpacity="0.5" fontSize="2" fontWeight="bold">LÔ BƠ XEN CHÈ OOLONG</text>
              </svg>

              {/* Compass symbol */}
              <div className="absolute bottom-3 right-3 text-white/30 p-1 bg-black/20 rounded-full flex items-center gap-1.5 pointer-events-none text-[9px] font-mono">
                <Compass className="w-3.5 h-3.5 animate-spin-slow text-white/40" />
                <span>11.94° N / 108.45° E</span>
              </div>

              {/* Display existing registered markers */}
              {areas.map((area) => (
                <button
                  key={area.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAreaOnMap(area);
                    setClickedCoords(null);
                    setShowAreaForm(false);
                    setIsEditingArea(false);
                  }}
                  style={{ left: `${area.longitude}%`, top: `${area.latitude}%` }}
                  className="map-pin-btn absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group/pin active:scale-90 cursor-pointer transition-all z-10"
                  title={area.name}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 bg-zinc-950/90 text-white text-[9px] py-1 px-2 rounded-lg font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover/pin:opacity-100 transition-opacity flex items-center gap-1 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {area.name}
                  </div>
                  
                  {/* Pin Circle/Icon */}
                  <div className={`p-1.5 rounded-full shadow-lg border transition-all ${
                    selectedAreaOnMap?.id === area.id
                      ? "bg-emerald-500 border-white text-white scale-110 ring-4 ring-emerald-500/20"
                      : "bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:scale-105"
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  
                  {/* Glowing Pulse effect */}
                  {selectedAreaOnMap?.id === area.id && (
                    <span className="absolute -bottom-1 w-3 h-3 bg-emerald-500/50 rounded-full animate-ping pointer-events-none"></span>
                  )}
                </button>
              ))}

              {/* Dynamic click location indicator */}
              {clickedCoords && (
                <div
                  style={{ left: `${clickedCoords.x}%`, top: `${clickedCoords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-20 pointer-events-none animate-bounce"
                >
                  <div className="absolute bottom-full mb-1 bg-brand-primary text-white text-[9px] py-1 px-2 rounded-lg font-bold whitespace-nowrap shadow-lg">
                    Điểm chọn ({clickedCoords.x}%, {clickedCoords.y}%)
                  </div>
                  <div className="p-1.5 rounded-full bg-brand-primary border-2 border-white text-white shadow-xl ring-4 ring-brand-primary/30">
                    <MapPin className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="absolute bottom-0 w-3 h-3 bg-brand-primary rounded-full animate-ping"></span>
                </div>
              )}
            </div>

            {/* Informational help note */}
            <div className="flex gap-2 p-3 bg-brand-primary/5 rounded-2xl border border-brand-high items-start text-left">
              <Info className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-brand-text-variant font-light leading-relaxed">
                <strong className="text-brand-primary font-bold">Mẹo nông học:</strong> Nhấp trực tiếp vào các ghim màu lục để xem nhanh báo cáo đất đai hoặc nhấp vào vùng trống để thêm ghim định vị thửa đất canh tác mới cực kỳ nhanh chóng.
              </p>
            </div>
          </div>

          {/* Map Sidebar / Area Details / Creator Form */}
          <div className="bg-brand-surface-dim/40 rounded-3xl border border-brand-high p-4 flex flex-col justify-between space-y-4">
            
            {/* NO ACTIVE SELECTION: SHOW AREAS LIST */}
            {!clickedCoords && !selectedAreaOnMap && (
              <div className="space-y-3.5 flex-1 flex flex-col text-left">
                <div>
                  <h4 className="font-display font-bold text-xs uppercase text-brand-primary tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" /> Thửa đất đã định vị ({areas.length})
                  </h4>
                  <p className="text-[10px] text-brand-text-variant font-light">Bác có thể theo dõi và cập nhật trạng thái riêng của từng thửa</p>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1 flex-1">
                  {areas.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-brand-high flex flex-col items-center justify-center gap-2">
                      <Compass className="w-6 h-6 text-brand-text-variant/30 animate-spin-slow" />
                      <p className="text-[10px] text-brand-text-variant font-light">Chưa có thửa đất nào được ghi nhận.</p>
                      <span className="text-[9px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded font-bold">NHẤP VÀO BẢN ĐỒ ĐỂ TẠO</span>
                    </div>
                  ) : (
                    areas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => setSelectedAreaOnMap(area)}
                        className="w-full bg-white hover:bg-brand-primary/5 hover:border-brand-primary/30 p-3 rounded-2xl border border-brand-high text-left transition-all active:scale-98 flex items-start gap-2.5 cursor-pointer"
                      >
                        <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-xs text-brand-text truncate leading-tight">{area.name}</h5>
                            <span className="text-[8px] font-mono text-brand-text-variant bg-brand-low px-1 py-0.5 rounded border border-brand-high">
                              X:{area.longitude} Y:{area.latitude}
                            </span>
                          </div>
                          {area.description && (
                            <p className="text-[9px] text-brand-text-variant font-light truncate">{area.description}</p>
                          )}
                          {area.soilData && (
                            <div className="flex items-center gap-3 pt-1 text-[9px] font-mono text-emerald-600 font-bold border-t border-brand-high/50">
                              <span>🧪 pH {area.soilData.pH.toFixed(1)}</span>
                              <span>💧 {area.soilData.moisture}%</span>
                              <span>NPK: {area.soilData.N}-{area.soilData.P}-{area.soilData.K}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* CREATOR OR EDIT FORM FOR SELECTED COORDINATE/AREA */}
            {(clickedCoords || (selectedAreaOnMap && isEditingArea)) && (
              <form onSubmit={handleSaveArea} className="space-y-3 flex-1 flex flex-col text-left">
                <div className="border-b border-brand-high pb-2">
                  <h4 className="font-display font-bold text-xs uppercase text-brand-primary tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-brand-primary" /> 
                    {isEditingArea ? "Cập nhật Thửa Đất" : "Thêm Thửa Đất Mới"}
                  </h4>
                  <p className="text-[10px] text-brand-text-variant font-light">
                    {isEditingArea ? "Chỉnh sửa thông tin và thông số mẫu" : "Điền tên và gán kết quả phân tích mẫu đất thực địa"}
                  </p>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1 flex-1">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-text-variant uppercase block">Tên thửa đất/Lô canh tác:</label>
                    <input
                      type="text"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      placeholder="Ví dụ: Lô A1 - Cà phê chè tơ..."
                      required
                      className="w-full bg-white border border-brand-high p-2 rounded-xl text-xs font-semibold text-brand-text outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-text-variant uppercase block">Mô tả đặc điểm:</label>
                    <input
                      type="text"
                      value={newAreaDesc}
                      onChange={(e) => setNewAreaDesc(e.target.value)}
                      placeholder="Địa hình, giống cây trồng chính..."
                      className="w-full bg-white border border-brand-high p-2 rounded-xl text-xs font-light text-brand-text outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-text-variant uppercase block">Loại thổ nhưỡng đất đai:</label>
                    <select
                      value={newAreaSoilType}
                      onChange={(e) => setNewAreaSoilType(e.target.value)}
                      className="w-full bg-white border border-brand-high p-2 rounded-xl text-xs font-semibold text-brand-text focus:border-brand-primary outline-none"
                    >
                      {SOIL_TYPES.map((type, i) => (
                        <option key={i} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* pH slider */}
                  <div className="bg-white p-2.5 rounded-xl border border-brand-high space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold text-brand-text-variant">
                      <span>🧪 ĐỘ CHUA ĐẤT (pH)</span>
                      <span className="text-brand-primary font-mono">{newAreaPH.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="3.5"
                      max="8.5"
                      step="0.1"
                      value={newAreaPH}
                      onChange={(e) => setNewAreaPH(parseFloat(e.target.value))}
                      className="w-full accent-brand-primary h-1"
                    />
                  </div>

                  {/* Moisture slider */}
                  <div className="bg-white p-2.5 rounded-xl border border-brand-high space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold text-brand-text-variant">
                      <span>💧 ĐỘ ẨM KHU ĐẤT (%)</span>
                      <span className="text-sky-600 font-mono">{newAreaMoisture}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={newAreaMoisture}
                      onChange={(e) => setNewAreaMoisture(parseInt(e.target.value))}
                      className="w-full accent-brand-primary h-1"
                    />
                  </div>

                  {/* NPK Values inputs */}
                  <div className="bg-white p-2.5 rounded-xl border border-brand-high space-y-1.5">
                    <span className="text-[9px] font-bold text-brand-text-variant uppercase block text-center">Chỉ số NPK mẫu đất (ppm)</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div>
                        <span className="text-emerald-600 block text-[8px] font-sans">N (ĐẠM)</span>
                        <input
                          type="number"
                          value={newAreaN}
                          onChange={(e) => setNewAreaN(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-center bg-zinc-50 border border-brand-high rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-amber-600 block text-[8px] font-sans">P (LÂN)</span>
                        <input
                          type="number"
                          value={newAreaP}
                          onChange={(e) => setNewAreaP(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-center bg-zinc-50 border border-brand-high rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-sky-600 block text-[8px] font-sans">K (KALI)</span>
                        <input
                          type="number"
                          value={newAreaK}
                          onChange={(e) => setNewAreaK(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-center bg-zinc-50 border border-brand-high rounded p-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-brand-high/50">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-primary hover:bg-brand-primary-light text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider"
                  >
                    Lưu thông tin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClickedCoords(null);
                      setIsEditingArea(false);
                      setShowAreaForm(false);
                    }}
                    className="px-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* DETAILED INSIGHTS FOR CLICKED EXISITING AREA NODE */}
            {selectedAreaOnMap && !isEditingArea && (
              <div className="space-y-3.5 flex-1 flex flex-col text-left">
                <div className="border-b border-brand-high pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-xs uppercase text-brand-primary tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> {selectedAreaOnMap.name}
                      </h4>
                      <p className="text-[10px] text-brand-text-variant font-light">Tọa độ định vị: Trục ngang {selectedAreaOnMap.longitude}%, Trục dọc {selectedAreaOnMap.latitude}%</p>
                    </div>
                    <button
                      onClick={() => handleDeleteArea(selectedAreaOnMap.id)}
                      className="text-red-500 hover:text-red-600 p-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Xóa thửa đất"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {selectedAreaOnMap.soilData && (
                  <div className="space-y-3 overflow-y-auto max-h-64 pr-1 flex-1">
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold text-brand-text-variant uppercase block">Đặc điểm thổ nhưỡng:</span>
                      <p className="text-[11px] leading-relaxed text-zinc-700 font-light bg-white border border-brand-high/80 p-2.5 rounded-xl">
                        {selectedAreaOnMap.soilData.soilType}
                        {selectedAreaOnMap.description && (
                          <span className="block border-t border-brand-high/50 pt-1 mt-1 text-[10px] italic text-brand-text-variant">
                            "{selectedAreaOnMap.description}"
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white border border-brand-high p-2.5 rounded-2xl text-center space-y-0.5">
                        <span className="text-[8px] font-bold text-brand-text-variant uppercase block">Độ Chua Đất</span>
                        <span className="text-xs font-bold text-zinc-900 block">{selectedAreaOnMap.soilData.pH.toFixed(1)} pH</span>
                        <span className={`text-[8px] font-bold ${getPHRating(selectedAreaOnMap.soilData.pH).color}`}>
                          {getPHRating(selectedAreaOnMap.soilData.pH).label}
                        </span>
                      </div>
                      <div className="bg-white border border-brand-high p-2.5 rounded-2xl text-center space-y-0.5">
                        <span className="text-[8px] font-bold text-brand-text-variant uppercase block">Độ ẩm mẫu đất</span>
                        <span className="text-xs font-bold text-zinc-900 block">{selectedAreaOnMap.soilData.moisture}%</span>
                        <span className={`text-[8px] font-bold ${getMoistureRating(selectedAreaOnMap.soilData.moisture).color}`}>
                          {getMoistureRating(selectedAreaOnMap.soilData.moisture).label}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-brand-high p-3 rounded-2xl space-y-1.5 text-center">
                      <span className="text-[8px] font-bold text-brand-text-variant uppercase block">Dinh dưỡng N-P-K hiện trạng (ppm)</span>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px] font-bold">
                        <div className="bg-emerald-500/5 py-1 rounded text-emerald-700">
                          <span className="block font-sans text-[7px] text-emerald-600">ĐẠM (N)</span>
                          {selectedAreaOnMap.soilData.N}
                        </div>
                        <div className="bg-amber-500/5 py-1 rounded text-amber-700">
                          <span className="block font-sans text-[7px] text-brand-tertiary">LÂN (P)</span>
                          {selectedAreaOnMap.soilData.P}
                        </div>
                        <div className="bg-sky-500/5 py-1 rounded text-sky-700">
                          <span className="block font-sans text-[7px] text-sky-600">KALI (K)</span>
                          {selectedAreaOnMap.soilData.K}
                        </div>
                      </div>
                    </div>

                    {/* Quick Sync link action */}
                    <button
                      onClick={() => {
                        if (selectedAreaOnMap.soilData) {
                          // Quick hint: tell them they can view in testing page
                          alert(`Đã nạp chỉ số thửa "${selectedAreaOnMap.name}" thành công! Bác vui lòng mở tab "Kiểm Đất" để AI phân tích cải tạo và tư vấn phân bón cho loại đất này nhé.`);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-brand-primary/10 hover:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 p-2.5 rounded-2xl text-[10px] font-bold transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Đưa chỉ số sang trang Kiểm Đất
                    </button>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-brand-high/50">
                  <button
                    onClick={() => startEditArea(selectedAreaOnMap)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" /> Sửa chỉ số
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAreaOnMap(null);
                      setClickedCoords(null);
                    }}
                    className="px-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider"
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Entry Form Modal/Section */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-brand-surface to-amber-500/10 dark:from-amber-500/5 dark:to-amber-500/15 shadow-xl overflow-hidden"
          >
            <form onSubmit={handleAddEntry} className="space-y-4">
              <h3 className="font-display font-bold text-lg text-brand-primary flex items-center gap-2 border-b border-brand-high pb-2.5">
                <BookOpen className="w-4 h-4 text-brand-tertiary" /> Ghi chép chăm sóc mới
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-bold text-brand-text-variant uppercase tracking-wider">Ngày ghi chép:</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full bg-brand-low border border-brand-high p-3 rounded-xl text-sm font-medium text-brand-text outline-none focus:border-brand-primary transition-all"
                  />
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-bold text-brand-text-variant uppercase tracking-wider">Phân loại hoạt động:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DiaryEntry["category"])}
                    className="w-full bg-brand-low border border-brand-high p-3 rounded-xl text-sm font-medium text-brand-text outline-none focus:border-brand-primary transition-all"
                  >
                    <option value="chung" className="bg-white text-brand-text">Hoạt động chung</option>
                    <option value="bón phân" className="bg-white text-brand-text">Bón phân hữu cơ/compost</option>
                    <option value="tưới nước" className="bg-white text-brand-text">Tưới nước giữ ẩm</option>
                    <option value="sâu bệnh" className="bg-white text-brand-text">Xử lý sâu bệnh hại</option>
                    <option value="thu hoạch" className="bg-white text-brand-text">Thu hoạch mùa vụ</option>
                  </select>
                </div>
              </div>

              {/* LINK CULTIVATION AREA DROPDOWN */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-brand-text-variant uppercase tracking-wider">Liên kết thửa đất canh tác:</label>
                  <span className="text-[9px] text-emerald-600 font-bold">Lấy định vị & chỉ số mẫu đất băm vào nhật ký</span>
                </div>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full bg-brand-low border border-brand-high p-3 rounded-xl text-sm font-medium text-brand-text outline-none focus:border-brand-primary transition-all"
                >
                  <option value="">-- Không liên kết thửa đất --</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} (🧪 pH: {area.soilData?.pH.toFixed(1)} | 💧: {area.soilData?.moisture}%)
                    </option>
                  ))}
                </select>
                {selectedAreaId && (
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-zinc-700 text-left leading-relaxed flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Hệ thống sẽ băm chính xác thông số dinh dưỡng <strong className="text-emerald-700">Đạm, Lân, Kali</strong> của thửa đất này vào lịch sử nhật ký nông hộ của bác để lưu trữ vĩnh viễn.</span>
                  </div>
                )}
              </div>

              {/* TÍCH HỢP KẾ HOẠCH CHĂM VƯỜN (TO-DOS) */}
              <div className="space-y-2 text-left bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <ListTodo className="w-3.5 h-3.5" /> Tích hợp kế hoạch chăm vườn (To-dos):
                  </label>
                  <span className="text-[9px] text-emerald-600 font-bold">Chọn các việc sẽ hoàn thành cùng nhật ký này</span>
                </div>
                
                {todos.length === 0 ? (
                  <p className="text-xs italic text-brand-text-variant">Chưa có kế hoạch chăm vườn nào được tạo. Hãy tạo kế hoạch chăm vườn ở dưới trước nhé!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {todos.map(todo => (
                      <label 
                        key={todo.id} 
                        className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                          selectedNewTodoIds.includes(todo.id)
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-semibold"
                            : "bg-brand-low border-brand-high hover:bg-brand-high/30 text-brand-text"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNewTodoIds.includes(todo.id)}
                          onChange={() => {
                            setSelectedNewTodoIds(prev => 
                              prev.includes(todo.id) ? prev.filter(id => id !== todo.id) : [...prev, todo.id]
                            );
                          }}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs leading-snug line-clamp-2">{todo.text} {todo.completed && "✔️"}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-brand-text-variant uppercase tracking-wider">Tiêu đề hoạt động:</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Bón lót phân chuồng vi sinh đợt rộ bông..."
                  required
                  className="w-full bg-brand-low border border-brand-high p-3 rounded-xl text-sm font-light text-brand-text outline-none focus:border-brand-primary transition-all placeholder:text-brand-text-variant/40"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-brand-text-variant uppercase tracking-wider">Chi tiết công việc của ngày:</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Bác mô tả chi tiết lượng bón, tình hình thời tiết, trạng thái rễ và đất vườn..."
                  rows={4}
                  required
                  className="w-full bg-brand-low border border-brand-high p-3 rounded-xl text-sm font-light text-brand-text outline-none focus:border-brand-primary transition-all placeholder:text-brand-text-variant/40"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-bold text-brand-text-variant uppercase tracking-wider">Ảnh minh họa (Link ảnh tùy chọn):</label>
                <input 
                  type="url" 
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Ví dụ: https://images.unsplash.com/..."
                  className="w-full bg-brand-low border border-brand-high p-3 rounded-xl text-xs font-light text-brand-text outline-none focus:border-brand-primary transition-all placeholder:text-brand-text-variant/40"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary-light text-white py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-98 cursor-pointer text-xs uppercase tracking-wider"
              >
                Lưu ghi chép vào nhật ký
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tính năng To-do list chăm sóc vườn */}
      <div className="glass p-5 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-brand-surface to-brand-surface shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ListTodo className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-bold text-base text-brand-text">Kế hoạch chăm vườn</h3>
              <p className="text-[11px] text-brand-text-variant">Việc cần làm trong ngày</p>
            </div>
          </div>
          {todos.length > 0 && (
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">
              {todos.filter((t) => t.completed).length}/{todos.length} việc
            </span>
          )}
        </div>

        {/* Thanh tiến độ */}
        {todos.length > 0 && (
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center text-[10px] text-brand-text-variant font-bold">
              <span>TIẾN ĐỘ HOÀN THÀNH</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {Math.round((todos.filter((t) => t.completed).length / todos.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-brand-high dark:bg-emerald-950/30 rounded-full h-2 overflow-hidden border border-brand-high/50">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${Math.round((todos.filter((t) => t.completed).length / todos.length) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Form thêm việc mới */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ví dụ: Tưới nước vườn cà phê..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo(newTodoText)}
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-brand-high/35 border border-brand-high text-brand-text placeholder-brand-text-variant/75 focus:outline-none focus:border-emerald-500/60"
          />
          <button
            onClick={() => addTodo(newTodoText)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-xl transition-all font-bold flex items-center justify-center cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Gợi ý việc nhanh */}
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] text-brand-text-variant uppercase font-bold tracking-wider block">Gợi ý nhanh:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { text: "Tưới nước vườn 💧", short: "Tưới nước vườn" },
              { text: "Bón phân gốc 🪵", short: "Bón phân gốc" },
              { text: "Phun chế phẩm sinh học 🌿", short: "Phun chế phẩm sinh học" },
              { text: "Nhổ cỏ quanh bồn 🌾", short: "Nhổ cỏ quanh bồn" },
              { text: "Kiểm tra sâu bệnh lá 🐛", short: "Kiểm tra sâu bệnh bám lá" }
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addTodo(preset.short)}
                className="text-[10px] bg-brand-high/45 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 border border-brand-high px-2 py-1 rounded-lg transition-colors cursor-pointer text-brand-text font-medium active:scale-95"
              >
                {preset.text}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách việc */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {todos.length > 0 ? (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                  todo.completed
                    ? "bg-emerald-500/5 border-emerald-500/10 text-brand-text-variant opacity-75"
                    : "bg-brand-high/15 border-brand-high text-brand-text"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      todo.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-brand-text-variant hover:border-emerald-500 bg-transparent"
                    }`}
                  >
                    {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className={`text-xs truncate ${todo.completed ? "line-through text-brand-text-variant" : "text-brand-text"}`}>
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-brand-text-variant hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Xóa việc"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs text-brand-text-variant space-y-2">
              <p>Hôm nay bác đã hoàn thành hết mọi việc hoặc chưa có kế hoạch.</p>
              <button
                onClick={loadDefaultTodos}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Nạp danh sách việc mẫu sinh học
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {["tất cả", "chung", "bón phân", "tưới nước", "sâu bệnh", "thu hoạch"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-bold whitespace-nowrap border capitalize transition-all active:scale-95 cursor-pointer ${
              categoryFilter === cat 
                ? "bg-brand-primary text-white border-brand-primary shadow-md scale-102" 
                : "glass text-brand-text-variant border-brand-high hover:border-brand-primary/30 hover:text-brand-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Diary List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 glass border-dashed border-brand-high rounded-3xl p-6 text-brand-text-variant space-y-3">
            <AlertCircle className="w-7 h-7 text-brand-primary/20 mx-auto" />
            <p className="font-bold text-sm uppercase tracking-wider text-brand-primary">Không tìm thấy ghi chép nào</p>
            <p className="text-xs font-light">Bác bấm vào nút "Viết nhật ký" ở phía trên để thêm ghi chép nhé!</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <motion.div
              layout
              key={entry.id}
              className={`glass rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border text-left ${getCategoryCardStyle(entry.category)}`}
            >
              {entry.imageUrl && (
                <div className="md:w-44 h-40 md:h-auto overflow-hidden flex-shrink-0 border-b md:border-b-0 md:border-r border-brand-high">
                  <img 
                    src={entry.imageUrl} 
                    alt={entry.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-5 flex-1 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border capitalize ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </span>
                    <span className="text-[10px] font-medium text-brand-text-variant flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      {entry.date}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-bold text-lg md:text-xl text-brand-text leading-snug">
                    {entry.title}
                  </h3>

                  {/* LINKED AREA & SOIL DATA DISPLAY INSIDE DIARY ENTRY */}
                  {entry.areaName && (
                    <div className="bg-brand-surface dark:bg-brand-surface-dim/50 border border-brand-high/80 p-3 rounded-2xl space-y-2.5 mt-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-brand-primary flex items-center gap-1.5 uppercase tracking-wide">
                          <MapPin className="w-3.5 h-3.5 text-red-500" /> Thửa đất: {entry.areaName}
                        </span>
                        {entry.soilData && (
                          <span className="font-mono text-[9px] text-emerald-600 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            🧪 pH {entry.soilData.pH.toFixed(1)}
                          </span>
                        )}
                      </div>
                      
                      {entry.soilData && (
                        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono font-bold">
                          <div className="bg-emerald-500/5 text-emerald-700 py-1.5 rounded border border-emerald-500/10">
                            <span className="block font-sans text-[7px] font-bold text-emerald-600">ĐẠM (N)</span>
                            {entry.soilData.N} ppm
                          </div>
                          <div className="bg-amber-500/5 text-amber-700 py-1.5 rounded border border-amber-500/10">
                            <span className="block font-sans text-[7px] font-bold text-brand-tertiary">LÂN (P)</span>
                            {entry.soilData.P} ppm
                          </div>
                          <div className="bg-sky-500/5 text-sky-700 py-1.5 rounded border border-sky-500/10">
                            <span className="block font-sans text-[7px] font-bold text-sky-600">KALI (K)</span>
                            {entry.soilData.K} ppm
                          </div>
                          <div className="bg-indigo-500/5 text-indigo-700 py-1.5 rounded border border-indigo-500/10">
                            <span className="block font-sans text-[7px] font-bold text-indigo-600">ĐỘ ẨM</span>
                            {entry.soilData.moisture}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs md:text-sm text-brand-text-variant leading-relaxed whitespace-pre-line font-light pt-1">
                    {entry.content}
                  </p>

                  {/* LINKED TODOS */}
                  {entry.linkedTodos && entry.linkedTodos.length > 0 && (
                    <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/10 p-3 rounded-2xl space-y-2 mt-2.5 text-left">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block uppercase tracking-wide flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5" /> Kế hoạch chăm sóc đã tích hợp:
                      </span>
                      <div className="space-y-1.5">
                        {entry.linkedTodos.map(todo => (
                          <div key={todo.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                            <span className="line-through opacity-75">{todo.text}</span>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">Hoàn thành ✔️</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* INTEGRATION PANEL */}
                  {integratingEntryId === entry.id && (
                    <div className="mt-3 p-4 bg-brand-surface dark:bg-zinc-950 border border-emerald-500/20 rounded-2xl space-y-3 shadow-md text-left">
                      <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">Chọn công việc từ Kế hoạch chăm vườn để tích hợp vào nhật ký này:</span>
                      
                      {todos.length === 0 ? (
                        <p className="text-xs italic text-brand-text-variant">Chưa có kế hoạch chăm vườn nào được tạo.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                          {todos.map(todo => (
                            <label key={todo.id} className="flex items-start gap-2 p-2 hover:bg-brand-high/30 rounded-xl cursor-pointer text-xs border border-brand-high">
                              <input
                                type="checkbox"
                                checked={tempSelectedTodoIds.includes(todo.id)}
                                onChange={() => {
                                  setTempSelectedTodoIds(prev => 
                                    prev.includes(todo.id) ? prev.filter(id => id !== todo.id) : [...prev, todo.id]
                                  );
                                }}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="leading-tight">{todo.text} {todo.completed && "✔️"}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveIntegratedTodos(entry.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                        >
                          Lưu liên kết
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIntegratingEntryId(null);
                            setTempSelectedTodoIds([]);
                          }}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-brand-high flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleShareEntry(entry)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/5 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border border-emerald-500/20 cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Chia sẻ Zalo
                    </button>

                    <button
                      onClick={() => startIntegrateTodos(entry)}
                      className="text-brand-primary hover:text-brand-primary-light hover:bg-brand-primary/5 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border border-brand-primary/20 cursor-pointer active:scale-95"
                      title="Tích hợp thêm To-do việc cần làm vào nhật ký này"
                    >
                      <ListTodo className="w-3.5 h-3.5" />
                      Tích hợp kế hoạch
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-colors border border-red-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa bỏ
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={shareTitle}
        subtitle={shareSubtitle}
        contentToShare={shareText}
      />
    </div>
  );
}
