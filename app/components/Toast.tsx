import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastProps = {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
};

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 text-white rounded shadow-lg transition-opacity duration-300 z-50 ${bgColor} ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}