"use client";

import { createContext, SetStateAction, useContext, useState } from "react";

interface AppContextType {
  fairModelFile: File | null;
  setFairModelFile: React.Dispatch<SetStateAction<File | null>>;
  biasedModelFile: File | null;
  setBiasedModelFile: React.Dispatch<SetStateAction<File | null>>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [fairModelFile, setFairModelFile] = useState<File | null>(null);
  const [biasedModelFile, setBiasedModelFile] = useState<File | null>(null);

  return (
    <AppContext.Provider
      value={{
        fairModelFile,
        setFairModelFile,
        biasedModelFile,
        setBiasedModelFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
