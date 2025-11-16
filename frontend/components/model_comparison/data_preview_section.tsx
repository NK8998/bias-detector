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
import Modal from "../reusables/modal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Eye } from "lucide-react";

export function DataPreview({ file }: { file: File | null }) {
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data.slice(0, 20); // limit to 20 rows
        setRows(data);
        setHeaders(Object.keys(data[0] || {}));
      },
    });
  }, [file]);

  if (!file) return null;

  return (
    <div className='w-full overflow-auto border rounded-xl bg-white shadow-sm max-h-150'>
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
  const [biasedModalOpen, setBiasedModalOpen] = useState(false);
  const [fairModalOpen, setFairModalOpen] = useState(false);

  return (
    <section className='mt-10'>
      <div className='mb-6'>
        <h2 className='text-3xl font-extrabold text-gray-800 mb-2'>
          🔬 Inspect Data Samples
        </h2>
        <p className='text-gray-600 max-w-4xl'>
          Click the cards below to view an expanded preview of the raw CSV data
          for each model. This is essential for verifying feature names and
          observing dataset balance (or lack thereof).
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-full'>
        {/* Fair Model Toggle Button */}
        <Card
          className='cursor-pointer hover:shadow-lg transition-shadow border-green-200 hover:bg-green-50/50'
          onClick={() => fairModelFile && setFairModalOpen(true)}
        >
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-semibold text-green-600'>
              Fair Dataset Preview
            </CardTitle>
            <Eye className='h-5 w-5 text-green-500' />
          </CardHeader>
          <CardContent>
            <p className='text-sm text-gray-500'>
              {fairModelFile
                ? `View the first 50 rows of ${fairModelFile.name}`
                : "Upload the Fair Dataset first to view."}
            </p>
          </CardContent>
        </Card>

        {/* Biased Model Toggle Button */}
        <Card
          className='cursor-pointer hover:shadow-lg transition-shadow border-red-200 hover:bg-red-50/50'
          onClick={() => biasedModelFile && setBiasedModalOpen(true)}
        >
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-semibold text-red-600'>
              Biased Dataset Preview
            </CardTitle>
            <Eye className='h-5 w-5 text-red-500' />
          </CardHeader>
          <CardContent>
            <p className='text-sm text-gray-500'>
              {biasedModelFile
                ? `View the first 20 rows of ${biasedModelFile.name}`
                : "Upload the Biased Dataset first to view."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Modals for Data Preview --- */}

      {/* Fair Model Modal */}
      <Modal
        isOpen={fairModalOpen}
        setIsOpen={setFairModalOpen}
        title='Fair Dataset Preview'
      >
        <DataPreview file={fairModelFile} />
      </Modal>

      {/* Biased Model Modal */}
      <Modal
        isOpen={biasedModalOpen}
        setIsOpen={setBiasedModalOpen}
        title='Biased Dataset Preview'
      >
        <DataPreview file={biasedModelFile} />
      </Modal>
    </section>
  );
}
