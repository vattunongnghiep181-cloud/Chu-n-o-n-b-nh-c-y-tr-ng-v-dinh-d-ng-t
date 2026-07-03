import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  Search,
  Sprout,
  Trash2,
  Sliders,
  WifiOff,
  Gauge,
  Sparkles,
  Share2,
  Folder,
  FolderOpen,
  ExternalLink,
  User,
  LogOut,
  Info,
  Lock,
  ChevronDown,
  Check,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PlantDiagnostic } from "../types";
import ShareModal from "./ShareModal";
import {
  initAuth,
  googleSignIn,
  logout,
  searchBVTVFolder,
  listFilesFromFolder,
  fetchFileTextContent,
  DriveFile
} from "../lib/firebase";

export interface CropType {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  diseases: string[];
}

export const LAM_DONG_CROPS: CropType[] = [
  {
    id: "coffee",
    name: "Cà phê (Arabica/Robusta)",
    scientificName: "Coffea",
    description: "Cây trồng chủ lực của cao nguyên Lâm Đồng (Di Linh, Bảo Lộc, Lâm Hà, Cầu Đất).",
    diseases: ["Bệnh rỉ sắt", "Bệnh nấm hồng", "Bệnh khô cành khô quả", "Tuyến trùng hại rễ"]
  },
  {
    id: "durian",
    name: "Sầu riêng (Ri6, Dona)",
    scientificName: "Durio zibethinus",
    description: "Cây ăn trái có giá trị kinh tế cao, vùng trồng lớn tại Đạ Huoai, Đạ Tẻh, Di Linh.",
    diseases: ["Bệnh nứt thân xì mủ (Phytophthora)", "Bệnh cháy lá chết ngọn", "Thối trái"]
  },
  {
    id: "tea",
    name: "Chè / Trà (Oolong, Shan Tuyết)",
    scientificName: "Camellia sinensis",
    description: "Phát triển mạnh tại Bảo Lộc, Bảo Lâm và Cầu Đất (Đà Lạt).",
    diseases: ["Bệnh phồng lá chè", "Bệnh thối búp", "Bệnh đốm nâu", "Rầy xanh hại chè"]
  },
  {
    id: "avocado",
    name: "Bơ (Bơ 034, bơ sáp)",
    scientificName: "Persea americana",
    description: "Cây ăn quả đặc sản thích nghi tốt với thổ nhưỡng đất đỏ bazan Lâm Đồng.",
    diseases: ["Bệnh thối rễ nứt thân", "Bệnh héo rũ chét ngọn", "Bệnh ghẻ trái bơ"]
  },
  {
    id: "vegetable",
    name: "Rau ôn đới (Cà chua, Ớt chuông, Cải bắp)",
    description: "Sản xuất công nghệ cao tại Đà Lạt, Đơn Dương, Đức Trọng.",
    diseases: ["Bệnh mốc sương cà chua", "Bệnh héo xanh vi khuẩn", "Bệnh thối nhũn bắp cải"]
  },
  {
    id: "flower",
    name: "Hoa (Hoa hồng, Hoa cúc, Cát tường)",
    description: "Vùng trồng hoa lớn nhất cả nước, tập trung tại Đà Lạt, Lạc Dương.",
    diseases: ["Bệnh phấn trắng hoa hồng", "Bệnh gỉ sắt hoa cúc", "Bệnh héo vàng do nấm"]
  },
  {
    id: "macadamia",
    name: "Mắc ca (Macadamia)",
    scientificName: "Macadamia",
    description: "Cây lâm nghiệp đa mục đích, trồng xen canh hiệu quả trong vườn cà phê Lâm Đồng.",
    diseases: ["Bệnh hại bông mắc ca", "Bệnh nứt vỏ xì mủ", "Bệnh xám cành"]
  },
  {
    id: "rice",
    name: "Lúa nước",
    scientificName: "Oryza sativa",
    description: "Trồng tại các thung lũng huyện Cát Tiên, Đạ Tẻh, Đơn Dương.",
    diseases: ["Bệnh đạo ôn", "Bệnh bạc lá", "Bệnh lem lép hạt"]
  }
];

// Helpful preset templates for testing
const PRESET_TEMPLATES = [
  {
    id: "coffee-rust",
    title: "Lá Cà Phê bị Rỉ Sắt",
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600",
    desc: "Bệnh rỉ sắt do nấm Hemileia vastatrix hại lá cà phê.",
    mimeType: "image/jpeg"
  },
  {
    id: "rice-blast",
    title: "Lá Lúa bị Đạo Ôn",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600",
    desc: "Bệnh đạo ôn do nấm Magnaporthe oryzae gây hại.",
    mimeType: "image/jpeg"
  },
  {
    id: "tomato-blight",
    title: "Rau màu bị Héo Rũ / Đốm Vàng",
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600",
    desc: "Sương mai hoặc đốm sọc dưa hại rau màu.",
    mimeType: "image/jpeg"
  },
  {
    id: "healthy-coffee",
    title: "Lá Cà Phê Khoẻ Mạnh",
    imageUrl: "https://images.unsplash.com/photo-1507226983735-a838615193b0?auto=format&fit=crop&q=80&w=600",
    desc: "Lá xanh đều, bóng mượt không tì vết bệnh.",
    mimeType: "image/jpeg"
  }
];

export default function TabScan() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlantDiagnostic | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Share modal state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareSubtitle, setShareSubtitle] = useState("");
  const [shareText, setShareText] = useState("");

  const handleShareResult = () => {
    if (!result) return;
    
    const formattedText = `[KẾT QUẢ CHẨN ĐOÁN BỆNH CÂY TRỒNG]
🌱 Loại cây: ${result.plantType}
🏥 Tình trạng: ${result.status}
🔍 Bệnh hại: ${result.diseaseName === "Không có" ? "Cây khỏe mạnh, không phát hiện bệnh" : result.diseaseName}
📊 Độ tin cậy: ${result.confidence}

----------------------------------------
TRIỆU CHỨNG QUAN SÁT:
${result.symptoms}

${result.cause && result.cause !== "Không có" ? `NGUYÊN NHÂN GÂY BỆNH:\n${result.cause}\n` : ""}
HƯỚNG DẪN XỬ LÝ (KHUYẾN NGHỊ VTNN 181):
${result.solutions?.map((sol, i) => `${i + 1}. ${sol}`).join("\n")}

BIỆN PHÁP PHÒNG NGỪA LÂU DÀI:
${result.preventativeMeasures?.map((prev) => `- ${prev}`).join("\n")}
----------------------------------------

-- Chia sẻ từ Sổ tay Nông nghiệp VTNN 181 --`;

    setShareTitle(`Báo cáo chẩn đoán: ${result.diseaseName === "Không có" ? "Cây khỏe" : result.diseaseName}`);
    setShareSubtitle(`Chia sẻ kết quả phân tích bệnh cây ${result.plantType} cho kỹ sư nông nghiệp`);
    setShareText(formattedText);
    setIsShareOpen(true);
  };

  // --- Lâm Đồng Popular Crop selection state ---
  const [selectedCropId, setSelectedCropId] = useState<string>("coffee");

  // --- Google Drive & Auth States ---
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [bvtvFolderId, setBvtvFolderId] = useState<string | null>(null);
  const [isScanningDrive, setIsScanningDrive] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveError, setDriveError] = useState<string | null>(null);
  
  // File used for chẩn đoán context
  const [selectedContextFileId, setSelectedContextFileId] = useState<string | null>(null);
  const [useDocAsContext, setUseDocAsContext] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setDriveError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Lỗi đăng nhập Google:", err);
      setDriveError("Không thể kết nối tài khoản Google. Bác vui lòng thử lại.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
      setBvtvFolderId(null);
      setDriveFiles([]);
      setSelectedContextFileId(null);
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    }
  };

  const handleScanDrive = async (tokenToUse: string) => {
    setIsScanningDrive(true);
    setDriveError(null);
    try {
      const folderId = await searchBVTVFolder(tokenToUse);
      if (folderId) {
        setBvtvFolderId(folderId);
        const files = await listFilesFromFolder(tokenToUse, folderId);
        setDriveFiles(files);
      } else {
        setBvtvFolderId(null);
        setDriveFiles([]);
      }
    } catch (err: any) {
      console.error("Lỗi quét Google Drive:", err);
      const errMessage = err?.message || String(err);
      if (errMessage.includes("403")) {
        setDriveError(
          "Bác chưa cấp quyền truy cập Google Drive hoặc API chưa được kích hoạt xong (Mã lỗi: 403). Bác vui lòng nhấn 'Đăng xuất' ở phía trên, sau đó bấm đăng nhập lại và nhớ TÍCH CHỌN (tick) vào ô 'Xem các tệp Google Drive' trong màn hình xác thực của Google nhé!"
        );
      } else {
        setDriveError("Không thể đồng bộ dữ liệu bảo vệ thực vật từ Drive. Bác hãy kiểm tra kết nối mạng.");
      }
    } finally {
      setIsScanningDrive(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleScanDrive(accessToken);
    }
  }, [accessToken]);

  // Helper function to match files containing crop keywords
  const getRelevantFiles = () => {
    if (!driveFiles || driveFiles.length === 0) return [];
    const currentCrop = LAM_DONG_CROPS.find((c) => c.id === selectedCropId);
    if (!currentCrop) return [];

    let keywords: string[] = [];
    if (selectedCropId === "coffee") {
      keywords = ["ca phe", "cà phê", "coffee", "robusta", "arabica", "ri sat"];
    } else if (selectedCropId === "durian") {
      keywords = ["sau rieng", "sầu riêng", "durian", "ri6", "dona", "phytophthora"];
    } else if (selectedCropId === "tea") {
      keywords = ["che", "chè", "tra", "trà", "oolong", "tea"];
    } else if (selectedCropId === "avocado") {
      keywords = ["bo", "bơ", "avocado", "034"];
    } else if (selectedCropId === "vegetable") {
      keywords = ["rau", "ca chua", "cà chua", "ot", "ớt", "khoai", "bắp cải", "vegetable"];
    } else if (selectedCropId === "flower") {
      keywords = ["hoa", "cuc", "cúc", "hong", "hồng", "flower"];
    } else if (selectedCropId === "macadamia") {
      keywords = ["mac ca", "mắc ca", "macadamia"];
    } else if (selectedCropId === "rice") {
      keywords = ["lua", "lúa", "rice", "dao on"];
    }

    const normalizedKeywords = keywords.map((kw) => kw.toLowerCase());
    return driveFiles.filter((file) => {
      const fileName = file.name.toLowerCase();
      const nameNoTones = fileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedKeywords.some((kw) => {
        const kwNoTones = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return fileName.includes(kw) || nameNoTones.includes(kwNoTones);
      });
    });
  };

  // Set the first relevant file as selected context file automatically when crop changes
  useEffect(() => {
    const relevant = getRelevantFiles();
    if (relevant.length > 0) {
      setSelectedContextFileId(relevant[0].id);
    } else {
      setSelectedContextFileId(null);
    }
  }, [selectedCropId, driveFiles]);

  // Interactive client-side compression states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressionQuality, setCompressionQuality] = useState<number>(0.65);
  const [maxResolution, setMaxResolution] = useState<number>(800);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high" | "custom">("medium");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set remote image URL for the presets directly to avoid client-side CORS fetches
  const handleSelectPreset = async (url: string, mimeType: string) => {
    setError(null);
    setResult(null);
    setSelectedImage(url);
    setImageMimeType(mimeType);
    setOriginalFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
    await handleDiagnose(url, mimeType);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file, compressionQuality, maxResolution);
    }
  };

  // Process file with auto-resizing and compression via Canvas to ensure standard formats & smaller payload
  const processFile = (file: File, quality = compressionQuality, maxRes = maxResolution) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng tải lên một tệp hình ảnh hợp lệ (PNG, JPG, JPEG).");
      return;
    }
    setError(null);
    setResult(null);
    setIsLoading(true);
    setOriginalFile(file);
    setOriginalSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxRes) {
            height *= maxRes / width;
            width = maxRes;
          }
        } else {
          if (height > maxRes) {
            width *= maxRes / height;
            height = maxRes;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed JPEG
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          setSelectedImage(compressedDataUrl);
          setImageMimeType("image/jpeg");
          
          // Calculate compressed size from base64 string length
          const base64Length = compressedDataUrl.split(",")[1].length;
          const sizeInBytes = Math.floor(base64Length * 0.75);
          setCompressedSize(sizeInBytes);
        } else {
          setSelectedImage(event.target?.result as string);
          setImageMimeType(file.type);
          setCompressedSize(file.size);
        }
        setIsLoading(false);
      };
      img.onerror = () => {
        setSelectedImage(event.target?.result as string);
        setImageMimeType(file.type);
        setCompressedSize(file.size);
        setIsLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setError("Không thể đọc tệp tin hình ảnh.");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return "Chưa có";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handlePresetChange = (level: "low" | "medium" | "high") => {
    setCompressionLevel(level);
    let q = 0.85;
    let res = 1024;
    if (level === "low") {
      q = 0.85;
      res = 1200;
    } else if (level === "medium") {
      q = 0.6;
      res = 800;
    } else if (level === "high") {
      q = 0.25;
      res = 500;
    }
    setCompressionQuality(q);
    setMaxResolution(res);
    if (originalFile) {
      processFile(originalFile, q, res);
    }
  };

  const handleCustomQualityChange = (q: number) => {
    setCompressionLevel("custom");
    setCompressionQuality(q);
    if (originalFile) {
      processFile(originalFile, q, maxResolution);
    }
  };

  const handleCustomResolutionChange = (res: number) => {
    setCompressionLevel("custom");
    setMaxResolution(res);
    if (originalFile) {
      processFile(originalFile, compressionQuality, res);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Main API calling function
  const handleDiagnose = async (imageToDiagnose?: any, mime?: any) => {
    const targetImage = (typeof imageToDiagnose === "string") ? imageToDiagnose : selectedImage;
    const targetMime = (typeof mime === "string") ? mime : imageMimeType;

    if (!targetImage || !targetMime) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    const isUrl = targetImage.startsWith("http");
    const pureBase64 = isUrl ? undefined : targetImage.split(",")[1];

    const currentCrop = LAM_DONG_CROPS.find((c) => c.id === selectedCropId);
    const cropName = currentCrop ? currentCrop.name : undefined;

    let customDocContext = "";
    if (accessToken && useDocAsContext && selectedContextFileId) {
      const fileToUse = driveFiles.find((f) => f.id === selectedContextFileId);
      if (fileToUse) {
        try {
          const content = await fetchFileTextContent(accessToken, fileToUse);
          if (content) {
            customDocContext = content;
          }
        } catch (fetchErr) {
          console.error("Lỗi tải nội dung file từ Drive làm ngữ cảnh AI:", fetchErr);
        }
      }
    }

    try {
      const response = await fetch("/api/gemini/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: pureBase64,
          imageUrl: isUrl ? targetImage : undefined,
          mimeType: targetMime,
          cropName,
          customDocContext: customDocContext || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gặp lỗi khi xử lý chẩn đoán.");
      }

      const data = await response.json();
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Kết nối máy chủ thất bại. Bác vui lòng kiểm tra khoá API Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImageMimeType(null);
    setResult(null);
    setError(null);
    setOriginalFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
  };

  const currentCrop = LAM_DONG_CROPS.find((c) => c.id === selectedCropId);
  const relevantFiles = getRelevantFiles();
  const otherFiles = driveFiles.filter(f => !relevantFiles.some(rf => rf.id === f.id));

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-1">
        <span className="text-[11px] uppercase tracking-[0.3em] text-brand-tertiary font-bold">Chẩn đoán bằng AI</span>
        <h2 className="font-display font-light text-3xl md:text-4xl text-brand-primary leading-tight">Chẩn đoán bệnh hại lá</h2>
        <p className="text-xs md:text-sm text-brand-text-variant font-light">
          Chụp ảnh cận cảnh vết bệnh trên lá hoặc tải hình ảnh lên để phân tích bằng Trí tuệ Nhân tạo (AI).
        </p>
      </div>

      {/* SECTION 1: CROP SELECTOR (LÂM ĐỒNG CROPS) */}
      <div className="glass p-5 rounded-3xl border border-brand-high bg-brand-surface-dim/30 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-brand-primary">Chọn loại cây cần quét bệnh</h3>
            <p className="text-[10px] text-brand-text-variant font-light">Hỗ trợ các loại cây trồng chủ lực, đặc sản tỉnh Lâm Đồng</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-brand-surface border border-brand-high text-brand-text focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer font-bold text-xs md:text-sm shadow-sm"
            >
              {LAM_DONG_CROPS.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  🌱 {crop.name} {crop.scientificName ? `(${crop.scientificName})` : ""}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-brand-text-variant">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {currentCrop && (
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl p-4 space-y-2.5">
              <div className="text-xs text-brand-text leading-relaxed font-light">
                <span className="font-bold text-brand-primary">{currentCrop.name}</span>: {currentCrop.description}
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[9px] font-bold uppercase tracking-wide text-brand-text-variant mr-1">Bệnh phổ biến:</span>
                {currentCrop.diseases.map((dis, idx) => (
                  <span key={idx} className="text-[10px] bg-brand-surface dark:bg-brand-surface-dim border border-brand-high/80 px-2 py-0.5 rounded-lg text-brand-text-variant font-medium">
                    {dis}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Upload / Viewer Container */}
      <div className="glass p-4.5 rounded-3xl shadow-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-brand-surface to-emerald-500/10 dark:from-emerald-500/5 dark:to-emerald-500/15">
        {!selectedImage ? (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer p-6 transition-all ${
              dragActive 
                ? "border-brand-primary bg-brand-primary/5" 
                : "border-brand-primary/10 hover:border-brand-primary/25 hover:bg-brand-primary/3"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="bg-brand-primary/5 p-4 rounded-full text-brand-primary border border-brand-primary/10">
              <Camera className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-brand-text uppercase tracking-wider">Bấm để Chụp hoặc Tải ảnh lên</p>
              <p className="text-xs text-brand-text-variant font-light">Kéo thả hình ảnh lá cây bị bệnh hại</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-brand-surface-dim max-h-80 border border-brand-high flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Lá cây cần chẩn đoán" 
                className="max-h-80 w-auto object-contain"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-brand-surface/85 flex flex-col items-center justify-center gap-4 backdrop-blur-xs">
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 border-2 border-brand-primary/10 border-t-brand-tertiary rounded-full animate-spin"></div>
                    <Sprout className="w-5 h-5 text-brand-tertiary absolute animate-bounce" />
                  </div>
                  {/* Scanning beam effect */}
                  <div className="absolute left-0 right-0 h-0.5 bg-brand-tertiary/50 animate-pulse shadow-lg" style={{ top: "50%" }}></div>
                  <p className="text-xs font-semibold tracking-wider text-brand-primary uppercase bg-white border border-brand-high px-4 py-1.5 rounded-full shadow-sm">
                    AI đang phân tích vết bệnh...
                  </p>
                </div>
              )}
              
              {!isLoading && (
                <button 
                  onClick={handleClear}
                  className="absolute top-3 right-3 bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-full transition-colors shadow-md border border-red-200 cursor-pointer"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Smart Image Compression Info Panel */}
            {originalFile && originalSize !== null && compressedSize !== null && (
              <div className="bg-teal-500/5 dark:bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="font-display font-bold text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <WifiOff className="w-3.5 h-3.5" /> Nén ảnh Tiết kiệm Băng thông
                    </h4>
                    <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-medium leading-none">Giảm tải truyền tải dữ liệu qua sóng 3G/4G chập chờn</p>
                  </div>
                  {originalSize > compressedSize && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Giảm {Math.round(((originalSize - compressedSize) / originalSize) * 100)}% dung lượng
                    </span>
                  )}
                </div>

                {/* Size Comparison Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="bg-brand-surface/40 dark:bg-brand-surface-dim/40 border border-teal-500/15 p-2 rounded-xl text-left">
                    <span className="text-[9px] font-bold text-teal-600/80 dark:text-teal-400/80 uppercase block">Dung lượng gốc:</span>
                    <span className="font-bold text-brand-text font-mono text-[11px]">{formatSize(originalSize)}</span>
                  </div>
                  <div className="bg-brand-surface/40 dark:bg-brand-surface-dim/40 border border-teal-500/15 p-2 rounded-xl text-left">
                    <span className="text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase block">Dung lượng gửi đi:</span>
                    <span className="font-bold text-brand-primary font-mono text-[11px]">{formatSize(compressedSize)}</span>
                  </div>
                </div>

                {/* Level Presets */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-brand-text-variant uppercase block">Chọn mức độ nén ảnh trước khi gửi:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePresetChange("low")}
                      id="btn-compress-preset-low"
                      className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        compressionLevel === "low"
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                          : "bg-brand-surface border-brand-high text-brand-text hover:bg-brand-surface-dim"
                      }`}
                    >
                      Ảnh nét (85%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetChange("medium")}
                      id="btn-compress-preset-medium"
                      className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        compressionLevel === "medium"
                          ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                          : "bg-brand-surface border-brand-high text-brand-text hover:bg-brand-surface-dim"
                      }`}
                    >
                      Cân bằng (60%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetChange("high")}
                      id="btn-compress-preset-high"
                      className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        compressionLevel === "high"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-brand-surface border-brand-high text-brand-text hover:bg-brand-surface-dim"
                      }`}
                    >
                      Mạng cực yếu (25%)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCompressionLevel("custom");
                      }}
                      id="btn-compress-preset-custom"
                      className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        compressionLevel === "custom"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-brand-surface border-brand-high text-brand-text hover:bg-brand-surface-dim"
                      }`}
                    >
                      Tự tùy chỉnh
                    </button>
                  </div>
                </div>

                {/* Custom Sliders Panel */}
                {compressionLevel === "custom" && (
                  <div className="p-3 bg-brand-surface border border-brand-high rounded-xl space-y-3">
                    {/* Custom JPEG Quality factor slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-brand-text flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-brand-primary" /> Hệ số chất lượng JPEG:
                        </span>
                        <span className="text-brand-primary font-mono">{Math.round(compressionQuality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.95"
                        step="0.05"
                        value={compressionQuality}
                        onChange={(e) => handleCustomQualityChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-brand-high rounded appearance-none cursor-pointer accent-brand-primary"
                      />
                    </div>

                    {/* Custom Image Resolution constraint slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-brand-text flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-brand-primary" /> Độ rộng ảnh tối đa:
                        </span>
                        <span className="text-brand-primary font-mono">{maxResolution}px</span>
                      </div>
                      <input
                        type="range"
                        min="400"
                        max="1600"
                        step="50"
                        value={maxResolution}
                        onChange={(e) => handleCustomResolutionChange(parseInt(e.target.value))}
                        className="w-full h-1 bg-brand-high rounded appearance-none cursor-pointer accent-brand-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            {!isLoading && !result && (
              <button
                onClick={handleDiagnose}
                className="w-full bg-brand-primary hover:bg-brand-primary-light text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-wider cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Bắt đầu chẩn đoán bằng AI
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preset template cards for testing */}
      {!selectedImage && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm tracking-wide text-brand-primary">Thử nhanh ảnh mẫu có sẵn:</h3>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_TEMPLATES.map((preset) => (
              <div 
                key={preset.id}
                onClick={() => handleSelectPreset(preset.imageUrl, preset.mimeType)}
                className="glass hover:bg-brand-primary/5 p-2.5 rounded-2xl cursor-pointer transition-all text-left flex gap-3 group active:scale-98 border border-brand-high"
              >
                <img 
                  src={preset.imageUrl} 
                  alt={preset.title}
                  className="w-12 h-12 object-cover rounded-xl border border-brand-high flex-shrink-0"
                />
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="font-display font-bold text-xs text-brand-text group-hover:text-brand-tertiary transition-colors truncate">
                    {preset.title}
                  </h4>
                  <p className="text-[10px] text-brand-text-variant line-clamp-2 leading-tight font-light">
                    {preset.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="bg-brand-tertiary/10 border border-brand-tertiary/30 text-brand-tertiary p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-tertiary" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">Chẩn đoán không thành công</p>
            <p className="text-xs font-light">{error}</p>
          </div>
        </div>
      )}

      {/* Diagnose Results Container */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-brand-surface to-emerald-500/10 dark:from-emerald-500/5 dark:to-emerald-500/15 shadow-xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className={`p-5 text-brand-text flex justify-between items-center ${
            result.status.toLowerCase().includes("bệnh") || result.diseaseName !== "Không có"
              ? "bg-brand-tertiary/10 border-b border-brand-tertiary/20"
              : "bg-brand-primary/5 border-b border-brand-primary/10"
          }`}>
            <div className="space-y-1">
              <span className={`text-[9px] border px-3 py-1 rounded-full font-bold uppercase tracking-widest ${
                result.status.toLowerCase().includes("bệnh") || result.diseaseName !== "Không có"
                  ? "bg-brand-tertiary/5 border-brand-tertiary/20 text-brand-tertiary"
                  : "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
              }`}>
                Kết quả phân tích từ AI
              </span>
              <h3 className="font-display font-bold text-2xl tracking-wide text-brand-primary">{result.diseaseName === "Không có" ? "Cây Khỏe Mạnh" : result.diseaseName}</h3>
            </div>
            {result.diseaseName === "Không có" ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-brand-tertiary animate-pulse" />
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Quick Metadata Box */}
            <div className="grid grid-cols-3 gap-3 bg-brand-primary/5 p-3.5 rounded-2xl border border-brand-primary/10">
              <div className="text-center border-r border-brand-primary/10">
                <p className="text-[10px] text-brand-text-variant font-medium uppercase tracking-wider">LOẠI CÂY</p>
                <p className="text-xs font-bold text-brand-text mt-1">{result.plantType}</p>
              </div>
              <div className="text-center border-r border-brand-primary/10">
                <p className="text-[10px] text-brand-text-variant font-medium uppercase tracking-wider">TÌNH TRẠNG</p>
                <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${
                  result.status.toLowerCase().includes("khỏe") ? "text-emerald-600" : "text-brand-tertiary"
                }`}>{result.status}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-brand-text-variant font-medium uppercase tracking-wider">ĐỘ CHÍNH XÁC</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">{result.confidence}</p>
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-1.5">
              <h4 className="font-display font-bold text-sm text-brand-primary uppercase tracking-wider">Triệu chứng quan sát:</h4>
              <p className="text-xs md:text-sm leading-relaxed text-brand-text bg-indigo-500/5 dark:bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/15 font-light">
                {result.symptoms}
              </p>
            </div>

            {/* Cause */}
            {result.cause && result.cause !== "Không có" && (
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-sm text-brand-primary uppercase tracking-wider">Nguyên nhân:</h4>
                <p className="text-xs md:text-sm leading-relaxed text-brand-text bg-amber-500/5 dark:bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/15 font-light">
                  {result.cause}
                </p>
              </div>
            )}

            {/* Solutions List */}
            {result.solutions && result.solutions.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="font-display font-bold text-sm text-brand-primary uppercase tracking-wider">Hướng dẫn xử lý:</h4>
                <div className="space-y-2">
                  {result.solutions.map((sol, index) => (
                    <div key={index} className="flex gap-3 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/15 items-start">
                      <span className="bg-emerald-500/10 text-emerald-600 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                        {index + 1}
                      </span>
                      <p className="text-xs md:text-sm text-brand-text font-light leading-relaxed">{sol}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preventative Measures List */}
            {result.preventativeMeasures && result.preventativeMeasures.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="font-display font-bold text-sm text-brand-primary uppercase tracking-wider">Phòng ngừa lâu dài:</h4>
                <div className="space-y-2">
                  {result.preventativeMeasures.map((prev, index) => (
                    <div key={index} className="flex gap-3 bg-teal-500/5 dark:bg-teal-500/10 p-3 rounded-xl border border-teal-500/15 items-start">
                      <span className="bg-teal-500/10 text-teal-600 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-500/20">
                        ✓
                      </span>
                      <p className="text-xs md:text-sm text-brand-text-variant leading-relaxed font-light">{prev}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              <button
                onClick={handleShareResult}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm hover:shadow-emerald-500/10"
              >
                <Share2 className="w-4 h-4" />
                Chia sẻ kết quả Zalo
              </button>

              <button
                onClick={handleClear}
                className="w-full bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-brand-primary/10 cursor-pointer text-xs uppercase tracking-wider"
              >
                <RefreshCw className="w-4 h-4" />
                Chẩn đoán ảnh khác
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
