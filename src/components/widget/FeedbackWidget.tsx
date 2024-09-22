import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Star, Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import tailwindStyles from "../../index.css?inline";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useFeedback } from "./FeedbackContext";

const feedbackTypes = [
  { value: "feature", label: "Feature", color: "bg-yellow-300" },
  { value: "bug", label: "Bug", color: "bg-red-300" },
  { value: "question", label: "General Question", color: "bg-blue-400" },
  { value: "other", label: "Other", color: "bg-teal-300" },
];

interface FeedbackWidgetProps {
  projectId?: string | null;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ projectId }) => {
  const { feedbackType, setFeedbackType } = useFeedback();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );
  const selectionRef = useRef<HTMLDivElement>(null);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  console.log("Current feedback type:", feedbackType);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!feedbackType) newErrors.feedbackType = "Please select a feedback type";
    if (!feedback.trim()) newErrors.feedback = "Please provide your feedback";
    if (feedbackType === "feature" && rating === 0)
      newErrors.rating = "Please provide a rating";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string, type: string) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("projectId", projectId as string);
      formData.append("type", feedbackType);
      if (feedbackType === "feature") {
        formData.append("rating", rating.toString());
      }
      formData.append("feedback", feedback);

      if (screenshot) {
        const response = await fetch(screenshot);
        const blob = await response.blob();
        formData.append("screenshot", blob, "screenshot.png");
      }

      const response = await fetch(
        "https://feedback-thing.vercel.app/api/submit-feedback",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      showToast("Feedback submitted successfully!", "success");
      setFeedbackType("");
      setRating(0);
      setFeedback("");
      setScreenshot(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast((error as Error).message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenshot = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsCapturing(true);
    }, 100);
  };

  const startCapture = (event: MouseEvent) => {
    setSelectionStart({ x: event.clientX, y: event.clientY });
  };

  const updateCapture = (event: MouseEvent) => {
    if (selectionStart) {
      setSelectionEnd({ x: event.clientX, y: event.clientY });
    }
  };

  const endCapture = async () => {
    if (isCapturing && selectionStart && selectionEnd) {
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
      setSelectionStart(null);
      setSelectionEnd(null);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (isCapturing) {
      document.addEventListener("mousedown", startCapture);
      document.addEventListener("mousemove", updateCapture);
      document.addEventListener("mouseup", endCapture);
      return () => {
        document.removeEventListener("mousedown", startCapture);
        document.removeEventListener("mousemove", updateCapture);
        document.removeEventListener("mouseup", endCapture);
      };
    }
  }, [isCapturing, selectionStart, selectionEnd]);

  if (projectId === null || projectId == undefined) {
    return (
      <Alert variant="destructive">
        <style>{tailwindStyles}</style>
        <AlertTitle className="fbt-widget items-center justify-center text-center">
          Error
        </AlertTitle>
        <AlertDescription className="fbt-widget items-center justify-center text-center">
          Unable to load the feedback widget. Project ID is missing.
        </AlertDescription>
        <div className="flex justify-center mt-4">
          <a
            href="https://www.feedbackthing.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-violet-500 transition-colors"
          >
            <img
              src="https://www.feedbackthing.pro/favicon.ico"
              alt="Feedbackthing Logo"
              className="h-4 w-4"
            />
            <span>Powered by feedbackthing.pro</span>
          </a>
        </div>
      </Alert>
    );
  }

  return (
    <>
      <style>{tailwindStyles}</style>
      {isCapturing && (
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
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <style>{tailwindStyles}</style>

        <DialogTrigger asChild>
          <Button className="fbt-widget fixed -right-10 bottom-1/2 origin-bottom-left rotate-[-90deg] bg-violet-500 px-4 py-2 text-white hover:bg-violet-600">
            Feedback
          </Button>
        </DialogTrigger>
        <DialogContent className="fbt-widget sm:max-w-[425px] p-0">
          <style>{tailwindStyles}</style>

          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-violet-700 text-xl font-semibold">
                Send us your feedback
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="feedbackType" className="text-violet-700">
                  Feedback Type
                </Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value)}
                >
                  <SelectTrigger
                    id="feedbackType"
                    className="w-full border-violet-300 focus:ring-violet-500"
                  >
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent className="fbt-widget">
                    {feedbackTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${type.color}`}
                          ></span>
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.feedbackType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.feedbackType}
                  </p>
                )}
              </div>

              {feedbackType === "feature" && (
                <div>
                  <Label className="text-violet-700">Feature Rating</Label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {feedbackType === "bug" && (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleScreenshot}
                    className="flex items-center border-violet-300 text-violet-700 hover:bg-violet-50"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Screenshot
                  </Button>
                  {screenshot && (
                    <div className="mt-2">
                      <img
                        src={screenshot}
                        alt="Screenshot"
                        className="max-w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="feedback" className="text-violet-700">
                  Your Feedback
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Please provide your feedback here..."
                  className="w-full border-violet-300 focus:ring-violet-500"
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-violet-500 text-white hover:bg-violet-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </div>
          <div className="bg-gray-50 p-4 flex justify-center rounded-b-lg">
            <a
              href="https://www.feedbackthing.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-violet-500 transition-colors"
            >
              <img
                src="https://www.feedbackthing.pro/favicon.ico"
                alt="Feedbackthing Logo"
                className="h-4 w-4"
              />
              <span>Powered by feedbackthing.pro</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white p-4 rounded-md shadow-lg transition-opacity duration-500 fbt-widget`}
          style={{
            opacity: 1,
            animation: "fadeOut 5s forwards",
          }}
        >
          {toast.message}
        </div>
      )}
      <style>{`
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default FeedbackWidget;
