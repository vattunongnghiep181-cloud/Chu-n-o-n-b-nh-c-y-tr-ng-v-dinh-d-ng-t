import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  Droplets, 
  Compass, 
  CheckCircle2, 
  Activity, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Thermometer,
  Play,
  Pause,
  HeartPulse,
  RefreshCw,
  Sparkles,
  Calculator,
  HelpCircle,
  Leaf,
  Calendar,
  Gauge
} from "lucide-react";
import { motion } from "motion/react";
import { SoilAnalysis } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  Line,
  Legend
} from "recharts";

const SOIL_TYPES = [
  "Đất đỏ bazan (Lâm Đồng, Tây Nguyên)",
  "Đất thịt phù sa (Đồng bằng sông Hồng/Cửu Long)",
  "Đất phèn / Đất chua",
  "Đất cát pha / Đất nghèo hữu cơ"
];

// Preset soil profiles for easy one-click loading
const PRESET_SOIL_PROFILES = [
  {
    name: "Đất đỏ Bazan trồng cà phê (Hơi Chua)",
    type: "Đất đỏ bazan (Lâm Đồng, Tây Nguyên)",
    pH: 4.8,
    moisture: 55,
    N: 80,
    P: 35,
    K: 120
  },
  {
    name: "Đất vườn rau màu màu mỡ",
    type: "Đất thịt phù sa (Đồng bằng sông Hồng/Cửu Long)",
    pH: 6.2,
    moisture: 72,
    N: 180,
    P: 65,
    K: 210
  }
];

export default function TabSoil() {
  const [pH, setPH] = useState<number>(5.8);
  const [moisture, setMoisture] = useState<number>(60);
  const [N, setN] = useState<number>(110);
  const [P, setP] = useState<number>(45);
  const [K, setK] = useState<number>(140);
  const [soilType, setSoilType] = useState<string>(SOIL_TYPES[0]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SoilAnalysis | null>(null);

  // States for dynamic AI fertilizer suggestion based on NPK
  const [fertilizerCrop, setFertilizerCrop] = useState<string>("Cà phê Robusta (Tây Nguyên)");
  const [fertilizerNotes, setFertilizerNotes] = useState<string>("");
  const [fertilizerResult, setFertilizerResult] = useState<{
    cropType: string;
    soilStatusBrief: string;
    fertilizerPlan: Array<{
      name: string;
      dosage: string;
      timing: string;
      method: string;
    }>;
    agronomistAdvice: string;
  } | null>(null);
  const [fertilizerLoading, setFertilizerLoading] = useState<boolean>(false);
  const [fertilizerError, setFertilizerError] = useState<string | null>(null);

  // Ambient temperature & simulated live sensors
  const [ambientTemp, setAmbientTemp] = useState<number>(27);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  // Historical NPK levels tracking for Recharts trend representation
  const [historyData, setHistoryData] = useState([
    { name: "T2/2026", N: 85, P: 32, K: 115, pH: 4.6 },
    { name: "T3/2026", N: 98, P: 38, K: 122, pH: 4.9 },
    { name: "T4/2026", N: 115, P: 42, K: 135, pH: 5.3 },
    { name: "T5/2026", N: 130, P: 48, K: 145, pH: 5.6 },
    { name: "T6/2026", N: 110, P: 45, K: 140, pH: 5.8 }
  ]);

  // Real-time sensor correlation timeline state
  const [realtimeData, setRealtimeData] = useState([
    { name: "08:10:00", moisture: 58, temp: 22, health: 85 },
    { name: "08:10:03", moisture: 60, temp: 23, health: 87 },
    { name: "08:10:06", moisture: 64, temp: 24, health: 90 },
    { name: "08:10:09", moisture: 62, temp: 25, health: 89 },
    { name: "08:10:12", moisture: 61, temp: 25, health: 88 }
  ]);

  // Agronomic mathematical model for calculating crop health index (%)
  const calculatePlantHealth = (m: number, t: number, p: number): number => {
    let health = 100;
    
    // Soil moisture penalty: Optimal is 55% - 75%
    if (m < 55) {
      health -= (55 - m) * 1.5;
    } else if (m > 75) {
      health -= (m - 75) * 1.6;
    }
    
    // Ambient temperature penalty: Optimal is 20°C - 28°C
    if (t < 20) {
      health -= (20 - t) * 2.5;
    } else if (t > 28) {
      health -= (t - 28) * 3;
    }
    
    // pH penalty: Optimal is 5.5 - 6.8
    if (p < 5.5) {
      health -= (5.5 - p) * 16;
    } else if (p > 6.8) {
      health -= (p - 6.8) * 14;
    }
    
    return Math.max(10, Math.min(100, Math.round(health)));
  };

  const currentPlantHealth = calculatePlantHealth(moisture, ambientTemp, pH);

  // Interval for real-time live sensor telemetry simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 1. Gently drift soil moisture (-2 to +2 %)
      setMoisture(prev => {
        const drift = Math.floor(Math.random() * 5) - 2;
        return Math.max(15, Math.min(95, prev + drift));
      });

      // 2. Gently drift ambient temperature (-1 to +1 °C)
      setAmbientTemp(prev => {
        const drift = Math.floor(Math.random() * 3) - 1;
        return Math.max(16, Math.min(38, prev + drift));
      });

      // 3. Append the newly calculated correlation values
      setRealtimeData(prev => {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        
        // Use functional local updates to avoid stale state references in setInterval closure
        const nextMoisture = Math.max(15, Math.min(95, moisture + (Math.floor(Math.random() * 5) - 2)));
        const nextTemp = Math.max(16, Math.min(38, ambientTemp + (Math.floor(Math.random() * 3) - 1)));
        const computedHealth = calculatePlantHealth(nextMoisture, nextTemp, pH);

        const newReading = {
          name: timeLabel,
          moisture: nextMoisture,
          temp: nextTemp,
          health: computedHealth
        };

        // Keep a rolling window of 6 data points
        return [...prev.slice(1), newReading];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, moisture, ambientTemp, pH]);

  const handlePresetLoad = (profile: typeof PRESET_SOIL_PROFILES[0]) => {
    setPH(profile.pH);
    setMoisture(profile.moisture);
    setN(profile.N);
    setP(profile.P);
    setK(profile.K);
    setSoilType(profile.type);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/soil/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pH,
          moisture,
          N,
          P,
          K,
          soilType,
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi máy chủ khi phân tích chỉ số đất.");
      }

      const data = await response.json();
      setAnalysisResult({
        pH,
        moisture,
        N,
        P,
        K,
        soilType,
        suitability: data.suitability,
        status: data.status,
        recommendations: data.recommendations,
      });
    } catch (e: any) {
      console.error(e);
      setError("Không thể tải kết quả phân tích. Đã dùng thuật toán phân tích nội bộ ngoại tuyến.");
      
      // Standalone client-side diagnosis as backup
      setTimeout(() => {
        let suitability = "Đất canh tác khá ổn định";
        let status = "Độ chua và độ ẩm trung bình. Cần tăng cường mùn hữu cơ.";
        let recommendations = [
          "Bón lót phân chuồng hoai mục kết hợp nấm Trichoderma để kích hoạt vi sinh vật có lợi.",
          "Duy trì tưới tiêu định kỳ, tránh để mặt đất bị khô nứt làm tổn thương rễ tơ.",
          "Ủ rơm rạ hoặc cỏ khô quanh gốc cà phê và hoa màu để giữ ẩm đất đai cực kỳ tốt."
        ];

        if (pH < 5.0) {
          suitability = "Đất chua nặng (Tính axit cao)";
          status = "Làm ức chế rễ hút chất dinh dưỡng, nghẹt rễ và dễ gây thối rễ.";
          recommendations = [
            "Bón bổ sung vôi bột hoặc vôi nông nghiệp rải khắp vườn.",
            "Tuyệt đối không lạm dụng phân đạm hóa học (như Urê, SA) làm đất thêm chua.",
            "Tưới ẩm đều đặn sau khi bón vôi để hạ phèn nhanh."
          ];
        } else if (pH > 7.2) {
          suitability = "Đất kiềm hóa nhẹ";
          status = "Cản trở hấp thụ sắt, kẽm, mangan làm lá chuyển sang màu vàng nhạt.";
          recommendations = [
            "Bón phân lưu huỳnh bột hoặc phân hữu cơ chua để trung hòa đất.",
            "Phun bổ sung vi lượng qua lá để cây trồng hấp thụ trực tiếp dinh dưỡng bị thiếu hụt."
          ];
        }

        setAnalysisResult({
          pH,
          moisture,
          N,
          P,
          K,
          soilType,
          suitability,
          status,
          recommendations
        });
        setIsLoading(false);
      }, 800);
    } finally {
      if (!error) {
        setIsLoading(false);
      }
    }
  };

  const handleGetFertilizerSuggestion = async () => {
    setFertilizerLoading(true);
    setFertilizerError(null);
    setFertilizerResult(null);

    try {
      const response = await fetch("/api/soil/fertilizer-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pH,
          moisture,
          N,
          P,
          K,
          soilType,
          cropType: fertilizerCrop,
          additionalNotes: fertilizerNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi kết nối đến dịch vụ phân tích phân bón.");
      }

      const data = await response.json();
      setFertilizerResult(data);
    } catch (err: any) {
      console.error(err);
      setFertilizerError(err.message || "Có lỗi xảy ra khi lấy khuyến nghị từ Trợ lý AI. Vui lòng thử lại sau.");
    } finally {
      setFertilizerLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-1">
        <span className="text-[11px] uppercase tracking-[0.3em] text-brand-tertiary font-bold">Quản lý đất đai</span>
        <h2 className="font-display font-light text-3xl md:text-4xl text-brand-primary leading-tight">Kiểm tra đất trồng</h2>
        <p className="text-xs md:text-sm text-brand-text-variant font-light">
          Nhập các thông số đất đo được (hoặc dùng đầu dò cảm biến nông nghiệp) để nhận khuyến nghị cải tạo đất sinh học từ chuyên gia AI.
        </p>
      </div>

      {/* Preset Soil profiles selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-brand-text-variant uppercase tracking-widest block">Chọn nhanh thông số mẫu:</span>
        <div className="grid grid-cols-2 gap-2.5">
          {PRESET_SOIL_PROFILES.map((profile, i) => (
            <button
              key={i}
              onClick={() => handlePresetLoad(profile)}
              className="glass hover:bg-brand-primary/5 p-3 rounded-2xl text-left text-xs font-bold text-brand-text-variant hover:text-brand-primary hover:border-brand-primary/30 transition-all active:scale-98 cursor-pointer border border-brand-high"
            >
              📊 {profile.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Card */}
      <div className="glass p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-brand-surface to-amber-500/10 dark:from-amber-500/5 dark:to-amber-500/15 shadow-xl space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-variant">Loại đất đai chính của vườn:</label>
          <select 
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full bg-brand-low border border-brand-high p-3.5 rounded-xl text-sm font-medium text-brand-text focus:border-brand-primary focus:ring-0 outline-none"
          >
            {SOIL_TYPES.map((type, i) => (
              <option key={i} value={type} className="bg-white text-brand-text">{type}</option>
            ))}
          </select>
        </div>

        {/* pH slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              🧪 Độ chua của đất (pH)
            </span>
            <span className={`font-bold px-2.5 py-0.5 rounded-md border ${
              pH < 5.5 
                ? "bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20" 
                : pH <= 6.8 
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" 
                  : "bg-blue-500/10 text-blue-700 border-blue-500/20"
            }`}>
              {pH.toFixed(1)}
            </span>
          </div>
          <input 
            type="range" 
            min="3.5" 
            max="8.5" 
            step="0.1" 
            value={pH} 
            onChange={(e) => setPH(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-brand-primary/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex justify-between text-[10px] text-brand-text-variant font-semibold uppercase tracking-wider">
            <span>3.5 (Axit/Chua)</span>
            <span className="text-brand-primary font-bold">6.0 (Lý Tưởng)</span>
            <span>8.5 (Kiềm Cao)</span>
          </div>
        </div>

        {/* Moisture Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500" /> Độ ẩm đất (%)
            </span>
            <span className="font-bold bg-sky-500/10 text-sky-700 border border-sky-500/20 px-2.5 py-0.5 rounded-md">
              {moisture}%
            </span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            step="1" 
            value={moisture} 
            onChange={(e) => setMoisture(parseInt(e.target.value))}
            className="w-full h-1.5 bg-brand-primary/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex justify-between text-[10px] text-brand-text-variant font-semibold uppercase tracking-wider">
            <span>10% (Rất Khô)</span>
            <span className="text-sky-600">65% - 75% (Tốt Nhất)</span>
            <span>100% (Úng)</span>
          </div>
        </div>

        {/* N-P-K Dinh dưỡng inputs */}
        <div className="space-y-3 pt-3 border-t border-brand-high">
          <h4 className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest text-center">
            Chỉ số dinh dưỡng N - P - K (ppm)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/15 text-center space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">N (Đạm)</span>
              <input 
                type="number" 
                value={N}
                onChange={(e) => setN(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center bg-white border border-brand-high text-brand-text rounded-lg p-1.5 font-bold text-sm outline-none focus:border-brand-primary transition-all"
              />
              <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Chuẩn: 150</span>
            </div>
            <div className="bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-2xl border border-amber-500/15 text-center space-y-1">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">P (Lân)</span>
              <input 
                type="number" 
                value={P}
                onChange={(e) => setP(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center bg-white border border-brand-high text-brand-text rounded-lg p-1.5 font-bold text-sm outline-none focus:border-brand-primary transition-all"
              />
              <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 font-medium">Chuẩn: 50</span>
            </div>
            <div className="bg-sky-500/5 dark:bg-sky-500/10 p-3 rounded-2xl border border-sky-500/15 text-center space-y-1">
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">K (Kali)</span>
              <input 
                type="number" 
                value={K}
                onChange={(e) => setK(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center bg-white border border-brand-high text-brand-text rounded-lg p-1.5 font-bold text-sm outline-none focus:border-brand-primary transition-all"
              />
              <span className="text-[9px] text-sky-600/80 dark:text-sky-400/80 font-medium">Chuẩn: 200</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full bg-brand-primary hover:bg-brand-primary-light text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-wider disabled:opacity-55 active:scale-98 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Hệ thống đang phân tích...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Bắt đầu kiểm tra đất
            </>
          )}
        </button>
      </div>

      {/* Real-time Interactive Sensor Correlation Chart */}
      <div className="glass p-5 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-brand-surface to-sky-500/10 dark:from-sky-500/5 dark:to-sky-500/15 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-brand-high">
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-lg text-brand-primary flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-500 animate-pulse" /> Tương quan Sinh học Thời gian thực
            </h3>
            <p className="text-[10px] text-brand-text-variant font-light leading-snug">
              Phân tích tương quan trực tiếp giữa Độ ẩm đất, Nhiệt độ môi trường và Sức khỏe cây trồng
            </p>
          </div>

          {/* Toggle play/pause simulation */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            id="btn-toggle-telemetry-sim"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSimulating
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 animate-pulse"
                : "bg-brand-low text-brand-primary border border-brand-high hover:bg-brand-surface-dim"
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Dừng Mô phỏng Cảm biến
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Mô phỏng Trực tiếp (3s)
              </>
            )}
          </button>
        </div>

        {/* Real-time control dials / sliders for testing correlation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-surface-dim/40 p-4 rounded-2xl border border-brand-high">
          {/* Soil Moisture quick slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> Ẩm độ đất thử nghiệm:
              </span>
              <span className="font-semibold text-sky-600 font-mono text-[11px] bg-sky-50 dark:bg-sky-950/20 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-900/30">
                {moisture}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={moisture}
              onChange={(e) => {
                const newM = parseInt(e.target.value);
                setMoisture(newM);
                // Push immediately to the rolling graph for immediate visual feedback
                setRealtimeData(prev => {
                  const now = new Date();
                  const timeLabel = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  const newHealth = calculatePlantHealth(newM, ambientTemp, pH);
                  return [...prev.slice(1), { name: timeLabel, moisture: newM, temp: ambientTemp, health: newHealth }];
                });
              }}
              className="w-full h-1 bg-sky-200 dark:bg-sky-900 rounded appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Ambient Temp slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-brand-text flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" /> Nhiệt độ môi trường:
              </span>
              <span className="font-semibold text-rose-500 font-mono text-[11px] bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/30">
                {ambientTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={ambientTemp}
              onChange={(e) => {
                const newT = parseInt(e.target.value);
                setAmbientTemp(newT);
                // Push immediately to the rolling graph for immediate visual feedback
                setRealtimeData(prev => {
                  const now = new Date();
                  const timeLabel = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  const newHealth = calculatePlantHealth(moisture, newT, pH);
                  return [...prev.slice(1), { name: timeLabel, moisture, temp: newT, health: newHealth }];
                });
              }}
              className="w-full h-1 bg-rose-200 dark:bg-rose-900 rounded appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Live Status Indicators with Circular gauges or bars */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-brand-surface border border-brand-high p-3 rounded-2xl text-center space-y-1">
            <span className="text-[9px] font-bold text-brand-text-variant uppercase block">Độ ẩm đất</span>
            <span className="text-sm font-bold text-sky-600 block">{moisture}%</span>
            <span className={`text-[8px] font-bold inline-block px-1.5 py-0.5 rounded ${
              moisture < 45 ? "bg-amber-100 text-amber-800" : moisture <= 78 ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
            }`}>
              {moisture < 45 ? "Hạn hạn" : moisture <= 78 ? "Đủ ẩm" : "Úng nước"}
            </span>
          </div>

          <div className="bg-brand-surface border border-brand-high p-3 rounded-2xl text-center space-y-1">
            <span className="text-[9px] font-bold text-brand-text-variant uppercase block">Nhiệt độ khí</span>
            <span className="text-sm font-bold text-rose-500 block">{ambientTemp}°C</span>
            <span className={`text-[8px] font-bold inline-block px-1.5 py-0.5 rounded ${
              ambientTemp < 18 ? "bg-indigo-100 text-indigo-800" : ambientTemp <= 29 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}>
              {ambientTemp < 18 ? "Lạnh giá" : ambientTemp <= 29 ? "Mát mẻ" : "Nóng bức"}
            </span>
          </div>

          <div className="bg-brand-surface border border-brand-high p-3 rounded-2xl text-center space-y-1">
            <span className="text-[9px] font-bold text-brand-text-variant uppercase block">Sức khỏe cây</span>
            <span className="text-sm font-bold text-emerald-500 block">{currentPlantHealth}%</span>
            <span className={`text-[8px] font-bold inline-block px-1.5 py-0.5 rounded ${
              currentPlantHealth < 60 ? "bg-red-100 text-red-800" : currentPlantHealth <= 82 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {currentPlantHealth < 60 ? "Cực nguy" : currentPlantHealth <= 82 ? "Trung bình" : "Khỏe mạnh"}
            </span>
          </div>
        </div>

        {/* Real-time Multi-Axis Composed Correlation Chart */}
        <div className="w-full h-64 text-xs font-medium">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={realtimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f1eb" />
              <XAxis dataKey="name" stroke="#7c7667" fontSize={9} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#7c7667" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--brand-surface-bright)",
                  borderColor: "var(--brand-high)",
                  borderRadius: "16px",
                  fontSize: "11px",
                  color: "var(--brand-text)"
                }}
              />
              <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              
              {/* Soil Moisture Area */}
              <Area 
                type="monotone" 
                dataKey="moisture" 
                fill="#0ea5e9" 
                stroke="#0ea5e9" 
                strokeWidth={1.5} 
                fillOpacity={0.12} 
                name="Độ ẩm đất (%)" 
              />
              
              {/* Ambient Temperature Line (dashed) */}
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#f43f5e" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                name="Nhiệt độ (°C)" 
                dot={{ r: 3 }}
              />
              
              {/* Plant Health Line (Main Glowing Thick Line) */}
              <Line 
                type="monotone" 
                dataKey="health" 
                stroke="#10b981" 
                strokeWidth={3} 
                name="Sức khỏe cây (%)" 
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Dynamic Agricultural Warning Box based on Live values */}
        {(() => {
          let advice = {
            title: "Tình trạng ổn định",
            text: "Cây trồng đang trong vùng khí hậu và đất đai hoàn hảo. Hãy duy trì lịch bón phân hữu cơ định kỳ hằng tháng.",
            colorClass: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          };

          if (currentPlantHealth < 60) {
            if (moisture < 45) {
              advice = {
                title: "BÁO ĐỘNG: Khô hạn nghiêm trọng!",
                text: "Độ ẩm đất sụt giảm quá thấp làm bộ rễ héo khô, mất sức căng bề mặt để hút dinh dưỡng Kali và Lân. Hãy tiến hành tưới nhỏ giọt khẩn cấp.",
                colorClass: "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400"
              };
            } else if (moisture > 80) {
              advice = {
                title: "BÁO ĐỘNG: Ngập úng, thối rễ tơ!",
                text: "Vườn đang bị giữ nước thừa độ ẩm quá lâu. Ô-xy bị ép ra khỏi đất làm rễ ngạt. Đề nghị khơi thông ngay rãnh thoát lũ xung quanh gốc.",
                colorClass: "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400"
              };
            } else if (ambientTemp > 32) {
              advice = {
                title: "BÁO ĐỘNG: Stress nhiệt cao độ!",
                text: "Nhiệt độ ngoài trời vượt mức chịu đựng của chồi non. Phun sương bù mát ẩm không khí vào ban trưa hoặc rải rơm khô giữ chân đất.",
                colorClass: "bg-orange-500/5 border-orange-500/20 text-orange-700 dark:text-orange-400"
              };
            }
          } else if (currentPlantHealth <= 82) {
            advice = {
              title: "Cảnh báo căng thẳng nhẹ",
              text: "Biến động thời tiết nhẹ đang làm giảm nhẹ quang hợp của cây. Nên tưới giữ ẩm bổ sung axit humic kích rễ.",
              colorClass: "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
            };
          }

          return (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 transition-all ${advice.colorClass}`}>
              <h4 className="font-bold uppercase tracking-wider">{advice.title}</h4>
              <p className="font-light">{advice.text}</p>
            </div>
          );
        })()}

        {/* Live Manual Data push action */}
        <div className="flex justify-between items-center text-[10px] text-brand-text-variant font-medium pt-1 border-t border-brand-high">
          <span>Tự động cập nhật: <span className="font-bold text-brand-primary">{isSimulating ? "Đang bật" : "Đã tắt"}</span></span>
          <button
            onClick={() => {
              const now = new Date();
              const timeLabel = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              setRealtimeData(prev => [
                ...prev.slice(1), 
                { name: timeLabel, moisture, temp: ambientTemp, health: currentPlantHealth }
              ]);
            }}
            id="btn-manual-sensor-read"
            className="flex items-center gap-1 hover:text-brand-primary font-bold cursor-pointer transition-all uppercase tracking-wider"
          >
            <RefreshCw className="w-3 h-3" /> Đo nhanh chỉ số hiện tại
          </button>
        </div>
      </div>

      {/* NPK Trend Chart Card */}
      <div className="glass p-5 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-brand-surface to-indigo-500/10 dark:from-indigo-500/5 dark:to-indigo-500/15 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-brand-high">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="font-display font-bold text-lg text-brand-primary">Lịch sử & Xu hướng NPK</h3>
              <p className="text-[10px] text-brand-text-variant font-light">
                Theo dõi và phân tích biến động dinh dưỡng đất qua các tháng vụ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-brand-primary/5 px-2.5 py-1 rounded-xl border border-brand-high">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-[10px] font-bold text-brand-text-variant mr-1.5">N</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span className="text-[10px] font-bold text-brand-text-variant mr-1.5">P</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-[10px] font-bold text-brand-text-variant">K</span>
          </div>
        </div>

        <div className="w-full h-64 text-xs font-medium">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorN" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f1eb" />
              <XAxis dataKey="name" stroke="#7c7667" fontSize={10} tickLine={false} />
              <YAxis stroke="#7c7667" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#fbfaf7", 
                  borderColor: "#f3f1eb", 
                  borderRadius: "16px",
                  fontSize: "11px",
                  color: "#272520",
                  fontFamily: "Arial, sans-serif"
                }} 
              />
              <Area type="monotone" dataKey="N" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorN)" name="Đạm (N)" />
              <Area type="monotone" dataKey="P" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorP)" name="Lân (P)" />
              <Area type="monotone" dataKey="K" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorK)" name="Kali (K)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Option to record current values */}
        <div className="flex flex-col sm:flex-row gap-3 items-center bg-brand-surface-dim p-4 rounded-2xl border border-brand-high justify-between">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold text-brand-text-variant uppercase block tracking-wider">Lưu nhanh chỉ số hiện đo:</span>
            <span className="text-xs font-bold text-brand-primary">
              N: {N} ppm | P: {P} ppm | K: {K} ppm (pH: {pH.toFixed(1)})
            </span>
          </div>
          <button
            onClick={() => {
              const currentCount = historyData.length + 1;
              const nextMonthNum = (currentCount + 1) > 12 ? (currentCount + 1) - 12 : (currentCount + 1);
              const label = `T${nextMonthNum}/2026`;
              setHistoryData([...historyData, { name: label, N, P, K, pH }]);
            }}
            id="btn-save-soil-history"
            className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-light text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            + Ghi nhận vào Biểu đồ
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-brand-surface to-rose-500/10 dark:from-rose-500/5 dark:to-rose-500/15 shadow-xl space-y-5"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-brand-high">
            <div className="bg-brand-primary/5 text-brand-primary p-2.5 rounded-xl border border-brand-primary/10">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-brand-primary">{analysisResult.suitability}</h3>
              <p className="text-[10px] text-brand-text-variant uppercase tracking-wider font-semibold">Đánh giá chung từ chuyên gia AI</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-wider block">Tình trạng dinh dưỡng:</span>
            <p className="text-xs md:text-sm font-light leading-relaxed text-brand-text bg-rose-500/10 dark:bg-rose-500/25 p-3.5 rounded-xl border border-rose-500/15">
              {analysisResult.status}
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-wider block">Khuyến nghị kỹ thuật cải tạo sinh học:</span>
            <div className="space-y-2.5">
              {analysisResult.recommendations?.map((rec, index) => (
                <div key={index} className="flex gap-3 items-start bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                  <div className="bg-emerald-100 text-emerald-800 border border-emerald-200/50 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-xs md:text-sm text-brand-text-variant font-light leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Fertilizer Assistant Card */}
      <div className="glass p-6 rounded-3xl border border-emerald-500/20 shadow-xl space-y-5 bg-gradient-to-br from-emerald-500/5 via-brand-surface to-emerald-500/10 dark:from-emerald-500/5 dark:to-emerald-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start gap-3 pb-3 border-b border-brand-high">
          <div className="bg-brand-primary/10 text-brand-primary p-2.5 rounded-2xl border border-brand-primary/20">
            <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-tertiary uppercase tracking-widest block">Tính năng mở rộng</span>
            <h3 className="font-display font-bold text-lg text-brand-primary flex items-center gap-1.5">
              Trợ lý Phân bón Thông minh AI
            </h3>
            <p className="text-[11px] text-brand-text-variant font-light">
              Tự động tính toán nhu cầu dinh dưỡng và gợi ý loại phân bón với liều lượng cụ thể dựa trên chỉ số đất đai NPK, pH bên trên.
            </p>
          </div>
        </div>

        {/* Dynamic Context Notice */}
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/15 text-xs text-brand-text-variant space-y-1">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider text-[9px]">Dữ liệu đất đai hiện tại:</span>
          <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono text-[11px]">
            <div className="bg-emerald-500/10 dark:bg-emerald-500/20 py-1 rounded-lg border border-emerald-500/15 text-emerald-700 dark:text-emerald-300"><span className="text-[9px] block text-emerald-600 font-sans font-bold">N (Đạm)</span>{N} ppm</div>
            <div className="bg-amber-500/10 dark:bg-amber-500/20 py-1 rounded-lg border border-amber-500/15 text-amber-700 dark:text-amber-300"><span className="text-[9px] block text-brand-tertiary font-sans font-bold">P (Lân)</span>{P} ppm</div>
            <div className="bg-sky-500/10 dark:bg-sky-500/20 py-1 rounded-lg border border-sky-500/15 text-sky-700 dark:text-sky-300"><span className="text-[9px] block text-sky-600 font-sans font-bold">K (Kali)</span>{K} ppm</div>
            <div className="bg-indigo-500/10 dark:bg-indigo-500/20 py-1 rounded-lg border border-indigo-500/15 text-indigo-700 dark:text-indigo-300"><span className="text-[9px] block text-brand-text-variant font-sans font-bold">pH</span>{pH.toFixed(1)}</div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-variant">
              1. Chọn cây trồng cần bón phân:
            </label>
            <select
              value={fertilizerCrop}
              onChange={(e) => setFertilizerCrop(e.target.value)}
              id="select-fertilizer-crop"
              className="w-full bg-brand-surface border border-brand-high p-3 rounded-xl text-sm font-medium text-brand-text focus:border-brand-primary outline-none"
            >
              <option value="Cà phê Robusta (Tây Nguyên)">☕ Cà phê Robusta (Tây Nguyên)</option>
              <option value="Lúa nước (Đồng bằng sông Cửu Long)">🌾 Lúa nước vụ xuân hè</option>
              <option value="Sầu riêng Ri6 / Dona">🌳 Cây sầu riêng nuôi trái</option>
              <option value="Thanh long ruột đỏ / trắng">🌵 Cây thanh long (Khử chua hạ phèn)</option>
              <option value="Bưởi da xanh / Cam sành">🍊 Cây có múi (Bưởi da xanh)</option>
              <option value="Rau màu ăn lá & rau quả (Cà chua, dưa leo)">🥦 Rau màu màu mỡ</option>
              <option value="Hồ tiêu trồng chậu / vườn đồi">🌱 Cây hồ tiêu</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-variant">
                2. Giai đoạn sinh trưởng & Ghi chú thêm:
              </label>
              <span className="text-[10px] text-brand-text-variant italic font-light">Tùy chọn</span>
            </div>
            <textarea
              value={fertilizerNotes}
              onChange={(e) => setFertilizerNotes(e.target.value)}
              id="textarea-fertilizer-notes"
              placeholder="Ví dụ: Cây đang trong giai đoạn ra hoa, cần bổ sung vi lượng, hoặc vườn vừa thu hoạch xong cần phục hồi rễ..."
              className="w-full bg-brand-surface border border-brand-high p-3 rounded-xl text-xs font-light text-brand-text h-20 focus:border-brand-primary outline-none resize-none leading-relaxed"
            />
            
            {/* Quick Stage selection tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "🌱 Cây con mới trồng", text: "Cây con đang thời kỳ phát triển rễ và thân lá.", color: "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
                { label: "🌸 Chuẩn bị ra hoa", text: "Cây chuẩn bị phân hóa mầm hoa, cần kích hoa ra đều.", color: "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/15 text-rose-700 dark:text-rose-400" },
                { label: "🍋 Đang nuôi trái lớn", text: "Cây đang giai đoạn nuôi trái lớn, cần chống rụng quả non.", color: "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/15 text-amber-700 dark:text-amber-400" },
                { label: "✂️ Sau thu hoạch", text: "Vừa thu hoạch xong, cần phục hồi thể trạng rễ đất đai.", color: "bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/15 text-indigo-700 dark:text-indigo-400" }
              ].map((tag, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFertilizerNotes(tag.text)}
                  className={`${tag.color} border px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGetFertilizerSuggestion}
          disabled={fertilizerLoading}
          id="btn-fertilizer-ai-submit"
          className="w-full bg-gradient-to-r from-brand-primary to-brand-primary-light hover:to-brand-primary text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs uppercase tracking-wider disabled:opacity-55 active:scale-98 cursor-pointer"
        >
          {fertilizerLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Trợ lý AI đang tính toán liều lượng...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Tra cứu liều lượng phân bón AI
            </>
          )}
        </button>

        {/* Error message */}
        {fertilizerError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="font-light">{fertilizerError}</p>
          </div>
        )}

        {/* Fertilizer Results UI Block */}
        {fertilizerResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4 border-t border-brand-high"
          >
            {/* Status overview */}
            <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" /> Chẩn đoán phân bón cho: {fertilizerResult.cropType}
                </span>
                <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                  Chính xác cao
                </span>
              </div>
              <p className="text-brand-text font-light leading-relaxed pt-1">
                {fertilizerResult.soilStatusBrief}
              </p>
            </div>

            {/* Recommended plan detail cards */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-wider block">
                Phác đồ & Liều lượng phân bón chi tiết:
              </span>
              
              <div className="grid grid-cols-1 gap-3.5">
                {fertilizerResult.fertilizerPlan?.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col md:flex-row md:items-start gap-3 relative"
                  >
                    {/* Index circle */}
                    <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      #{index + 1}
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {/* Name of fertilizer */}
                      <div>
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block">Tên loại phân bón:</span>
                        <h4 className="font-bold text-sm text-brand-text leading-tight">{item.name}</h4>
                      </div>

                      {/* Dosage & Timing Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/15 p-2 rounded-xl text-left">
                          <span className="text-[9px] font-bold text-teal-600 uppercase block">Liều lượng bón:</span>
                          <span className="font-bold text-brand-text text-xs leading-tight block pt-0.5">{item.dosage}</span>
                        </div>
                        <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 p-2 rounded-xl text-left">
                          <span className="text-[9px] font-bold text-amber-600 uppercase block">Thời điểm bón:</span>
                          <span className="font-medium text-brand-text text-xs leading-tight block pt-0.5">{item.timing}</span>
                        </div>
                      </div>

                      {/* Application method */}
                      <div className="pt-1 text-[11px] font-light leading-relaxed text-brand-text-variant">
                        <span className="font-semibold text-brand-text">Cách bón thực tế:</span> {item.method}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agronomist's Advice */}
            {fertilizerResult.agronomistAdvice && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl space-y-1">
                <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Lưu ý an toàn & kỹ thuật từ kỹ sư VTNN 181:
                </span>
                <p className="text-xs text-brand-text-variant font-light leading-relaxed">
                  {fertilizerResult.agronomistAdvice}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
