import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Cloud, 
  Scan, 
  ChevronRight, 
  Sprout, 
  BookOpen, 
  ArrowRight, 
  FileText,
  User,
  Activity,
  Heart,
  Droplet,
  Phone,
  MapPin,
  HelpCircle,
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  RotateCw,
  Navigation,
  Droplets,
  Plus,
  Trash2,
  Check,
  ListTodo,
  Sparkles,
  Cpu,
  Layers,
  Gauge,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import { ActiveTab } from "../types";
import CropCalendar from "./CropCalendar";

interface TabHomeProps {
  onTabChange: (tab: ActiveTab) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

const PRESET_LOCATIONS = [
  { id: "di-linh", name: "Di Linh, Lâm Đồng", lat: 11.53, lon: 108.10 },
  { id: "da-lat", name: "Đà Lạt, Lâm Đồng", lat: 11.94, lon: 108.44 },
  { id: "bao-loc", name: "Bảo Lộc, Lâm Đồng", lat: 11.54, lon: 107.80 },
  { id: "buon-ma-thuot", name: "Đắk Lắk (Buôn Ma Thuột)", lat: 12.67, lon: 108.04 },
  { id: "pleiku", name: "Gia Lai (Pleiku)", lat: 13.98, lon: 108.01 }
];

export default function TabHome({ onTabChange, isOnline, setIsOnline }: TabHomeProps) {
  const [showCompostModal, setShowCompostModal] = useState(false);
  
  // States for Smart Agriculture 4.0 Knowledge and Technology Hub
  const [compostTab, setCompostTab] = useState<"compost" | "trichoderma" | "sensor_iot">("compost");
  const [carbonInput, setCarbonInput] = useState<number>(120);
  const [nitrogenInput, setNitrogenInput] = useState<number>(40);
  const [gardenSize, setGardenSize] = useState<number>(1000);
  const [compostStep, setCompostStep] = useState<number>(1);

  const [selectedLoc, setSelectedLoc] = useState(PRESET_LOCATIONS[0]);
  const [weather, setWeather] = useState<{
    temp: number;
    humidity: number;
    apparentTemp: number;
    rain: number;
    windSpeed: number;
    code: number;
    name: string;
    isGPS?: boolean;
    tempMax?: number;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherErr, setWeatherErr] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, name: string, isGPS = false) => {
    setWeatherLoading(true);
    setWeatherErr(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,rain,weather_code,wind_speed_10m&daily=temperature_2m_max&timezone=Asia/Ho_Chi_Minh`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể tải dữ liệu thời tiết");
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      setWeather({
        temp: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        apparentTemp: current.apparent_temperature,
        rain: current.rain,
        windSpeed: current.wind_speed_10m,
        code: current.weather_code,
        name: name,
        isGPS: isGPS,
        tempMax: daily && daily.temperature_2m_max ? daily.temperature_2m_max[0] : Math.round(current.temperature_2m + 2)
      });
    } catch (e: any) {
      console.error(e);
      setWeatherErr("Sử dụng dữ liệu offline do lỗi kết nối.");
      const baseTemp = name.includes("Đà Lạt") ? 18 : 24;
      setWeather({
        temp: baseTemp,
        humidity: 82,
        apparentTemp: name.includes("Đà Lạt") ? 18 : 25,
        rain: 0,
        windSpeed: 8.5,
        code: 2,
        name: name,
        isGPS: isGPS,
        tempMax: baseTemp + 3
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedLoc.lat, selectedLoc.lon, selectedLoc.name);
  }, [selectedLoc]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(lat, lon, `Vị trí GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`, true);
      },
      (error) => {
        console.error(error);
        setWeatherErr("Không thể định vị. Vui lòng chọn vùng thủ công.");
        setWeatherLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getWeatherRecommendation = (code: number, temp: number, humidity: number, rain: number) => {
    if (rain > 0 || code >= 51) {
      return {
        title: "Tránh rửa trôi phân thuốc",
        text: "Khu vực đang có mưa hoặc có khả năng mưa cao. Tránh phun thuốc BVTV hay bón phân hóa học ngoài trời vì dễ bị mưa cuốn trôi lãng phí. Nên khơi thông rãnh thoát nước vườn.",
        type: "warning",
        colorClass: "text-amber-600 bg-amber-500/5 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30"
      };
    }
    if (temp >= 31) {
      return {
        title: "Tưới bổ sung chống sốc nhiệt",
        text: "Nhiệt độ ngoài trời khá cao. Nên tưới bù nước sâu vào gốc vào sáng sớm hoặc chiều muộn. Bổ sung lớp tủ gốc giữ ẩm cho cà phê và cây ăn trái.",
        type: "hot",
        colorClass: "text-rose-600 bg-rose-500/5 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30"
      };
    }
    if (humidity >= 85) {
      return {
        title: "Cảnh giác nấm rỉ sắt & nấm hồng",
        text: "Độ ẩm cao tạo điều kiện thuận lợi cho bào tử nấm rỉ sắt sinh sôi. Bác nên tỉa bớt cành tăm, lá chân khuất ánh sáng để tạo độ thông thoáng tốt nhất.",
        type: "humidity",
        colorClass: "text-indigo-600 bg-indigo-500/5 border-indigo-500/20 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/30"
      };
    }
    return {
      title: "Thời tiết lý tưởng chăm vườn",
      text: "Khí hậu mát mẻ ôn hòa. Thích hợp nhất để rải phân hữu cơ vi sinh, dọn cỏ dại, bón lót bổ sung NPK và tiến hành thu hoạch, phơi phóng nông sản khô ráo.",
      type: "success",
      colorClass: "text-emerald-600 bg-emerald-500/5 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30"
    };
  };

  const getWeatherDesc = (code: number) => {
    switch (code) {
      case 0: return { label: "Trời quang, nắng đẹp", icon: <Sun className="w-6 h-6 text-amber-500 animate-pulse" /> };
      case 1:
      case 2:
      case 3: return { label: "Ít mây, nắng dịu", icon: <CloudSun className="w-6 h-6 text-amber-400" /> };
      case 45:
      case 48: return { label: "Sương mù nhẹ", icon: <Cloud className="w-6 h-6 text-gray-400" /> };
      case 51:
      case 53:
      case 55: return { label: "Mưa phùn nhỏ", icon: <CloudRain className="w-6 h-6 text-sky-400" /> };
      case 61:
      case 63:
      case 65: return { label: "Mưa rào nhẹ", icon: <CloudRain className="w-6 h-6 text-sky-500" /> };
      case 80:
      case 81:
      case 82: return { label: "Mưa rào nặng hạt", icon: <CloudRain className="w-6 h-6 text-blue-500" /> };
      case 95:
      case 96:
      case 99: return { label: "Dông bão kèm sét", icon: <CloudRain className="w-6 h-6 text-red-500" /> };
      default: return { label: "Nhiều mây, mát mẻ", icon: <Cloud className="w-6 h-6 text-emerald-200" /> };
    }
  };

  return (
    <div className="space-y-6 pb-20">


      {/* Main Intro */}
      <div className="space-y-4 px-2 py-4 relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-2">
          <span className="bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-brand-primary/10 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
            Nông Nghiệp Thông Minh 4.0
          </span>
          <span className="bg-brand-tertiary/10 text-brand-tertiary px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-brand-tertiary/10">
            VTNN 181
          </span>
        </div>
        
        <h1 className="font-display text-3xl md:text-5xl leading-[1.15] text-brand-primary font-bold tracking-tight">
          Giải Pháp <span className="font-light text-brand-text">Nông Nghiệp</span>
          <br />
          <span className="bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-secondary bg-clip-text text-transparent font-black pr-1">
            Thông Minh Toàn Diện
          </span>
        </h1>
        
        <p className="text-xs md:text-sm text-brand-text-variant leading-relaxed font-normal max-w-xl">
          Hệ thống chẩn đoán bệnh lý bằng AI, tính toán phối trộn phân bón khoa học, đo lường cảm biến đất & chuyển giao giải pháp sinh học thông minh cùng nhà nông Việt Nam.
        </p>
      </div>

      {/* Earthy Terracotta Alert Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-accent p-5 rounded-3xl shadow-xs relative overflow-hidden flex gap-4 border border-brand-tertiary/20"
      >
        <div className="bg-brand-tertiary/10 p-3 h-fit rounded-2xl text-brand-tertiary border border-brand-tertiary/20 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg text-brand-tertiary tracking-wide">Cảnh báo thời tiết: Sương muối</h3>
          <p className="text-xs text-brand-text-variant leading-relaxed font-medium">
            Nhiệt độ dự kiến giảm sâu vào rạng sáng mai. Bác lưu ý che chắn cho vườn cà phê non và rau màu. Hãy cập nhật thông tin 4 giờ 1 lần
          </p>
        </div>
      </motion.div>

      {/* Weather Display Widget */}
      <div className="glass p-5 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-brand-surface to-sky-500/10 dark:from-sky-500/5 dark:to-sky-500/15 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-brand-high">
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-base text-brand-primary flex items-center gap-2">
              <CloudSun className="w-5 h-5" /> Dự Báo Thời Tiết Nông Nghiệp
            </h3>
            <p className="text-[10px] text-brand-text-variant font-medium">Theo dõi thời tiết thời gian thực cho nông nghiệp thông minh</p>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={selectedLoc.id}
              onChange={(e) => {
                const loc = PRESET_LOCATIONS.find(l => l.id === e.target.value);
                if (loc) setSelectedLoc(loc);
              }}
              id="select-weather-location"
              className="bg-brand-surface border border-brand-high rounded-xl text-xs px-2.5 py-1.5 font-bold text-brand-primary focus:outline-none cursor-pointer"
            >
              {PRESET_LOCATIONS.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <button
              onClick={handleGetLocation}
              id="btn-get-gps-location"
              className="p-1.5 rounded-xl text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors border border-brand-high"
              title="Sử dụng định vị GPS hiện tại"
            >
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
            </button>
          </div>
        </div>

        {weatherLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <RotateCw className="w-6 h-6 text-brand-primary animate-spin" />
            <p className="text-xs text-brand-text-variant">Đang kết nối trạm khí tượng...</p>
          </div>
        ) : weather ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-500/15">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                  {getWeatherDesc(weather.code).icon}
                </div>
                <div>
                  <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-bold uppercase tracking-wider">Hiện trạng</p>
                  <p className="text-xs font-bold text-brand-text">{getWeatherDesc(weather.code).label}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-rose-500/5 dark:bg-rose-500/10 p-4 rounded-2xl border border-rose-500/15">
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                  <span className="text-xl font-bold font-display">{weather.temp}°C</span>
                </div>
                <div>
                  <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-bold uppercase tracking-wider">CAO NHẤT</p>
                  <p className="text-xs font-bold text-brand-text">Đạt {weather.tempMax || Math.round(weather.temp + 2)}°C</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-sky-500/5 dark:bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/15">
                <span className="text-[10px] text-sky-600/80 dark:text-sky-300/80 uppercase tracking-wider block font-bold">Độ ẩm</span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{weather.humidity}%</span>
              </div>
              <div className="bg-teal-500/5 dark:bg-teal-500/10 p-2.5 rounded-xl border border-teal-500/15">
                <span className="text-[10px] text-teal-600/80 dark:text-teal-300/80 uppercase tracking-wider block font-bold">Sức gió</span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{weather.windSpeed} km/h</span>
              </div>
              <div className="bg-indigo-500/5 dark:bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/15">
                <span className="text-[10px] text-indigo-600/80 dark:text-indigo-300/80 uppercase tracking-wider block font-bold">Lượng mưa</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{weather.rain} mm</span>
              </div>
            </div>

            {/* Weather alert banner warning */}
            {weatherErr && (
              <div className="p-2.5 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-xl text-[10px] font-medium text-center">
                {weatherErr}
              </div>
            )}

            {/* Interactive Agricultural Recommendation Based on weather conditions */}
            {(() => {
              const rec = getWeatherRecommendation(weather.code, weather.temp, weather.humidity, weather.rain);
              return (
                <div className={`p-4 rounded-2xl border flex gap-3 items-start transition-all duration-300 ${rec.colorClass}`}>
                  <div className="p-1.5 rounded-lg bg-black/5 flex-shrink-0 mt-0.5">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wide">{rec.title}</h4>
                    <p className="text-[11px] leading-relaxed opacity-90 font-light">{rec.text}</p>
                  </div>
                </div>
              );
            })()}

            <div className="text-right text-[9px] text-brand-text-variant font-semibold">
              Vùng đo: <span className="text-brand-primary font-bold">{weather.name}</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-brand-text-variant">
            Không tìm thấy dữ liệu thời tiết.
          </div>
        )}
      </div>

      {/* Lịch mùa vụ thông minh */}
      <CropCalendar 
        currentLocationName={weather ? weather.name : selectedLoc.name}
        isRaining={weather ? weather.rain > 0 : false}
        currentTemp={weather ? weather.temp : 24}
      />

      {/* Farmer's Tools Section */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-brand-primary tracking-wider uppercase">Công cụ nhà nông</h2>
        
        {/* Big Card Button: Scan Disease */}
        <button 
          onClick={() => onTabChange("scan")}
          className="w-full text-left glass border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-brand-surface to-emerald-500/10 dark:from-emerald-500/5 dark:to-emerald-500/15 p-5 rounded-3xl transition-all flex items-center justify-between group active:scale-98 cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-4">
            <div className="bg-brand-primary/5 text-brand-primary p-3.5 rounded-2xl border border-brand-primary/10 group-hover:border-brand-primary/25 transition-colors">
              <Scan className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-brand-text">Chẩn đoán bệnh lá</h3>
              <p className="text-xs text-brand-text-variant mt-0.5">Chụp ảnh lá cây để kiểm tra bằng AI</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-brand-text-variant group-hover:translate-x-1 group-hover:text-brand-primary transition-all" />
        </button>

        {/* Two smaller bento grid cards */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onTabChange("soil")}
            className="text-left glass border border-amber-500/15 bg-gradient-to-br from-amber-500/5 via-brand-surface to-amber-500/10 dark:from-amber-500/5 dark:to-amber-500/15 p-5 rounded-3xl transition-all flex flex-col justify-between h-40 group active:scale-98 cursor-pointer shadow-xs"
          >
            <div className="bg-brand-primary/5 text-brand-primary p-3 rounded-xl w-fit border border-brand-primary/10 group-hover:border-brand-primary/25 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-brand-text">Kiểm tra đất</h4>
              <p className="text-xs text-brand-text-variant mt-0.5">Dinh dưỡng & Độ ẩm</p>
            </div>
          </button>

          <button 
            onClick={() => onTabChange("diary")}
            className="text-left glass border border-indigo-500/15 bg-gradient-to-br from-indigo-500/5 via-brand-surface to-indigo-500/10 dark:from-indigo-500/5 dark:to-indigo-500/15 p-5 rounded-3xl transition-all flex flex-col justify-between h-40 group active:scale-98 cursor-pointer shadow-xs"
          >
            <div className="bg-brand-primary/5 text-brand-primary p-3 rounded-xl w-fit border border-brand-primary/10 group-hover:border-brand-primary/25 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-brand-text">Nhật ký vườn</h4>
              <p className="text-xs text-brand-text-variant mt-0.5">Ghi chép mùa vụ</p>
            </div>
          </button>
        </div>
      </div>

      {/* Compost / Fertilizer tips banner upgraded to Smart Ag 4.0 Guide Hub banner */}
      <div 
        onClick={() => {
          setCompostTab("compost");
          setShowCompostModal(true);
        }}
        className="glass border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-brand-surface to-emerald-500/5 dark:from-emerald-500/15 dark:to-emerald-500/10 cursor-pointer p-5 rounded-3xl transition-all shadow-md hover:shadow-emerald-500/5 relative overflow-hidden group active:scale-98"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider">CẨM NANG SỐ</span>
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider">4.0 TECH</span>
              </div>
              <h4 className="font-display font-bold text-sm text-brand-text mt-1">Cẩm Nang Tri Thức Nông Nghiệp 4.0</h4>
              <p className="text-xs text-brand-text-variant">Ủ phân compost, chế phẩm Trichoderma & cảm biến đất</p>
            </div>
          </div>
          <div className="bg-brand-primary text-white p-2 rounded-xl group-hover:bg-brand-tertiary transition-all transform group-hover:translate-x-0.5 flex-shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="glass p-5 rounded-3xl border border-brand-tertiary/20 bg-gradient-to-br from-brand-tertiary/5 via-brand-surface to-brand-tertiary/10 dark:from-brand-tertiary/5 dark:to-brand-tertiary/15 shadow-xs space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-tertiary font-bold">Hỗ trợ kỹ thuật</span>
          <h3 className="font-display font-bold text-lg text-brand-primary">Liên Hệ VTNN 181</h3>
          <p className="text-xs text-brand-text-variant font-light leading-relaxed">
            Bạn đang gặp vấn đề với khu vườn? Hãy liên hệ ngay để kỹ sư của chúng tôi tư vấn miễn phí.
          </p>
        </div>
        
        <div className="space-y-3 pt-2 border-t border-brand-high">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary/5 text-brand-primary p-2.5 rounded-xl border border-brand-primary/10 flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-brand-text-variant uppercase tracking-wider font-semibold">Hotline / Zalo tư vấn</p>
              <a href="tel:0965989554" className="text-sm font-bold text-brand-tertiary hover:underline">
                0965.989.554
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-brand-primary/5 text-brand-primary p-2.5 rounded-xl border border-brand-primary/10 flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-brand-text-variant uppercase tracking-wider font-semibold">Địa chỉ</p>
              <p className="text-xs text-brand-text font-light leading-relaxed">
                1270 Hùng Vương Di Linh, Lâm Đồng, Việt Nam
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compost / Smart Ag 4.0 Education Modal */}
      {showCompostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-surface max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border border-brand-high flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-brand-high flex justify-between items-center bg-gradient-to-r from-emerald-950/20 to-brand-surface flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/15 flex-shrink-0">
                  <Cpu className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm md:text-base text-brand-primary tracking-wide">CẨM NANG & THIẾT BỊ NÔNG NGHIỆP 4.0</h3>
                  <p className="text-[10px] text-brand-text-variant font-medium uppercase tracking-wider">Hệ thống chuyển giao công nghệ cao</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCompostModal(false)}
                className="bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary p-2 rounded-full text-xs font-bold w-8 h-8 flex items-center justify-center transition-colors border border-brand-primary/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tab Bar inside Modal */}
            <div className="flex border-b border-brand-high bg-brand-surface-dim/40 p-2 gap-1 flex-shrink-0">
              <button
                onClick={() => setCompostTab("compost")}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  compostTab === "compost"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-brand-text-variant hover:text-brand-text hover:bg-brand-surface"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ủ Compost 4.0</span>
              </button>
              <button
                onClick={() => setCompostTab("trichoderma")}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  compostTab === "trichoderma"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-brand-text-variant hover:text-brand-text hover:bg-brand-surface"
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Vi Sinh Vật Bio</span>
              </button>
              <button
                onClick={() => setCompostTab("sensor_iot")}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  compostTab === "sensor_iot"
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-brand-text-variant hover:text-brand-text hover:bg-brand-surface"
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Cảm Biến IoT</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* TAB 1: COMPOST 4.0 & CALCULATOR */}
              {compostTab === "compost" && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 space-y-2">
                    <h4 className="font-display font-extrabold text-xs text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                      Công nghệ ủ hữu cơ Compost thông minh
                    </h4>
                    <p className="text-xs text-brand-text-variant leading-relaxed font-light">
                      Quá trình chuyển hóa chất hữu cơ (phế phụ phẩm nông nghiệp như lá khô, vỏ cà phê, cành tăm băm vụn) nhờ vi sinh vật hiếu khí hoạt động sinh nhiệt ở nhiệt độ cao (55-65°C), giúp tiêu diệt mầm bệnh và tạo ra phân bón hữu cơ tuyệt hảo cho rễ cây trồng.
                    </p>
                  </div>

                  {/* C:N Ratio Interactive Calculator */}
                  <div className="p-4 bg-brand-surface-dim border border-brand-high rounded-2xl space-y-3.5">
                    <div className="flex items-center gap-1.5 text-brand-primary border-b border-brand-high pb-2">
                      <Cpu className="w-4 h-4 text-brand-primary" />
                      <h5 className="text-xs font-bold uppercase tracking-wider">Bộ tính toán tỷ lệ bón C:N chuẩn 4.0</h5>
                    </div>
                    
                    <p className="text-[11px] text-brand-text-variant leading-relaxed">
                      Tỷ lệ Carbon (Nâu) so với Nitơ (Xanh) tối ưu cho đống ủ lý tưởng là từ <span className="text-brand-primary font-bold">25:1</span> đến <span className="text-brand-primary font-bold">35:1</span>.
                    </p>

                    <div className="space-y-3">
                      {/* Carbon slider (Brown inputs) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">🟫 Nguyên liệu Nâu (Lá khô, vỏ cà phê):</span>
                          <span className="font-bold text-brand-text">{carbonInput} kg</span>
                        </div>
                        <input 
                          type="range"
                          min="20"
                          max="500"
                          step="10"
                          value={carbonInput}
                          onChange={(e) => setCarbonInput(Number(e.target.value))}
                          className="w-full h-1.5 bg-brand-high rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        />
                        <span className="text-[9px] text-brand-text-variant block font-light">Cung cấp nguồn Carbon dồi dào, cấu trúc xốp đống ủ.</span>
                      </div>

                      {/* Nitrogen slider (Green inputs) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">🟩 Nguyên liệu Xanh (Xác rau quả, cỏ tươi):</span>
                          <span className="font-bold text-brand-text">{nitrogenInput} kg</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="300"
                          step="5"
                          value={nitrogenInput}
                          onChange={(e) => setNitrogenInput(Number(e.target.value))}
                          className="w-full h-1.5 bg-brand-high rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        />
                        <span className="text-[9px] text-brand-text-variant block font-light">Cung cấp nguồn Nitơ (đạm) sinh học cho vi khuẩn nhân mật độ nhanh.</span>
                      </div>
                    </div>

                    {/* Dynamic ratio evaluation box */}
                    {(() => {
                      const ratio = Math.round((50 * carbonInput + 15 * nitrogenInput) / (carbonInput + nitrogenInput || 1));
                      let statusText = "";
                      let statusColor = "";
                      if (ratio >= 25 && ratio <= 35) {
                        statusText = "✅ Tỷ Lệ Vàng (Đạt chuẩn 4.0)! Đống ủ sẽ hoai mục nhanh gấp 2 lần, không sinh mùi và giữ trọn đạm hữu cơ.";
                        statusColor = "text-emerald-600 bg-emerald-500/5 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10";
                      } else if (ratio > 35) {
                        statusText = "⚠️ Thừa Carbon! Tỷ lệ gỗ/lá khô quá nhiều làm vi khuẩn thiếu đạm để nhân đôi. Đống ủ sẽ hoai cực kỳ chậm (trên 3 tháng). Hãy tăng Nguyên liệu Xanh.";
                        statusColor = "text-amber-600 bg-amber-500/5 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10";
                      } else {
                        statusText = "⚠️ Thừa Nitơ! Quá nhiều đạm tươi sinh học dễ gây thối úng, sinh mùi khai amoniac khó chịu và rửa trôi lãng phí đạm. Hãy bổ sung thêm Nguyên liệu Nâu.";
                        statusColor = "text-rose-600 bg-rose-500/5 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10";
                      }

                      return (
                        <div className={`p-3.5 rounded-xl border space-y-1.5 ${statusColor}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-black tracking-wider">KẾT QUẢ PHÂN TÍCH:</span>
                            <span className="text-sm font-black">C:N ≈ {ratio}:1</span>
                          </div>
                          <p className="text-[11px] leading-relaxed font-semibold">{statusText}</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Interactive steps phase */}
                  <div className="space-y-2.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5" /> Quy trình kiểm soát 4 pha khoa học:
                    </h5>
                    
                    <div className="flex gap-1 bg-brand-surface-dim p-1 rounded-xl border border-brand-high">
                      {[1, 2, 3, 4].map((ph) => {
                        const phaseLabels = ["Pha 1: Lót", "Pha 2: Lớp", "Pha 3: Nhiệt", "Pha 4: Hoai"];
                        return (
                          <button
                            key={ph}
                            onClick={() => setCompostStep(ph)}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                              compostStep === ph 
                                ? "bg-brand-primary text-white shadow-xs" 
                                : "text-brand-text-variant hover:bg-brand-surface"
                            }`}
                          >
                            {phaseLabels[ph - 1]}
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-brand-surface border border-brand-high rounded-2xl min-h-24">
                      {compostStep === 1 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-brand-tertiary">Pha 1: Xây nền đống ủ</span>
                          <p className="text-[11.5px] leading-relaxed text-brand-text-variant font-light">
                            Rải một lớp cành củi khô băm nhỏ hoặc vỏ thân gỗ ở đáy đống ủ cao khoảng 10-15cm. Lớp này cực kỳ quan trọng giúp không khí lưu thông luân phiên từ đáy lên trên, cung cấp oxy sinh học dồi dào tránh gây phân hủy kị khí sinh mùi hôi.
                          </p>
                        </div>
                      )}
                      {compostStep === 2 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-brand-tertiary">Pha 2: Phối trộn xen kẽ</span>
                          <p className="text-[11.5px] leading-relaxed text-brand-text-variant font-light">
                            Rải xen kẽ lớp nguyên liệu Nâu (Carbon) dày 15cm và lớp nguyên liệu Xanh (Nitơ) dày 5cm. Cứ mỗi lớp rải xong, bón nhẹ một lượng lân và tưới đều nước men Trichoderma hoạt hoá. Độ ẩm tối ưu sau khi rải là 60%.
                          </p>
                        </div>
                      )}
                      {compostStep === 3 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-brand-tertiary">Pha 3: Kiểm soát nhiệt độ 4.0</span>
                          <p className="text-[11.5px] leading-relaxed text-brand-text-variant font-light">
                            Trong vòng 3-5 ngày đầu, đống ủ sẽ tăng nhiệt mạnh lên 55-65°C nhờ vi khuẩn ưa nhiệt hoạt động mạnh mẽ. Hãy theo dõi sát, nếu nhiệt vượt quá 70°C, hãy tiến hành đảo đống ủ để hạ nhiệt độ và bổ sung Oxy, tránh làm vi sinh vật có lợi bị triệt tiêu do quá nhiệt.
                          </p>
                        </div>
                      )}
                      {compostStep === 4 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-brand-tertiary">Pha 4: Hoai mục hoàn toàn</span>
                          <p className="text-[11.5px] leading-relaxed text-brand-text-variant font-light">
                            Sau khoảng 45-60 ngày, đống ủ sẽ nguội hẳn, chuyển sang màu nâu sẫm hoặc đen mịn, có mùi thơm đất tự nhiên. Lúc này đống ủ đã hoai mục đạt chất lượng dinh dưỡng cao nhất, sẵn sàng bón lót cải tạo gốc cà phê, sầu riêng, rau ăn trái hiệu quả vượt trội.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BIO TRICHODERMA BIO-AGENT */}
              {compostTab === "trichoderma" && (
                <div className="space-y-4">
                  <div className="p-4 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-2xl border border-brand-primary/10 space-y-2">
                    <h4 className="font-display font-extrabold text-xs text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5" />
                      Vi nấm Trichoderma kháng bệnh rễ cây trồng
                    </h4>
                    <p className="text-xs text-brand-text-variant leading-relaxed font-light">
                      Trichoderma là chi nấm hữu ích ký sinh đối kháng trực tiếp, tiết ra các enzyme phân hủy vỏ tế bào nấm bệnh gây hại như Phytophthora, Fusarium (gây vàng lá thối rễ, héo rũ). Đồng thời, nó giúp phân giải cực nhanh cellulose thực vật thành mùn hữu cơ hấp thụ.
                    </p>
                  </div>

                  {/* Trichoderma Dosage Calculator */}
                  <div className="p-4 bg-brand-surface-dim border border-brand-high rounded-2xl space-y-3.5">
                    <div className="flex items-center gap-1.5 text-brand-primary border-b border-brand-high pb-2">
                      <Cpu className="w-4 h-4 text-brand-primary" />
                      <h5 className="text-xs font-bold uppercase tracking-wider">Hệ thống khuyến nông định lượng tự động</h5>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-brand-text">Nhập diện tích khu vườn của bác:</span>
                        <span className="font-bold text-brand-primary">{gardenSize} m²</span>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="range"
                          min="100"
                          max="10000"
                          step="100"
                          value={gardenSize}
                          onChange={(e) => setGardenSize(Number(e.target.value))}
                          className="flex-1 h-1.5 bg-brand-high rounded-lg appearance-none cursor-pointer accent-brand-primary my-auto"
                        />
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button 
                            onClick={() => setGardenSize(prev => Math.max(100, prev - 500))}
                            className="px-2 py-1 bg-brand-high text-brand-text rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            -500m²
                          </button>
                          <button 
                            onClick={() => setGardenSize(prev => Math.min(10000, prev + 500))}
                            className="px-2 py-1 bg-brand-high text-brand-text rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            +500m²
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Calculated values output card */}
                    <div className="p-3.5 bg-brand-primary/5 rounded-xl border border-brand-primary/15 grid grid-cols-2 gap-3 text-center">
                      <div className="space-y-0.5 border-r border-brand-high">
                        <span className="text-[9px] uppercase tracking-wider text-brand-text-variant font-bold block">Men Trichoderma</span>
                        <span className="text-sm font-extrabold text-brand-primary">{((gardenSize * 1.5) / 1000).toFixed(1)} kg</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-brand-text-variant font-bold block">Phân chuồng hoai lót</span>
                        <span className="text-sm font-extrabold text-brand-primary">{((gardenSize * 1500) / 1000).toFixed(0)} kg</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed font-light">
                      <strong>Mẹo kích hoạt men (Rỉ mật đường + Nước ấm):</strong> Trước khi rải vào đống ủ, bác hãy pha loãng Trichoderma với 1 lít rỉ mật đường và 20 lít nước ấm sạch. Để yên 12-24 giờ để bào tử nấm thức giấc và nhân sinh khối mạnh mẽ. Hiệu quả kháng bệnh rễ sẽ cao gấp 5 lần!
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IOT SOIL SENSORS & INTELLIGENT THRESHOLDS */}
              {compostTab === "sensor_iot" && (
                <div className="space-y-4">
                  <div className="p-4 bg-brand-tertiary/5 dark:bg-brand-tertiary/10 rounded-2xl border border-brand-tertiary/10 space-y-2">
                    <h4 className="font-display font-extrabold text-xs text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                      Công nghệ IoT kết nối đất trồng 4.0
                    </h4>
                    <p className="text-xs text-brand-text-variant leading-relaxed font-light">
                      Sử dụng các đầu dò cảm biến điện dung cắm sâu dưới gốc rễ để đo lường các chỉ số lý hóa thời gian thực: Độ dẫn điện EC, nhiệt độ, độ ẩm rễ, và pH đất, từ đó gửi cảnh báo thông minh tự động tới di động của nông gia để bón phân và tưới nước cực kỳ khoa học.
                    </p>
                  </div>

                  {/* Simulated Telemetry Indicators with professional Smart Agriculture 4.0 gauges */}
                  <div className="space-y-3.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-brand-primary animate-pulse" />
                      MÔ PHỎNG TRẠM DỮ LIỆU CẢM BIẾN IoT ĐẤT:
                    </h5>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Metric 1 */}
                      <div className="p-3 bg-brand-surface-dim border border-brand-high rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-bold text-brand-text-variant">Dinh dưỡng (EC)</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm md:text-base font-bold font-display text-brand-primary">1.25 <span className="text-[9px] font-medium text-brand-text-variant">mS/cm</span></span>
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-extrabold px-1 py-0.5 rounded-md uppercase">ỔN ĐỊNH</span>
                        </div>
                        <div className="w-full bg-brand-high h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-[65%]"></div>
                        </div>
                        <p className="text-[9px] text-brand-text-variant font-light">Chuẩn dinh dưỡng rễ sầu riêng.</p>
                      </div>

                      {/* Metric 2 */}
                      <div className="p-3 bg-brand-surface-dim border border-brand-high rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-bold text-brand-text-variant">Độ ẩm rễ (Moisture)</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm md:text-base font-bold font-display text-brand-primary">63.8 <span className="text-[9px] font-medium text-brand-text-variant">%</span></span>
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-extrabold px-1 py-0.5 rounded-md uppercase">ĐỦ NƯỚC</span>
                        </div>
                        <div className="w-full bg-brand-high h-1 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full w-[70%]"></div>
                        </div>
                        <p className="text-[9px] text-brand-text-variant font-light">Vừa ẩm, chống nghẹt rễ.</p>
                      </div>

                      {/* Metric 3 */}
                      <div className="p-3 bg-brand-surface-dim border border-brand-high rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-bold text-brand-text-variant">Nhiệt độ rễ (Root Temp)</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm md:text-base font-bold font-display text-brand-primary">24.6 <span className="text-[9px] font-medium text-brand-text-variant">°C</span></span>
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-extrabold px-1 py-0.5 rounded-md uppercase">MÁT MẺ</span>
                        </div>
                        <div className="w-full bg-brand-high h-1 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[55%]"></div>
                        </div>
                        <p className="text-[9px] text-brand-text-variant font-light">Tối ưu cho hấp thụ đạm lân kali.</p>
                      </div>

                      {/* Metric 4 */}
                      <div className="p-3 bg-brand-surface-dim border border-brand-high rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-bold text-brand-text-variant">Chỉ số pH Đất</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-sm md:text-base font-bold font-display text-brand-primary">5.2 <span className="text-[9px] font-medium text-brand-text-variant">pH</span></span>
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-extrabold px-1 py-0.5 rounded-md uppercase">CHUA NHẸ</span>
                        </div>
                        <div className="w-full bg-brand-high h-1 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[45%]"></div>
                        </div>
                        <p className="text-[9px] text-brand-text-variant font-light">Hãy bón lót phân vi sinh nâng pH.</p>
                      </div>
                    </div>

                    {/* AI Alert integration */}
                    <div className="p-3.5 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex gap-3 items-start">
                      <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-black tracking-wider text-brand-primary">CẢNH BÁO IoT TỪ HỆ THỐNG VTNN 181:</span>
                        <p className="text-[11px] leading-relaxed text-brand-text font-light">
                          Hệ thống đo lường rễ cà phê nhận thấy EC giảm nhẹ từ 1.3 xuống 1.25 mS/cm. Khuyên cáo bón bổ sung lân hữu cơ vi sinh đợt đầu mùa mưa nhằm kích thích bám rễ non rộng mở và tăng sức đề kháng tự nhiên cho cây rỉ sắt.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom buttons */}
            <div className="p-5 border-t border-brand-high bg-brand-surface-dim flex-shrink-0">
              <button 
                onClick={() => setShowCompostModal(false)}
                className="w-full bg-brand-primary hover:bg-brand-primary-light text-white py-3.5 rounded-2xl font-bold transition-all active:scale-98 cursor-pointer shadow-md text-sm"
              >
                Tôi đã hiểu, ứng dụng vào canh tác 4.0 ngay!
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
