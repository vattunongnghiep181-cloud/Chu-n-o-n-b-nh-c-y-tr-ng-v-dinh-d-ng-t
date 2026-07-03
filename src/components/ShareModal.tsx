import React, { useState } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Share2, 
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  contentToShare: string;
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  contentToShare 
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      let success = false;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contentToShare);
        success = true;
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = contentToShare;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          success = true;
        } catch (err) {
          console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textArea);
      }

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: contentToShare,
        });
      } catch (err) {
        console.log("Native share canceled or failed", err);
      }
    } else {
      handleCopy();
    }
  };

  const shareToZalo = () => {
    // Copy content first for easy pasting
    handleCopy();
    // Open Zalo web or deep link
    window.open("https://zalo.me", "_blank", "noopener,noreferrer");
  };

  const shareToMessenger = () => {
    handleCopy();
    window.open("https://messenger.com", "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-brand-surface to-brand-surface-dim border border-brand-high shadow-2xl rounded-3xl p-6 overflow-hidden z-10"
          >
            {/* Top close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-brand-text-variant hover:text-brand-text p-1.5 hover:bg-brand-primary/5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-5 pr-8 space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Tính năng chia sẻ nhanh</span>
              <h3 className="font-display font-bold text-xl text-brand-text leading-snug">
                {title}
              </h3>
              <p className="text-xs text-brand-text-variant font-light">
                {subtitle}
              </p>
            </div>

            {/* Content preview container */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-text-variant uppercase tracking-wider">Xem trước nội dung:</span>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied 
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                      : "bg-brand-primary/5 text-brand-primary border border-brand-primary/10 hover:bg-brand-primary/10"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 animate-scaleIn" />
                      Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sao chép tất cả
                    </>
                  )}
                </button>
              </div>
              <div className="bg-brand-low/50 dark:bg-brand-surface-dim border border-brand-high p-4 rounded-2xl max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed text-brand-text whitespace-pre-wrap select-all">
                {contentToShare}
              </div>
            </div>

            {/* Sharing Options */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-text-variant uppercase tracking-wider block">Chọn nền tảng chia sẻ:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Zalo option */}
                <button
                  onClick={shareToZalo}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/5 to-sky-500/10 hover:from-sky-500/10 hover:to-sky-500/15 text-left transition-all active:scale-98 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-500 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-brand-text">Chia sẻ qua Zalo</h4>
                      <p className="text-[10px] text-brand-text-variant">Sao chép & mở Zalo</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-sky-500/70 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Facebook Messenger option */}
                <button
                  onClick={shareToMessenger}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-blue-500/10 hover:from-blue-500/10 hover:to-blue-500/15 text-left transition-all active:scale-98 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-brand-text">Gửi qua Messenger</h4>
                      <p className="text-[10px] text-brand-text-variant">Sao chép & mở Chat</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-500/70 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Native System Share if available */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <Share2 className="w-4 h-4" />
                  Chia sẻ hệ thống (Zalo, Viber, SMS...)
                </button>
              )}
            </div>

            {/* Instruction tooltip */}
            <div className="mt-5 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-[11px] text-brand-primary font-medium text-center leading-relaxed">
              💡 <strong className="font-bold">Mẹo hay:</strong> Khi nhấn chọn nền tảng, hệ thống sẽ <strong className="font-bold">tự động sao chép</strong> toàn bộ văn bản để bạn sẵn sàng dán (Paste) ngay vào tin nhắn trao đổi với kỹ sư!
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
