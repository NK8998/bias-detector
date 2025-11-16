"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FairnessSlices } from "@/types";
import { FairnessSlice } from "@/types";

export function FairnessSliceChart({
  feature,
  ranges,
}: {
  feature: string;
  ranges: { [range: string]: FairnessSlice };
}) {
  const data = Object.entries(ranges).map(([range, val]) => ({
    range,
    accuracy: Number((val.accuracy * 100).toFixed(2)),
    selection_rate: Number((val.selection_rate * 100).toFixed(2)),
    count: val.count,
  }));

  return (
    <Card className='bg-white border shadow-sm'>
      <CardHeader>
        <CardTitle className='capitalize text-gray-800'>
          {feature.replaceAll("_", " ")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className='w-full h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='range' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />

              <Bar dataKey='accuracy' fill='#2563eb' name='Accuracy (%)' />
              <Bar
                dataKey='selection_rate'
                fill='#16a34a'
                name='Selection Rate (%)'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className='text-xs text-gray-600 mt-3'>
          *Accuracy and selection rate are scaled to percentages for clarity.
        </p>
      </CardContent>
    </Card>
  );
}

export default function FairnessSlicesSection({
  FairModelSlices,
  BiasedModelSlices,
}: {
  FairModelSlices?: FairnessSlices;
  BiasedModelSlices?: FairnessSlices;
}) {
  return (
    <section className='mt-12'>
      {/* Explanation */}
      <Card className='bg-white border shadow-sm mb-8'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-gray-800'>
            📊 Fairness Slices Overview
          </CardTitle>
          <CardDescription className='text-gray-700'>
            Fairness slices help you understand how the model performs across
            different segments of your dataset. Each feature (like income,
            credit score, or loan term) is divided into ranges. For each slice,
            we examine:
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ul className='list-disc pl-6 text-gray-700 space-y-2'>
            <li>
              <strong>Accuracy:</strong> How often the model is correct for this
              slice.
            </li>
            <li>
              <strong>Selection Rate:</strong> How often applicants in this
              slice are approved.
            </li>
            <li>
              <strong>Count:</strong> How many applicants fall in this range.
            </li>
          </ul>

          <p className='mt-4 text-gray-700 leading-relaxed'>
            Large differences between slices can signal potential bias. For
            example, if applicants with lower credit scores have a near-zero
            approval rate compared to others, the model may be
            disproportionately penalizing them.
          </p>
        </CardContent>
      </Card>

      {/* Tabs for Fair vs Biased */}
      <Tabs defaultValue='fair' className='w-full'>
        <TabsList className='mb-6'>
          <TabsTrigger value='fair'>Fair Model</TabsTrigger>
          <TabsTrigger value='biased'>Biased Model</TabsTrigger>
        </TabsList>

        {/* Fair Model */}
        <TabsContent value='fair'>
          <div className='space-y-8 grid grid-cols-2 gap-3'>
            {FairModelSlices &&
              Object.entries(FairModelSlices).map(([feature, ranges]) => (
                <FairnessSliceChart
                  key={feature}
                  feature={feature}
                  ranges={ranges}
                />
              ))}
          </div>
        </TabsContent>

        {/* Biased Model */}
        <TabsContent value='biased'>
          <div className='space-y-8 grid grid-cols-2 gap-3'>
            {BiasedModelSlices &&
              Object.entries(BiasedModelSlices).map(([feature, ranges]) => (
                <FairnessSliceChart
                  key={feature}
                  feature={feature}
                  ranges={ranges}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
