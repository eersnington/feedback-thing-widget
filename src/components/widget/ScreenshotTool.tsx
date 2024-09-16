import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

interface ScreenshotToolProps {
  setScreenshot: (screenshot: string) => void;
  setIsCapturing: (isCapturing: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
}

const ScreenshotTool: React.FC<ScreenshotToolProps> = ({
  setScreenshot,
  setIsCapturing,
  setIsOpen,
}) => {
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const selectionRef = useRef<HTMLDivElement>(null);

  const startCapture = (event: MouseEvent) => {
    setSelectionStart({ x: event.clientX, y: event.clientY });
  };

  const updateCapture = (event: MouseEvent) => {
    if (selectionStart) {
      setSelectionEnd({ x: event.clientX, y: event.clientY });
    }
  };

  const endCapture = async () => {
    if (selectionStart && selectionEnd) {
      const left = Math.min(selectionStart.x, selectionEnd.x);
      const top = Math.min(selectionStart.y, selectionEnd.y);
      const width = Math.abs(selectionEnd.x - selectionStart.x);
      const height = Math.abs(selectionEnd.y - selectionStart.y);

      const canvas = await html2canvas(document.body, {
        x: left,
        y: top,
        width: width,
        height: height,
        useCORS: true,
        allowTaint: true,
      });

      const screenshotData = canvas.toDataURL("image/png");
      setScreenshot(screenshotData);
      setIsCapturing(false);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", startCapture);
    document.addEventListener("mousemove", updateCapture);
    document.addEventListener("mouseup", endCapture);
    return () => {
      document.removeEventListener("mousedown", startCapture);
      document.removeEventListener("mousemove", updateCapture);
      document.removeEventListener("mouseup", endCapture);
    };
  }, [selectionStart, selectionEnd]);

  return (
    <div
      ref={selectionRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        cursor: "crosshair",
        zIndex: 9999,
      }}
    >
      {selectionStart && selectionEnd && (
        <div
          style={{
            position: "absolute",
            left: Math.min(selectionStart.x, selectionEnd.x),
            top: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionEnd.x - selectionStart.x),
            height: Math.abs(selectionEnd.y - selectionStart.y),
            border: "2px solid #4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
          }}
        />
      )}
    </div>
  );
};

export default ScreenshotTool;
