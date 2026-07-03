import React, { useState } from "react";
import { 
  Calendar, 
  Sprout, 
  TrendingUp, 
  Droplets, 
  Sun, 
  Leaf, 
  AlertCircle, 
  CalendarClock,
  Clock,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Crop {
  id: string;
  name: string;
  scientificName: string;
  type: string;
  optimalSoil: string;
  waterNeeds: string;
  spacing: string;
  // 12 months array indicating: "planting" | "care" | "harvest" | "dormant"
  schedule: ("planting" | "care" | "harvest" | "dormant")[];
  tips: string[];
}

const CROPS_DATA: Crop[] = [
  {
    id: "coffee-robusta",
    name: "Cà phê Robusta (Vối)",
    scientificName: "Coffea canephora",
    type: "Cây công nghiệp lâu năm",
    optimalSoil: "Đất đỏ bazan thoát nước tốt, tầng đất dày > 70cm",
    waterNeeds: "Trung bình khá, cần khô hạn tạm thời để phân hóa mầm hoa",
    spacing: "3m x 3m hoặc 3m x 2.5m",
    schedule: [
      "care", "care", "care", "care", "planting", "planting", "planting", "care", "care", "harvest", "harvest", "harvest"
    ],
    tips: [
      "Tháng 5 - 7 (đầu mùa mưa): Thời điểm vàng để xuống giống mới giúp cây bám rễ sâu.",
      "Tháng 10 - 12 (mùa thu hoạch): Hái quả chín đạt tỷ lệ > 90% để giữ chất lượng hạt cao nhất.",
      "Tháng 1 - 3 (mùa khô): Tiến hành tỉa cành tăm, cành vô hiệu và tưới nước định kỳ đón hoa nở rộ."
    ]
  },
  {
    id: "durian-ri6",
    name: "Sầu riêng Ri6 / Dona",
    scientificName: "Durio zibethinus",
    type: "Cây ăn trái nhiệt đới",
    optimalSoil: "Đất thịt pha sét nhẹ, thoát nước cực tốt, độ pH từ 5.5 - 6.5",
    waterNeeds: "Cao trong giai đoạn nuôi trái, cực kỳ nhạy cảm với úng rễ",
    spacing: "8m x 8m hoặc 10m x 10m",
    schedule: [
      "care", "care", "care", "care", "planting", "planting", "care", "harvest", "harvest", "care", "care", "care"
    ],
    tips: [
      "Tháng 5 - 6 (đầu mùa mưa): Thích hợp trồng cây con. Thiết kế mô cao thoát nước tốt.",
      "Tháng 8 - 9: Mùa thu hoạch chính vụ tại vùng Tây Nguyên Lâm Đồng.",
      "Tháng 10 - 12: Tiến hành dọn vườn, bón vôi nông nghiệp nâng pH đất và phục hồi sau thu hoạch."
    ]
  },
  {
    id: "avocado-bo-sap",
    name: "Bơ sáp / Bơ 034",
    scientificName: "Persea americana",
    type: "Cây ăn trái lâu năm",
    optimalSoil: "Đất đỏ bazan hoặc đất cát pha nhiều hữu cơ, thông thoáng khí",
    waterNeeds: "Trung bình, chịu hạn tốt hơn sầu riêng",
    spacing: "6m x 6m hoặc 7m x 7m",
    schedule: [
      "care", "care", "care", "care", "planting", "planting", "harvest", "harvest", "care", "care", "care", "care"
    ],
    tips: [
      "Tháng 5 - 6: Xuống giống đầu mùa mưa để đỡ công tưới tiêu.",
      "Tháng 7 - 8: Thời gian thu hoạch bơ sáp và bơ 034 đạt độ sáp dẻo nhất.",
      "Tháng 11 - 1: Phun bổ sung kẽm và vi lượng chuẩn bị giai đoạn ra hoa đậu quả vụ mới."
    ]
  },
  {
    id: "macadamia",
    name: "Mắc ca (Macadamia)",
    scientificName: "Macadamia integrifolia",
    type: "Cây hạt dinh dưỡng",
    optimalSoil: "Đất đỏ bazan tơi xốp, tầng canh tác dày, giữ ẩm tốt",
    waterNeeds: "Trung bình, cần tránh gió bão lớn gây gãy rụng quả",
    spacing: "6m x 4m hoặc 8m x 5m",
    schedule: [
      "harvest", "harvest", "care", "care", "planting", "planting", "care", "care", "care", "care", "care", "care"
    ],
    tips: [
      "Tháng 1 - 2: Thu hoạch hạt tự nhiên rụng khi chín đạt độ béo cao.",
      "Tháng 5 - 6: Trồng xen canh hoặc chuyên canh đạt tỷ lệ sống tốt nhất.",
      "Tháng 8 - 9: Bón lót lân và phân hữu cơ vi sinh bồi bổ bộ rễ trước mùa lạnh."
    ]
  },
  {
    id: "dalat-veggies",
    name: "Rau ôn đới (Xà lách, Bắp cải)",
    scientificName: "Lactuca sativa",
    type: "Cây ngắn ngày ôn đới",
    optimalSoil: "Đất tơi xốp, giàu mùn hữu cơ, dễ thoát nước mục",
    waterNeeds: "Liên tục, độ ẩm đất ổn định từ 70 - 80%",
    spacing: "20cm x 25cm (gốc cách gốc)",
    schedule: [
      "planting", "harvest", "planting", "harvest", "planting", "harvest", "planting", "harvest", "planting", "harvest", "planting", "harvest"
    ],
    tips: [
      "Trồng quanh năm tại Đà Lạt nhờ khí hậu mát mẻ, nhưng mùa khô cần che lưới chắn nắng gắt.",
      "Mùa mưa kéo dài cần làm luống cao, làm nhà màng để tránh thối nhũn gốc rau.",
      "Bón phân hữu cơ hoai mục hoặc hữu cơ vi sinh 10 ngày trước khi gieo trồng giúp nâng cao sản lượng."
    ]
  },
  {
    id: "upland-rice",
    name: "Lúa nương Tây Nguyên",
    scientificName: "Oryza sativa L.",
    type: "Cây lương thực ngắn ngày nương rẫy",
    optimalSoil: "Đất dốc, đất xám feralit, đất nương rẫy tơi xốp thoát nước nhanh",
    waterNeeds: "Chủ yếu nhờ nước mưa tự nhiên, chịu hạn khỏe tốt",
    spacing: "Hốc x Hốc: 25cm x 20cm (gieo 3-5 hạt/hốc)",
    schedule: [
      "dormant", "dormant", "dormant", "planting", "planting", "care", "care", "care", "care", "harvest", "harvest", "dormant"
    ],
    tips: [
      "Tháṅg 4 - 5: Gieo hạt ngay sau cơn mưa đầu mùa dồi dào ẩm độ để hạt nhanh nảy mầm bám đất rẫy.",
      "Tháng 6 - 9: Làm cỏ rẫy sạch 2-3 đợt tránh cạnh tranh dinh dưỡng, bón nhẹ phân hữu cơ vi sinh hoai mục.",
      "Tháng 10 - 11: Tiến hành gặt thu hoạch lúa khi bông lúa uốn câu vàng óng chín trên 85%."
    ]
  },
  {
    id: "tomato",
    name: "Cà chua sọc dưa / Cà chua trái cây",
    scientificName: "Solanum lycopersicum",
    type: "Cây ngắn ngày ôn đới & rau màu",
    optimalSoil: "Đất cát pha thịt nhẹ tơi xốp, thoát nước cực nhanh, pH lý tưởng 6.0 - 6.5",
    waterNeeds: "Tưới nhỏ giọt thường xuyên, tránh độ ẩm dao động đột ngột làm nứt vỏ quả",
    spacing: "Hàng x Hàng: 70cm-80cm, Cây x Cây: 40cm-50cm",
    schedule: [
      "harvest", "planting", "planting", "care", "harvest", "harvest", "dormant", "planting", "planting", "care", "care", "harvest"
    ],
    tips: [
      "Tháng 2 - 3 & Tháng 8 - 9: Thời vụ xuống bầu giống tốt lành khỏe mạnh. Làm giàn leo chữ A kiên cố.",
      "Tháng 4 & Tháng 10: Tỉa bớt chồi nách phụ vô hiệu, tập trung dinh dưỡng nuôi thân leo khỏe chính.",
      "Tháng 5 - 6 & Tháng 12 - 1: Thu hoạch khi trái chín căng mọng chuyển hồng đỏ đồng loạt."
    ]
  }
];

interface CropCalendarProps {
  currentLocationName: string;
  isRaining: boolean;
  currentTemp: number;
}

export default function CropCalendar({ currentLocationName, isRaining, currentTemp }: CropCalendarProps) {
  const [selectedCropId, setSelectedCropId] = useState<string>(CROPS_DATA[0].id);
  const [expandedInfo, setExpandedInfo] = useState<boolean>(false);
  
  // Get current month in 0-indexed form (0 = January)
  const currentMonthIdx = new Date().getMonth(); 
  const activeCrop = CROPS_DATA.find(c => c.id === selectedCropId) || CROPS_DATA[0];

  const getStatusBadge = (type: "planting" | "care" | "harvest" | "dormant") => {
    switch (type) {
      case "planting":
        return {
          label: "Xuống giống / Gieo trồng",
          class: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10",
          dotClass: "bg-emerald-500 animate-pulse"
        };
      case "care":
        return {
          label: "Chăm sóc & Bón phân",
          class: "bg-sky-500/10 text-sky-600 border border-sky-500/20 dark:text-sky-400 dark:bg-sky-500/10",
          dotClass: "bg-sky-500"
        };
      case "harvest":
        return {
          label: "Mùa Vụ Thu Hoạch",
          class: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10",
          dotClass: "bg-amber-500"
        };
      default:
        return {
          label: "Ngủ đông / Dưỡng đất",
          class: "bg-brand-text-variant/10 text-brand-text-variant border border-brand-high",
          dotClass: "bg-brand-text-variant"
        };
    }
  };

  // Weather and geographic adjustment generator
  const getSmartGeoAdvice = () => {
    let advice = "";
    const locLower = currentLocationName.toLowerCase();
    
    if (locLower.includes("đà lạt")) {
      advice += "Khí hậu ôn đới Đà Lạt cực kỳ thuận lợi cho các loài rau xanh, xà lách, cây ăn quả ôn đới quanh năm. ";
      if (currentTemp < 15) {
        advice += "Thời tiết hiện tại khá lạnh (< 15°C), nên sử dụng màng phủ nông nghiệp hoặc nhà kính để duy trì nhiệt độ đất ấm áp cho rễ cây phát triển.";
      } else {
        advice += "Độ ẩm mát mẻ thích hợp cho bón thúc bón lá lân hữu cơ.";
      }
    } else if (locLower.includes("di linh") || locLower.includes("bảo lộc")) {
      advice += "Vùng Di Linh, Bảo Lộc có đất đỏ Bazan lý tưởng cho Cà phê Robusta, Sầu riêng và Bơ sáp. ";
      if (isRaining) {
        advice += "Hiện đang có mưa cục bộ, tuyệt đối tránh rải phân đạm urê trực tiếp trên mặt dốc vì rửa trôi mất dưỡng chất nhanh chóng.";
      } else {
        advice += "Khí hậu ổn định, hãy kiểm tra ẩm độ đất trước khi thực hiện tưới bón đợt kế tiếp.";
      }
    } else {
      advice += `Đất đai vùng ${currentLocationName} rất giàu hữu cơ dồi dào. `;
      if (isRaining) {
        advice += "Mưa đang diễn ra, khuyến khích kiểm tra các rãnh thoát lũ xung quanh mô gốc sầu riêng để phòng tránh bệnh thối rễ do Phytophthora.";
      } else {
        advice += "Thời tiết thuận tiện cho việc phát cành tăm dọn thoáng chân gốc.";
      }
    }
    return advice;
  };

  return (
    <div className="glass p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-brand-surface to-amber-500/10 dark:from-amber-500/5 dark:to-amber-500/15 shadow-xl space-y-4">
      {/* Title block */}
      <div className="flex justify-between items-start pb-2 border-b border-brand-high">
        <div className="space-y-0.5">
          <h3 className="font-display font-bold text-base text-brand-primary flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-brand-primary" /> Lịch Mùa Vụ Thông Minh
          </h3>
          <p className="text-[10px] text-brand-text-variant font-medium">Gợi ý gieo trồng & thu hoạch tối ưu cho Tây Nguyên</p>
        </div>
        <div className="bg-brand-tertiary/10 text-brand-tertiary border border-brand-tertiary/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Tháng {currentMonthIdx + 1}
        </div>
      </div>

      {/* Navigation selectors for Crop list */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {CROPS_DATA.map(crop => (
          <button
            key={crop.id}
            onClick={() => setSelectedCropId(crop.id)}
            id={`btn-crop-select-${crop.id}`}
            className={`flex-shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedCropId === crop.id
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10"
                : "bg-brand-surface border border-brand-high text-brand-text-variant hover:bg-brand-surface-dim"
            }`}
          >
            {crop.name}
          </button>
        ))}
      </div>

      {/* Main active crop card details */}
      <div className="bg-brand-surface-dim/50 p-4 rounded-2xl border border-brand-high space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-display font-bold text-sm text-brand-text">{activeCrop.name}</h4>
            <p className="text-[10px] italic text-brand-text-variant">{activeCrop.scientificName} • {activeCrop.type}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${getStatusBadge(activeCrop.schedule[currentMonthIdx]).class}`}>
            {getStatusBadge(activeCrop.schedule[currentMonthIdx]).label}
          </span>
        </div>

        {/* 12-Month Grid Timeline display */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-wider">Biểu đồ tiến độ 12 tháng:</p>
          <div className="grid grid-cols-12 gap-1 text-center">
            {activeCrop.schedule.map((status, index) => {
              const isCurrent = index === currentMonthIdx;
              const colorMap = {
                planting: "bg-emerald-500 text-white",
                care: "bg-sky-500 text-white",
                harvest: "bg-amber-500 text-white",
                dormant: "bg-brand-high text-brand-text-variant dark:bg-brand-high/40"
              };

              return (
                <div 
                  key={index} 
                  className={`flex flex-col items-center p-1 rounded-lg transition-all ${
                    isCurrent ? "ring-2 ring-brand-primary ring-offset-1 ring-offset-brand-surface" : ""
                  }`}
                  title={`Tháng ${index + 1}: ${getStatusBadge(status).label}`}
                >
                  <div className={`w-full h-4.5 rounded-md flex items-center justify-center text-[8px] font-black ${colorMap[status]}`}>
                    {index + 1}
                  </div>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1 animate-ping"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend color guide */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold text-brand-text-variant pt-1 border-t border-brand-high">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Gieo trồng
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-sky-500"></span> Chăm sóc bón phân
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Thu hoạch
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-brand-high border border-brand-high"></span> Dưỡng cây
          </div>
        </div>
      </div>

      {/* Geographically adapted AI recommendations */}
      <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 space-y-2">
        <div className="flex items-center gap-1.5 text-brand-primary">
          <Info className="w-4 h-4" />
          <h4 className="font-display font-bold text-xs uppercase tracking-wide">Điều kiện canh tác tại {currentLocationName}</h4>
        </div>
        <p className="text-[11px] leading-relaxed text-brand-text-variant font-light">
          {getSmartGeoAdvice()}
        </p>
      </div>

      {/* Toggle button to expand agricultural criteria */}
      <button
        onClick={() => setExpandedInfo(!expandedInfo)}
        id="btn-toggle-crop-detail-calendar"
        className="w-full flex items-center justify-between py-2 px-3 text-xs font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 rounded-xl transition-all cursor-pointer border border-brand-high"
      >
        <span>{expandedInfo ? "Ẩn kỹ thuật chi tiết" : "Xem kỹ thuật canh tác chi tiết"}</span>
        {expandedInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded detailed specifications */}
      <AnimatePresence>
        {expandedInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3 pt-1 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-brand-surface border border-brand-high rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-brand-text-variant uppercase block">Đất trồng tối ưu</span>
                <p className="font-bold text-brand-text text-[11px] leading-tight">{activeCrop.optimalSoil}</p>
              </div>
              <div className="p-3 bg-brand-surface border border-brand-high rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-brand-text-variant uppercase block">Mật độ & Khoảng cách</span>
                <p className="font-bold text-brand-text text-[11px] leading-tight">{activeCrop.spacing}</p>
              </div>
            </div>

            <div className="p-3 bg-brand-surface border border-brand-high rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-brand-primary">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mẹo vàng chăm sóc qua các tháng:</span>
              </div>
              <ul className="space-y-1.5 pl-1.5">
                {activeCrop.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-[11px] leading-relaxed text-brand-text font-light">
                    <span className="text-brand-primary font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
