import React from "react";
import { GLASS_CARD } from "../util/util";

// The shape of the inputs controlled by your sliders
export interface ApplicantInputs {
  income: number;
  loanAmount: number;
  credit: number;
  age: number;
  gender_Male: number; // 1 or 0
}

interface ApplicantSlidersProps {
  inputs: ApplicantInputs;
  setInputs: React.Dispatch<React.SetStateAction<ApplicantInputs>>;
}

export const ApplicantSliders: React.FC<ApplicantSlidersProps> = ({
  inputs,
  setInputs,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    setInputs((prev) => ({
      ...prev,
      [name]: name === "gender_Male" ? (checked ? 1 : 0) : parseFloat(value),
    }));
  };

  const Slider: React.FC<{
    name: keyof ApplicantInputs;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    displayUnit?: string;
  }> = ({ name, label, min, max, step, displayUnit = "" }) => (
    <div className='space-y-1'>
      <label className='text-gray-300 text-sm font-medium flex justify-between'>
        <span>{label}</span>
        <span className='font-mono text-blue-400'>
          {inputs[name].toFixed(0) + displayUnit}
        </span>
      </label>

      {name === "gender_Male" ? (
        <label className='relative inline-flex items-center cursor-pointer'>
          <input
            type='checkbox'
            name={name}
            checked={inputs[name] === 1}
            onChange={handleSliderChange}
            className='sr-only peer'
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className='ml-3 text-sm font-medium text-gray-300'>
            {inputs[name] === 1 ? "Male" : "Female/Other"}
          </span>
        </label>
      ) : (
        <input
          type='range'
          name={name}
          min={min}
          max={max}
          step={step}
          value={inputs[name]}
          onChange={handleSliderChange}
          className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg'
        />
      )}
    </div>
  );

  return (
    <div className={`p-6 space-y-6 ${GLASS_CARD}`}>
      <h3 className='text-2xl font-bold text-white'>Hypothetical Applicant</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Slider
          name='income'
          label='Income Proxy ($)'
          min={10000}
          max={100000}
          step={500}
          displayUnit='$'
        />
        <Slider
          name='loanAmount'
          label='Loan Amount (USD)'
          min={1000}
          max={20000}
          step={500}
          displayUnit='$'
        />
        <Slider
          name='credit'
          label='Credit Score Proxy (0-100)'
          min={0}
          max={100}
          step={1}
        />
        <Slider name='age' label='Age' min={18} max={70} step={1} />
      </div>

      <div className='pt-4 border-t border-gray-700'>
        <Slider name='gender_Male' label='Gender (Sensitive Feature)' />
      </div>
    </div>
  );
};
