import React, { useEffect, useState } from "react";

interface ToastProps {
  toast: { message: string; type: string } | null;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${
        toast.type === "error" ? "bg-red-500" : "bg-green-500"
      } text-white p-4 rounded-md shadow-lg transition-opacity duration-500 fbt-widget`}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      {toast.message}
    </div>
  );
};

export default Toast;
