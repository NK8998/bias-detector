"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

/**
 * FileUpload Component
 * Handles the visual presentation and logic for file drag-and-drop or click-to-upload.
 */
export function FileUpload({
  label,
  highlight,
  file,
  setFile,
}: {
  label: string;
  highlight: "red" | "green"; // Explicitly defined
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  const colorClasses = {
    green: {
      text: "text-green-600",
      border: "border-green-400",
      bg: "bg-green-50",
      hover: "hover:bg-green-100",
    },
    red: {
      text: "text-red-600",
      border: "border-red-400",
      bg: "bg-red-50",
      hover: "hover:bg-red-100",
    },
  };

  const selectedColor = colorClasses[highlight];

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  // Content displayed inside the drop zone
  const dropZoneContent = file ? (
    <div className={`mt-2 text-sm font-medium ${selectedColor.text}`}>
      File uploaded: <span className='font-bold'>{file.name}</span>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center text-center px-4'>
      <Upload className={`w-8 h-8 mb-2 ${selectedColor.text} opacity-70`} />
      <span className='text-gray-700 text-sm font-medium'>
        Click or drag a CSV file here
      </span>
      <span className='text-xs text-gray-500 mt-1'>(Max 5MB, must be CSV)</span>
    </div>
  );

  return (
    <div className='w-full'>
      {/* Label and Remove Button Container */}
      <div className='flex items-center justify-between mb-3'>
        <p
          className={cn("text-lg font-bold tracking-tight", selectedColor.text)}
        >
          {label}
        </p>
        {file && (
          <Button
            variant='ghost'
            size='sm'
            className='text-xs text-gray-500 hover:text-red-600 h-6 p-1'
            onClick={handleRemove}
          >
            <X className='w-4 h-4 mr-1' /> Clear File
          </Button>
        )}
      </div>

      <label
        className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
          selectedColor.border,
          selectedColor.bg,
          selectedColor.hover,
          file ? "border-solid shadow-md" : "border-dashed" // Solid border when file is present
        )}
      >
        {dropZoneContent}
        <Input
          type='file'
          className='hidden'
          accept='.csv'
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </label>
    </div>
  );
}

/**
 * FileUploadSection Component
 * Container for the two FileUpload components with a descriptive header.
 */
export default function FileUploadSection({
  fairModelFile,
  setFairModelFile,
  biasedModelFile,
  setBiasedModelFile,
}: {
  fairModelFile: File | null;
  setFairModelFile: React.Dispatch<React.SetStateAction<File | null>>;
  biasedModelFile: File | null;
  setBiasedModelFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  return (
    <section className='mt-8'>
      <div className='mb-6'>
        <h2 className='text-3xl font-extrabold text-gray-800 mb-2'>
          📤 Upload Datasets for Comparison
        </h2>
        <p className='text-gray-600 max-w-4xl'>
          Please upload two comma-separated value (CSV) files that represent the
          data for your models. The **Fair Dataset** should be balanced, while
          the **Biased Dataset** should contain skewed representation of a
          sensitive feature (e.g., race, gender) to demonstrate bias.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Fair Model Upload */}
        <FileUpload
          label='Fair (Balanced) Dataset'
          highlight='green'
          file={fairModelFile}
          setFile={setFairModelFile}
        />

        {/* Biased Model Upload */}
        <FileUpload
          label='Biased (Skewed) Dataset'
          highlight='red' // Explicitly set the highlight
          file={biasedModelFile}
          setFile={setBiasedModelFile}
        />
      </div>
    </section>
  );
}
