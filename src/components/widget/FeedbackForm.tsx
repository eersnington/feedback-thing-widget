import React, { useState } from "react";
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
import { Camera, Star, Loader } from "lucide-react";
import { useFeedback } from "./FeedbackContext";

interface FeedbackFormProps {
  projectId: string;
  setToast: (toast: { message: string; type: string } | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  handleScreenshot: () => void;
  screenshot: string | null;
}

const feedbackTypes = [
  { value: "feature", label: "Feature", color: "bg-yellow-300" },
  { value: "bug", label: "Bug", color: "bg-red-300" },
  { value: "question", label: "General Question", color: "bg-blue-400" },
  { value: "other", label: "Other", color: "bg-teal-300" },
];

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  projectId,
  setToast,
  setIsOpen,
  handleScreenshot,
  screenshot,
}) => {
  const { feedbackType, setFeedbackType } = useFeedback();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
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
        "https://sreenington-nextjs-test.loca.lt/api/submit-feedback",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      setToast({
        message: "Feedback submitted successfully!",
        type: "success",
      });
      setFeedbackType("");
      setRating(0);
      setFeedback("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setToast({ message: (error as Error).message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <Label htmlFor="feedbackType" className="text-violet-700">
          Feedback Type
        </Label>
        <Select
          value={feedbackType}
          onValueChange={(value) => {
            console.log("Select onValueChange called with:", value);
            setFeedbackType(value);
          }}
        >
          <SelectTrigger
            id="feedbackType"
            className="fbt-widget w-full border-violet-300 focus:ring-violet-500"
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
          <p className="text-red-500 text-sm mt-1">{errors.feedbackType}</p>
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
  );
};

export default FeedbackForm;
