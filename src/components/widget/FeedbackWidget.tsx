import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FeedbackForm from "./FeedbackForm";
import ScreenshotTool from "./ScreenshotTool";
import Toast from "./Toast";
import tailwindStyles from "../../index.css?inline";

interface FeedbackWidgetProps {
  projectId?: string | null;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  if (projectId === null || projectId === undefined) {
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

  const handleScreenshot = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsCapturing(true);
    }, 100);
  };

  return (
    <>
      <style>{tailwindStyles}</style>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            </DialogHeader>
            <FeedbackForm
              projectId={projectId}
              setToast={setToast}
              setIsOpen={setIsOpen}
              handleScreenshot={handleScreenshot}
              screenshot={screenshot}
            />
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
      {isCapturing && (
        <ScreenshotTool
          setScreenshot={setScreenshot}
          setIsCapturing={setIsCapturing}
          setIsOpen={setIsOpen}
        />
      )}
      <Toast toast={toast} />
    </>
  );
};

export default FeedbackWidget;
