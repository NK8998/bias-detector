"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider, // Added TooltipProvider for proper functionality
} from "@/components/ui/tooltip";
import { BiasReport } from "@/types";
import {
  Info,
  CheckCircle,
  XCircle,
  Gauge,
  Handshake,
  TrendingUp,
} from "lucide-react"; // Added icons for metrics

/**
 * MetricRow Component (Enhanced)
 * Helper component for displaying a single metric with a tooltip.
 */
function MetricRow({
  label,
  value,
  tooltip,
  icon: Icon,
}: {
  label: string;
  value: string;
  tooltip: string;
  icon: React.ElementType; // Use React.ElementType for the icon component
}) {
  return (
    <div className='flex items-center justify-between border-b pb-3 last:border-b-0'>
      <div className='flex items-center gap-3'>
        <Icon className='w-5 h-5 text-indigo-500' /> {/* Metric Icon */}
        <span className='font-medium text-gray-700'>{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className='w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors' />
          </TooltipTrigger>
          <TooltipContent className='max-w-xs bg-gray-900 text-white border-none shadow-lg'>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <span className='text-base text-gray-900 font-bold'>{value}</span>
    </div>
  );
}

/**
 * ModelMetrics Component (Enhanced)
 * Displays performance and fairness metrics for a single model.
 */
export function ModelMetrics({
  overall_accuracy,
  approval_rate,
  average_probability,
  bias_flag,
  model,
}: {
  overall_accuracy: number;
  approval_rate: number;
  average_probability: number;
  bias_flag: boolean;
  model: string;
}) {
  const isFair = !bias_flag;
  const colorClass = isFair
    ? "text-green-600 bg-green-50"
    : "text-red-600 bg-red-50";

  return (
    <Card className='bg-white border border-gray-200 shadow-lg w-full transition-shadow hover:shadow-xl'>
      <CardHeader
        className={`border-b ${
          isFair ? "border-green-100" : "border-red-100"
        } p-4`}
      >
        <CardTitle
          className={`text-2xl font-bold flex items-center gap-3 ${
            isFair ? "text-green-700" : "text-red-700"
          }`}
        >
          {model} Model Summary
          {isFair ? (
            <CheckCircle className='w-6 h-6' />
          ) : (
            <XCircle className='w-6 h-6' />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4 p-6'>
        {/* Accuracy */}
        <MetricRow
          label='Overall Accuracy'
          value={`${(overall_accuracy * 100).toFixed(1)}%`}
          tooltip='The percentage of predictions the model got correct. Higher accuracy means more reliable performance, but high accuracy alone does NOT guarantee fairness.'
          icon={Gauge}
        />

        {/* Approval Rate */}
        <MetricRow
          label='Approval Rate'
          value={`${(approval_rate * 100).toFixed(1)}%`}
          tooltip='The overall percentage of applicants the model approves. Bias can appear if this rate differs drastically across demographic groups.'
          icon={Handshake}
        />

        {/* Avg Probability */}
        <MetricRow
          label='Average Confidence'
          value={average_probability.toFixed(3)}
          tooltip='The mean predicted probability (or score) across all samples. This shows how ‘confident’ the model tends to be on average.'
          icon={TrendingUp}
        />

        {/* Bias Flag */}
        <div className='flex items-center justify-between pt-4 mt-4 border-t border-gray-100'>
          <div className='flex items-center gap-2'>
            <span className='font-bold text-lg text-gray-700'>
              Bias Indicator
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='w-4 h-4 text-gray-500 cursor-pointer' />
              </TooltipTrigger>
              <TooltipContent className='max-w-xs bg-gray-900 text-white border-none shadow-lg'>
                <p>
                  This flag signals whether fairness metrics detected potential
                  bias in the model based on the dataset. The specific
                  definition of bias is determined by the underlying fairness
                  metric (e.g., Disparate Impact).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div
            className={`flex items-center gap-2 text-lg font-extrabold px-3 py-1 rounded-full ${colorClass}`}
          >
            {isFair ? (
              <>
                <CheckCircle className='w-5 h-5' />
                Fair
              </>
            ) : (
              <>
                <XCircle className='w-5 h-5' />
                Biased
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ModelMetricsSection Component (Enhanced)
 * Container for comparing the two ModelMetrics cards.
 */
export default function ModelMetricsSection({
  fairModelDataObj,
  biasedModelDataObj,
}: {
  fairModelDataObj?: BiasReport;
  biasedModelDataObj?: BiasReport;
}) {
  if (!fairModelDataObj && !biasedModelDataObj) {
    return null;
  }

  return (
    <section className='mt-10'>
      <div className='mb-6'>
        <h2 className='text-3xl font-extrabold text-gray-800 mb-2'>
          📊 Model Performance & Fairness Comparison
        </h2>
        <p className='text-gray-600 max-w-4xl'>
          Review the overall performance and the primary bias indicator for both
          the **Fair** and **Biased** models. Note that similar overall
          performance (Accuracy) does not imply similar fairness.
        </p>
      </div>

      <TooltipProvider>
        {" "}
        {/* Wrap the comparison in TooltipProvider */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <ModelMetrics
            model='Fair'
            overall_accuracy={fairModelDataObj?.overall_accuracy || 0}
            approval_rate={fairModelDataObj?.approval_rate || 0}
            average_probability={fairModelDataObj?.average_probability || 0}
            bias_flag={fairModelDataObj?.bias_flag || false}
          />
          <ModelMetrics
            model='Biased'
            overall_accuracy={biasedModelDataObj?.overall_accuracy || 0}
            approval_rate={biasedModelDataObj?.approval_rate || 0}
            average_probability={biasedModelDataObj?.average_probability || 0}
            bias_flag={biasedModelDataObj?.bias_flag || false}
          />
        </div>
      </TooltipProvider>
    </section>
  );
}
