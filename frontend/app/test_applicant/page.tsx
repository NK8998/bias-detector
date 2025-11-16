"use client";

import { useState } from "react";
import Navbar from "@/components/reusables/navbar";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { BackendService } from "@/services/backend_service";
import Footer from "@/components/reusables/footer";

export default function TestApplicantPage() {
  const [applicant, setApplicant] = useState({
    no_of_dependents: 4,
    education: 0,
    self_employed: 1,
    income_annum: 60000,
    loan_amount: 150,
    loan_term: 360,
    cibil_score: 750,
    residential_assets_value: 300000,
    commercial_assets_value: 2,
    luxury_assets_value: 50000,
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

        {/* Playground Grid */}
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

      <CardContent className='space-y-6'>
        {/* Dependents */}
        <Field label='Number of Dependents'>
          <Input
            type='number'
            value={applicant.no_of_dependents}
            onChange={(e) => update("no_of_dependents", Number(e.target.value))}
          />
        </Field>

        {/* Education */}
        <Field label='Education Level (0 = None, 1 = Graduate)'>
          <Slider
            defaultValue={[applicant.education]}
            min={0}
            max={1}
            step={1}
            onValueChange={(v) => update("education", v[0])}
          />
        </Field>

        {/* Self Employed */}
        <Field label='Self-employed (0/1)'>
          <Slider
            defaultValue={[applicant.self_employed]}
            min={0}
            max={1}
            step={1}
            onValueChange={(v) => update("self_employed", v[0])}
          />
        </Field>

        {/* Income */}
        <Field label='Annual Income (KES)'>
          <Input
            type='number'
            value={applicant.income_annum}
            onChange={(e) => update("income_annum", Number(e.target.value))}
          />
        </Field>

        {/* Loan Amount */}
        <Field label='Loan Amount (KES)'>
          <Input
            type='number'
            value={applicant.loan_amount}
            onChange={(e) => update("loan_amount", Number(e.target.value))}
          />
        </Field>

        {/* Loan Term */}
        <Field label='Loan Term (months)'>
          <Input
            type='number'
            value={applicant.loan_term}
            onChange={(e) => update("loan_term", Number(e.target.value))}
          />
        </Field>

        {/* CIBIL Score */}
        <Field label='CIBIL Score'>
          <Slider
            defaultValue={[applicant.cibil_score]}
            min={300}
            max={900}
            step={1}
            onValueChange={(v) => update("cibil_score", v[0])}
          />
        </Field>

        {/* Asset Values */}
        <Field label='Residential Assets Value'>
          <Input
            type='number'
            value={applicant.residential_assets_value}
            onChange={(e) =>
              update("residential_assets_value", Number(e.target.value))
            }
          />
        </Field>

        <Field label='Commercial Assets Value'>
          <Input
            type='number'
            value={applicant.commercial_assets_value}
            onChange={(e) =>
              update("commercial_assets_value", Number(e.target.value))
            }
          />
        </Field>

        <Field label='Luxury Assets Value'>
          <Input
            type='number'
            value={applicant.luxury_assets_value}
            onChange={(e) =>
              update("luxury_assets_value", Number(e.target.value))
            }
          />
        </Field>

        <Field label='Bank Asset Value'>
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
