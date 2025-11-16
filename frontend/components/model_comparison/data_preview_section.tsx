import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Papa from "papaparse";

export function DataPreview({ file }: { file: File | null }) {
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data.slice(0, 7); // limit to 7 rows
        setRows(data);
        setHeaders(Object.keys(data[0] || {}));
      },
    });
  }, [file]);

  if (!file) return null;

  return (
    <div className='w-full overflow-auto border rounded-xl bg-white shadow-sm max-h-80'>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h} className='whitespace-nowrap text-black'>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {headers.map((h) => (
                <TableCell key={h} className='whitespace-nowrap text-gray-700'>
                  {row[h] ?? ""}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DataPreviewSection({
  fairModelFile,
  biasedModelFile,
}: {
  fairModelFile: File | null;
  biasedModelFile: File | null;
}) {
  return (
    <section className='mt-6 flex flex-col  gap-6 w-full max-w-full'>
      <div className='flex-1'>
        <h2 className='font-semibold mb-2'>Fair Model Data Preview</h2>
        <DataPreview file={fairModelFile} />
      </div>
      <div className='flex-1'>
        <h2 className='font-semibold mb-2'>Biased Model Data Preview</h2>
        <DataPreview file={biasedModelFile} />
      </div>
    </section>
  );
}
