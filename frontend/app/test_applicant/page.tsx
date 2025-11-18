"use client";

import { useState } from "react";
import Navbar from "@/components/reusables/navbar";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BackendService } from "@/services/backend_service";
import Footer from "@/components/reusables/footer";

export default function TestApplicantPage() {
  const [applicant, setApplicant] = useState({
    no_of_dependents: 4,
    education: 0,
    self_employed: 1,
    income_annum: 60000,
    loan_amount: 150000,
    loan_term: 360,
    cibil_score: 750,
    residential_assets_value: 300000,
    commercial_assets_value: 50000,
    luxury_assets_value: 20000,
    bank_asset_value: 150000,
  });

  const [result, setResult] = useState<null | {
    probability: number;
    approved: boolean;
  }>(null);

  async function handleEvaluate() {
    const res = await BackendService.predictSingle(
      applicant,
      "logistic_regression",
      false
    );
    console.log("Single Applicant Result:", res);
    setResult(res);
  }

  const update = (field: string, value: number) => {
    setApplicant((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className='min-h-screen bg-gray-50 font-sans text-black'>
      <Navbar />

      <main className='px-8 max-w-[1300px] mx-auto flex flex-col'>
        <h1 className='text-5xl font-extrabold text-gray-900 tracking-tight mt-3 mb-3'>
          Test Applicant Playground
        </h1>
        <p className='text-xl text-gray-600 max-w-4xl mb-10'>
          Experiment with different applicant characteristics to see how the
          model’s predictions change. Adjust income, loan amount, credit score,
          and more — then evaluate the model in real time.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <ApplicantInputs applicant={applicant} update={update} />
          <PredictionPanel result={result} onEvaluate={handleEvaluate} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function ApplicantInputs({
  applicant,
  update,
}: {
  applicant: any;
  update: (field: string, v: number) => void;
}) {
  return (
    <Card className='bg-white shadow-sm border'>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>
          Applicant Details
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-8'>
        {/* Dependents */}
        <Field label='Number of Dependents'>
          <Input
            type='number'
            min={0}
            max={15}
            value={applicant.no_of_dependents}
            onChange={(e) => update("no_of_dependents", Number(e.target.value))}
          />
        </Field>

        {/* Education */}
        <Field label='Graduate?'>
          <SwitchRow
            checked={applicant.education === 1}
            onChange={(v) => update("education", v ? 1 : 0)}
            text={applicant.education === 1 ? "Yes" : "No"}
          />
        </Field>

        {/* Self Employed */}
        <Field label='Self-employed?'>
          <SwitchRow
            checked={applicant.self_employed === 1}
            onChange={(v) => update("self_employed", v ? 1 : 0)}
            text={applicant.self_employed === 1 ? "Yes" : "No"}
          />
        </Field>

        {/* Annual Income */}
        <Field label='Annual Income (KES)'>
          <Slider
            value={[applicant.income_annum]}
            min={0}
            max={5000000}
            step={10000}
            onValueChange={(v) => update("income_annum", v[0])}
          />
          <Value>{applicant.income_annum.toLocaleString()} KES</Value>
        </Field>

        {/* Loan Amount */}
        <Field label='Loan Amount (KES)'>
          <Slider
            value={[applicant.loan_amount]}
            min={0}
            max={2000000}
            step={5000}
            onValueChange={(v) => update("loan_amount", v[0])}
          />
          <Value>{applicant.loan_amount.toLocaleString()} KES</Value>
        </Field>

        {/* Loan Term */}
        <Field label='Loan Term (Months)'>
          <Slider
            value={[applicant.loan_term]}
            min={6}
            max={480}
            step={6}
            onValueChange={(v) => update("loan_term", v[0])}
          />
          <Value>{applicant.loan_term} months</Value>
        </Field>

        {/* CIBIL Score */}
        <Field label='CIBIL Score'>
          <Slider
            value={[applicant.cibil_score]}
            min={300}
            max={900}
            step={1}
            onValueChange={(v) => update("cibil_score", v[0])}
          />
          <Value>{applicant.cibil_score}</Value>
        </Field>

        {/* Residential Assets */}
        <Field label='Residential Assets Value (KES)'>
          <Input
            type='number'
            value={applicant.residential_assets_value}
            onChange={(e) =>
              update("residential_assets_value", Number(e.target.value))
            }
          />
        </Field>

        {/* Commercial Assets */}
        <Field label='Commercial Assets Value (KES)'>
          <Input
            type='number'
            value={applicant.commercial_assets_value}
            onChange={(e) =>
              update("commercial_assets_value", Number(e.target.value))
            }
          />
        </Field>

        {/* Luxury Assets */}
        <Field label='Luxury Assets Value (KES)'>
          <Input
            type='number'
            value={applicant.luxury_assets_value}
            onChange={(e) =>
              update("luxury_assets_value", Number(e.target.value))
            }
          />
        </Field>

        {/* Bank Assets */}
        <Field label='Bank Asset Value (KES)'>
          <Input
            type='number'
            value={applicant.bank_asset_value}
            onChange={(e) => update("bank_asset_value", Number(e.target.value))}
          />
        </Field>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col space-y-2'>
      <Label className='font-medium'>{label}</Label>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className='text-sm text-gray-600'>{children}</p>;
}

function SwitchRow({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: string;
}) {
  return (
    <div className='flex items-center space-x-3'>
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className='text-sm text-gray-700'>{text}</span>
    </div>
  );
}

export function PredictionPanel({
  result,
  onEvaluate,
}: {
  result: any;
  onEvaluate: () => void;
}) {
  return (
    <Card className='bg-white shadow-sm border'>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>
          Model Prediction
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <Button onClick={onEvaluate} className='w-full'>
          Evaluate Applicant
        </Button>

        {result && (
          <div className='p-4 border rounded-xl bg-gray-50'>
            <p className='text-lg font-semibold'>
              Outcome:{" "}
              <span
                className={result.approved ? "text-green-600" : "text-red-600"}
              >
                {result.approved ? "Approved" : "Rejected"}
              </span>
            </p>
            <p className='text-gray-700'>
              Probability:{" "}
              <span className='font-medium'>
                {(result.probability * 100).toFixed(2)}%
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
