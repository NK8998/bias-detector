"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Treemap,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export function VisualizeDataset({ file }: { file: File }) {
  const [parsed, setParsed] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse CSV file
  useEffect(() => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        setParsed(res.data);
        setLoading(false);
      },
    });
  }, [file]);

  // Loading state
  if (loading) {
    return (
      <Card className='p-6 my-6'>
        <CardTitle>Visualizing Dataset…</CardTitle>
        <div className='flex gap-4 mt-4'>
          <Skeleton className='h-40 w-full' />
        </div>
      </Card>
    );
  }

  // Empty check
  if (!parsed || parsed.length === 0) {
    return (
      <Card className='p-6 my-6'>
        <CardTitle>No data found in file.</CardTitle>
      </Card>
    );
  }

  const sample = parsed[0];
  const columns = Object.keys(sample);

  // Identify numeric vs categorical
  const numericCols = columns.filter((c) => typeof sample[c] === "number");
  const categoricalCols = columns.filter((c) => typeof sample[c] !== "number");

  // Numeric histogram builder
  function histogram(col: string) {
    if (!parsed?.length) return [];

    const values = parsed
      .map((r) => r[col])
      .filter((v) => typeof v === "number");

    if (!values.length) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 10;
    const step = (max - min) / bins;

    const buckets = Array.from({ length: bins }, (_, i) => ({
      name: `${(min + i * step).toFixed(0)} - ${(min + (i + 1) * step).toFixed(
        0
      )}`,
      count: 0,
    }));

    for (const v of values) {
      const index = Math.min(Math.floor((v - min) / step), bins - 1);
      buckets[index].count++;
    }

    return buckets;
  }

  // Categorical frequency counter
  function categoricalCount(col: string) {
    const map: any = {};

    if (!parsed?.length) return [];

    parsed.forEach((row) => {
      const key = String(row[col]);
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([k, v]) => ({
      name: k,
      count: v as number,
    }));
  }

  return (
    <Card className='p-6 my-6'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold tracking-tight'>
          Dataset: {file.name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue='numeric' className='w-full'>
          <TabsList className='mb-6'>
            <TabsTrigger value='numeric'>Numeric Columns</TabsTrigger>
            <TabsTrigger value='categorical'>Categorical Columns</TabsTrigger>
          </TabsList>

          {/* --- NUMERIC TABS --- */}
          <TabsContent value='numeric'>
            {numericCols.length === 0 ? (
              <p className='text-gray-600'>No numeric columns detected.</p>
            ) : (
              <ScrollArea className='h-[600px] pr-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {numericCols.slice(0, 8).map((col, i) => (
                    <Card key={col} className='p-4 shadow-sm'>
                      <CardHeader>
                        <CardTitle className='text-lg font-semibold text-gray-900'>
                          {col}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width='100%' height={250}>
                          {i % 2 === 0 ? (
                            <AreaChart data={histogram(col)}>
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis dataKey='name' hide />
                              <YAxis />
                              <Tooltip />
                              <Area dataKey='count' />
                            </AreaChart>
                          ) : (
                            <LineChart data={histogram(col)}>
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis dataKey='name' hide />
                              <YAxis />
                              <Tooltip />
                              <Line dataKey='count' strokeWidth={2} />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* --- CATEGORICAL TABS --- */}
          <TabsContent value='categorical'>
            {categoricalCols.length === 0 ? (
              <p className='text-gray-600'>No categorical columns detected.</p>
            ) : (
              <ScrollArea className='h-[600px] pr-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {categoricalCols.slice(0, 8).map((col, i) => (
                    <Card key={col} className='p-4 shadow-sm'>
                      <CardHeader>
                        <CardTitle className='text-lg font-semibold text-gray-900'>
                          {col}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width='100%' height={250}>
                          {i % 2 === 0 ? (
                            <PieChart>
                              <Tooltip />
                              <Pie
                                data={categoricalCount(col)}
                                dataKey='count'
                                nameKey='name'
                                outerRadius={90}
                                label
                              />
                            </PieChart>
                          ) : (
                            <Treemap
                              data={categoricalCount(col)}
                              dataKey='count'
                              nameKey='name'
                              stroke='#fff'
                            />
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function VisualizeDatasetsSection({
  fairModelFile,
  biasedModelFile,
}: {
  fairModelFile?: File;
  biasedModelFile?: File;
}) {
  const hasNoFiles = !fairModelFile && !biasedModelFile;

  return (
    <section className='mt-10'>
      <div className='mb-6'>
        <h2 className='text-3xl font-extrabold text-gray-800 mb-2'>
          📂 Visualize Datasets
        </h2>
        <p className='text-gray-600 max-w-4xl'>
          Explore and visualize the datasets used for training the Fair and
          Biased models. Understanding the data distribution helps uncover
          potential sources of bias.
        </p>
      </div>

      {/* No datasets uploaded */}
      {hasNoFiles && (
        <Card className='p-6 bg-white border'>
          <CardTitle className='text-xl mb-2'>
            No datasets uploaded yet
          </CardTitle>
          <p className='text-gray-600'>
            Upload the Fair and/or Biased dataset above to begin visualizing.
          </p>
        </Card>
      )}

      <div className='grid grid-cols-1 gap-8'>
        {/* --- FAIR DATASET --- */}
        {fairModelFile && (
          <Collapsible className='bg-white shadow-sm border rounded-xl'>
            <CardHeader className='flex flex-row items-center justify-between py-4'>
              <div>
                <CardTitle className='text-2xl font-semibold text-green-700'>
                  Fair Dataset
                </CardTitle>
                <p className='text-gray-500 text-sm'>
                  Visualizing the balanced dataset used for the fair model.
                </p>
              </div>

              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <ChevronDown className='h-5 w-5 transition-all data-[state=open]:rotate-180' />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>

            <CollapsibleContent>
              <CardContent>
                <VisualizeDataset file={fairModelFile} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* --- BIASED DATASET --- */}
        {biasedModelFile && (
          <Collapsible className='bg-white shadow-sm border rounded-xl'>
            <CardHeader className='flex flex-row items-center justify-between py-4'>
              <div>
                <CardTitle className='text-2xl font-semibold text-red-700'>
                  Biased Dataset
                </CardTitle>
                <p className='text-gray-500 text-sm'>
                  Visualizing the biased dataset and its distribution patterns.
                </p>
              </div>

              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <ChevronDown className='h-5 w-5 transition-all data-[state=open]:rotate-180' />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>

            <CollapsibleContent>
              <CardContent>
                <VisualizeDataset file={biasedModelFile} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </section>
  );
}
