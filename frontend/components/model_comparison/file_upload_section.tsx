"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export function FileUpload({
  label,
  highlight,
  file,
  setFile,
}: {
  label: string;
  highlight?: "red" | "green";
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  const color =
    highlight === "green"
      ? "text-green-600 border-green-600/40"
      : "text-red-600 border-red-600/40";

  return (
    <div className='w-full'>
      <p className={cn("mb-3 text-sm font-medium", color)}>{label}</p>

      <label
        className={cn(
          "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-black/5 hover:bg-black/10 transition-colors",
          color
        )}
      >
        <div className='flex flex-col items-center justify-center text-center px-4'>
          <Upload className='w-8 h-8 mb-2 opacity-80' />
          <span className='text-black/80 text-sm'>
            {file ? file.name : "Click to upload or drag and drop"}
          </span>
        </div>
        <Input
          type='file'
          className='hidden'
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </label>

      {file && (
        <div className='mt-4 text-xs text-gray-700 flex items-center justify-between'>
          <span>{file.name}</span>
          <Button
            variant='outline'
            size='sm'
            className='border-black/20 text-black hover:bg-black hover:text-white'
            onClick={() => setFile(null)}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

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
    <section className='flex flex-col md:flex-row gap-6'>
      <div className='flex-1'>
        <FileUpload
          label='Fair Model'
          highlight='green'
          file={fairModelFile}
          setFile={setFairModelFile}
        />
      </div>
      <div className='flex-1'>
        <FileUpload
          label='Biased Model'
          file={biasedModelFile}
          setFile={setBiasedModelFile}
        />
      </div>
    </section>
  );
}
