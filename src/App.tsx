import React, { useState, useEffect } from "react";
import { 
  Home, 
  Scan, 
  Activity, 
  BookOpen, 
  Layers,
  HelpCircle,
  Menu,
  ChevronRight,
  Sprout,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ActiveTab } from "./types";
import TabHome from "./components/TabHome";
import TabScan from "./components/TabScan";
import TabSoil from "./components/TabSoil";
import TabDiary from "./components/TabDiary";
import VtnnLogo from "./components/VtnnLogo";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Render active tab panel
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <TabHome onTabChange={setActiveTab} isOnline={isOnline} setIsOnline={setIsOnline} />;
      case "scan":
        return <TabScan />;
      case "soil":
        return <TabSoil />;
      case "diary":
        return <TabDiary />;
      default:
        return <TabHome onTabChange={setActiveTab} isOnline={isOnline} setIsOnline={setIsOnline} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text flex flex-col antialiased overflow-x-hidden relative transition-colors duration-300">
      {/* Decorative ambient background glows */}
      <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-[#d95d14]/4 rounded-full blur-[110px] pointer-events-none z-0"></div>
      <div className="absolute top-20 -right-20 w-80 h-80 bg-[#1b4332]/4 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Upper outer desktop frame */}
      <div className="flex-1 w-full max-w-lg mx-auto bg-brand-surface-bright/40 backdrop-blur-md shadow-xl md:border-x md:border-brand-high min-h-screen flex flex-col relative pb-28 z-10 transition-colors duration-300">
        
        {/* Global Top Brand Header with Theme and Help buttons */}
        <div className="px-5 pt-5 flex-shrink-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-[#01140e] via-[#022c22] to-[#011c14] shadow-xl shadow-emerald-950/40 relative overflow-hidden">
            {/* Gloss shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              {/* Premium agricultural brand logo wrapper with high-contrast white ring */}
              <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-white border border-emerald-400 flex items-center justify-center shadow-md shadow-emerald-950/30 transform hover:scale-105 transition-all duration-300">
                <VtnnLogo size={46} className="w-11.5 h-11.5" />
              </div>

              <div>
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 bg-clip-text text-transparent font-display font-extrabold text-[22px] tracking-[0.06em] block leading-none drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.85)]">VTNN 181</span>
                <span className="text-[9px] text-emerald-200 font-extrabold uppercase tracking-[0.24em] block mt-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">Đồng Hành Cùng Nhà Nông</span>
              </div>
            </div>
            
            {/* Actions group */}
            <div className="flex items-center gap-1.5 relative z-10">
              {/* Connection status toggle */}
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-extrabold tracking-wider uppercase transition-all border cursor-pointer ${
                  isOnline 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30" 
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                }`}
                title="Bấm để chuyển đổi trạng thái"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </button>
 
              {/* Theme Mode Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                id="theme-toggle-header"
                className="p-2 rounded-xl text-amber-400 bg-emerald-900/40 hover:bg-emerald-900/60 transition-colors border border-emerald-500/30 cursor-pointer flex items-center justify-center w-9 h-9"
                title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" /> : <Moon className="w-4.5 h-4.5 text-emerald-300" />}
              </button>
 
              {/* Help button */}
              <button
                onClick={() => setShowHelpModal(true)}
                id="btn-help-circle-header"
                className="p-2 rounded-xl text-amber-400 bg-emerald-900/40 hover:bg-emerald-900/60 transition-colors border border-emerald-500/30 cursor-pointer flex items-center justify-center w-9 h-9"
                title="Hướng dẫn sử dụng"
              >
                <HelpCircle className="w-4.5 h-4.5 text-emerald-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        <main className="flex-1 px-5 pt-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Custom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-brand-surface-bright/90 backdrop-blur-xl border-t border-brand-high px-4 py-4.5 z-40 shadow-xl flex items-center justify-around">
          
          {/* Trang chủ Tab Button */}
          <button
            onClick={() => setActiveTab("home")}
            className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
              activeTab === "home"
                ? "text-white font-bold scale-102"
                : "text-brand-text-variant hover:text-brand-primary font-medium hover:bg-brand-primary/5"
            }`}
          >
            {activeTab === "home" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-brand-primary rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-1.5">
              <Home className="w-4.5 h-4.5" />
              <span className="text-[10.5px] tracking-[0.05em] uppercase font-semibold leading-none">Trang chủ</span>
            </span>
          </button>

          {/* Quét bệnh Tab Button */}
          <button
            onClick={() => setActiveTab("scan")}
            className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
              activeTab === "scan"
                ? "text-white font-bold scale-102"
                : "text-brand-text-variant hover:text-brand-primary font-medium hover:bg-brand-primary/5"
            }`}
          >
            {activeTab === "scan" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-brand-primary rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-1.5">
              <Scan className="w-4.5 h-4.5" />
              <span className="text-[10.5px] tracking-[0.05em] uppercase font-semibold leading-none">Quét bệnh</span>
            </span>
          </button>

          {/* Đất đai Tab Button */}
          <button
            onClick={() => setActiveTab("soil")}
            className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
              activeTab === "soil"
                ? "text-white font-bold scale-102"
                : "text-brand-text-variant hover:text-brand-primary font-medium hover:bg-brand-primary/5"
            }`}
          >
            {activeTab === "soil" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-brand-primary rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-1.5">
              <Activity className="w-4.5 h-4.5" />
              <span className="text-[10.5px] tracking-[0.05em] uppercase font-semibold leading-none">Đất đai</span>
            </span>
          </button>

          {/* Nhật ký Tab Button */}
          <button
            onClick={() => setActiveTab("diary")}
            className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
              activeTab === "diary"
                ? "text-white font-bold scale-102"
                : "text-brand-text-variant hover:text-brand-primary font-medium hover:bg-brand-primary/5"
            }`}
          >
            {activeTab === "diary" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-brand-primary rounded-xl z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5" />
              <span className="text-[10.5px] tracking-[0.05em] uppercase font-semibold leading-none">Nhật ký</span>
            </span>
          </button>

        </nav>
      </div>

      {/* Help Quickstart Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-surface max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border border-brand-high z-50"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-display font-bold text-xl text-brand-primary tracking-wide">Hướng Dẫn Sử Dụng</h3>
                </div>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  id="btn-close-help-modal-global"
                  className="bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary p-2 rounded-full text-xs font-bold w-8 h-8 flex items-center justify-center transition-colors border border-brand-primary/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm leading-relaxed max-h-96 overflow-y-auto pr-1 text-brand-text">
                <p className="font-light text-brand-text-variant text-xs">
                  Chào mừng bác đến với ứng dụng <strong>VTNN 181</strong>. Dưới đây là hướng dẫn nhanh cách sử dụng 4 tính năng chính hỗ trợ nhà nông:
                </p>
                
                {/* Feature 1 */}
                <div className="space-y-1 p-3 rounded-2xl bg-brand-surface-dim border border-brand-high">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
                      <Scan className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-brand-primary">1. Chẩn đoán bệnh lá (Quét bệnh)</h4>
                  </div>
                  <p className="text-[11px] text-brand-text-variant pl-8 font-light">
                    Bác chuyển sang tab <strong>Quét bệnh</strong>, sau đó chụp ảnh trực tiếp lá cây bị vàng, úa, rỉ sắt hoặc chọn một mẫu ảnh có sẵn để AI thông minh phân tích ngay triệu chứng, nguyên nhân và đưa ra giải pháp trị bệnh chính xác.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="space-y-1 p-3 rounded-2xl bg-brand-surface-dim border border-brand-high">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-brand-primary">2. Kiểm tra dinh dưỡng đất</h4>
                  </div>
                  <p className="text-[11px] text-brand-text-variant pl-8 font-light">
                    Vào tab <strong>Đất đai</strong> để xem phân tích các hàm lượng Nitơ (N), Photpho (P), Kali (K), độ ẩm, độ pH của đất đỏ Di Linh. Hệ thống sẽ gợi ý bác nên bổ sung loại phân bón nào và cách cải tạo đất tơi xốp hơn.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="space-y-1 p-3 rounded-2xl bg-brand-surface-dim border border-brand-high">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-brand-primary">3. Ghi chép Nhật ký vườn</h4>
                  </div>
                  <p className="text-[11px] text-brand-text-variant pl-8 font-light">
                    Mở tab <strong>Nhật ký</strong> để lưu lại các sự kiện như ngày tưới tiêu, bón phân, thu hoạch. Giúp bác dễ dàng theo dõi lịch sử sinh trưởng của cây qua từng mùa vụ.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="space-y-1 p-3 rounded-2xl bg-brand-surface-dim border border-brand-high">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-bold text-sm text-brand-primary">4. Ủ phân compost & Gọi hỗ trợ</h4>
                  </div>
                  <p className="text-[11px] text-brand-text-variant pl-8 font-light">
                    Nhấp vào biểu ngữ <strong>Ủ phân compost</strong> ở trang chủ để học cách ủ phân hữu cơ tuyệt vời tại nhà. Nếu cần kỹ sư hỗ trợ trực tiếp, hãy nhấn nút gọi Hotline hoặc nhắn tin Zalo bên dưới trang chủ.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-brand-primary hover:bg-brand-primary-light text-white py-3.5 rounded-2xl font-bold transition-all active:scale-98 cursor-pointer text-sm"
              >
                Tôi đã hiểu, bắt đầu thôi!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
