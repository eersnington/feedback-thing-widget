import React, { createContext, useContext, useState, ReactNode } from "react";

type FeedbackType = string;

interface FeedbackContextType {
  feedbackType: FeedbackType;
  setFeedbackType: React.Dispatch<React.SetStateAction<FeedbackType>>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

interface FeedbackProviderProps {
  children: ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({
  children,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("");

  console.log("Feedback Type: ", feedbackType);

  return (
    <FeedbackContext.Provider value={{ feedbackType, setFeedbackType }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};
