"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Small component that displays a logistic equation nicely and allows copy
 */
export function ModelEquation({ equation }: { equation: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(equation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className='bg-white border border-black/10 shadow-sm'>
      <CardHeader className='flex items-center justify-between'>
        <CardTitle className='text-lg font-semibold'>Equation</CardTitle>
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className='w-4 h-4 text-gray-600 cursor-pointer' />
            </TooltipTrigger>
            <TooltipContent className='max-w-xs'>
              <p className='text-sm'>
                This is the logistic regression equation in logit form. Each
                term is a coefficient multiplied by a feature value. Positive
                coefficients increase probability; negative reduce it.
              </p>
            </TooltipContent>
          </Tooltip>

          <Button
            size='sm'
            variant='outline'
            onClick={handleCopy}
            className='flex items-center gap-2'
          >
            <Copy className='w-4 h-4' />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <pre className='whitespace-pre-wrap text-sm font-mono text-gray-800'>
          {equation}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * Full break down of both equations with hardcoded terms and plain-English explanations.
 * Use this component in your ModelEquationsSection instead of the raw paragraphs.
 */
export default function EquationsBreakdownSection({
  fairEquation,
  biasedEquation,
}: {
  fairEquation: string;
  biasedEquation: string;
}) {
  // Hardcoded breakdowns for the Fair model
  const fairTerms = [
    {
      key: "no_of_dependents",
      coeff: -0.029,
      sign: "negative",
      short: "Each additional dependent slightly reduces approval odds.",
      long: "A negative coefficient (-0.029) means having more dependents nudges the model toward a lower approval probability. Effect is small.",
      impact: "Minor",
    },
    {
      key: "education",
      coeff: -0.0221,
      sign: "negative",
      short:
        "Higher education coding here slightly reduces approval odds in this encoding.",
      long: "Education was encoded (Graduate / Not Graduate). The small negative coefficient indicates the model slightly lowers approval probability for the encoded group — magnitude is tiny.",
      impact: "Minor",
    },
    {
      key: "self_employed",
      coeff: 0.0664,
      sign: "positive",
      short: "Self-employment slightly increases approval odds.",
      long: "Being self-employed increases the predicted log-odds a bit — the model treats it as a (modest) positive signal.",
      impact: "Minor",
    },
    {
      key: "income_annum",
      coeff: -1.6132,
      sign: "negative",
      short:
        "Large negative coefficient — higher income reduces log-odds (likely due to scaling/encoding).",
      long: "This looks large and negative; check units/normalization. If income is inverted or scaled strangely, the sign may be misleading — confirm preprocessing. Magnitude is major and will strongly affect predictions.",
      impact: "Major",
    },
    {
      key: "loan_amount",
      coeff: 1.2608,
      sign: "positive",
      short: "Larger loan amounts increase approval probability in this model.",
      long: "A positive, fairly large coefficient suggests that — after whatever scaling was applied — larger loan amounts are associated with higher approval odds. Could indicate correlated underwriting rules in dataset.",
      impact: "Major",
    },
    {
      key: "loan_term",
      coeff: -0.8625,
      sign: "negative",
      short: "Longer loan terms reduce approval odds.",
      long: "A bigger (in magnitude) negative coefficient — indicates loan_term is an important negative signal. Check unit: if term measured in years or blocks, effect is noticeable.",
      impact: "Moderate",
    },
    {
      key: "cibil_score",
      coeff: 4.1625,
      sign: "positive",
      short:
        "Very strong positive — better credit score hugely increases approval odds.",
      long: "This is the single largest positive coefficient. A higher credit (cibil) score massively increases predicted probability, which matches domain expectations: good credit -> approvals.",
      impact: "Major",
    },
    {
      key: "residential_assets_value",
      coeff: 0.0347,
      sign: "positive",
      short: "More residential assets slightly increases approval odds.",
      long: "Small positive effect: owning/residing higher-valued residential assets nudges approval probability upward slightly.",
      impact: "Minor",
    },
    {
      key: "commercial_assets_value",
      coeff: 0.0828,
      sign: "positive",
      short: "Commercial assets slightly increase approval odds.",
      long: "Small positive effect; likely a modest signal of financial stability or business backing.",
      impact: "Minor",
    },
    {
      key: "luxury_assets_value",
      coeff: 0.2711,
      sign: "positive",
      short: "Luxury asset holdings moderately increase approval odds.",
      long: "A moderate positive coefficient — luxury assets act as a signal of wealth and increase approval probability.",
      impact: "Moderate",
    },
    {
      key: "bank_asset_value",
      coeff: 0.1131,
      sign: "positive",
      short: "Bank assets increase approval odds modestly.",
      long: "Positive effect consistent with overall asset strength — small to moderate impact.",
      impact: "Minor",
    },
  ];

  // Hardcoded breakdowns for the Biased model
  const biasedTerms = [
    {
      key: "age",
      coeff: 0.2187,
      sign: "positive",
      short: "Older applicants increase approval odds (per model encoding).",
      long: "Age has a moderately positive coefficient. Depending on scaling, older age groups get higher predicted probability.",
      impact: "Moderate",
    },
    {
      key: "gender",
      coeff: 0.4334,
      sign: "positive",
      short:
        "Gender (encoded) has a strong positive coefficient — potential bias axis.",
      long: "Gender here appears to be encoded (male=1 / female=0). A positive 0.433 means the encoded gender gets higher odds — this is likely the major fairness concern flagged in this model.",
      impact: "Major",
    },
    {
      key: "job",
      coeff: 0.1676,
      sign: "positive",
      short:
        "Job category slightly increases approval odds for certain job encodings.",
      long: "Job encoding influences approval positively but with a small coefficient — check how job categories were encoded to understand which groups benefit.",
      impact: "Minor",
    },
    {
      key: "credit_amount",
      coeff: -0.2302,
      sign: "negative",
      short: "Higher credit amount reduces approval odds in this model.",
      long: "Negative coefficient suggests higher requested credit amount decreases probability of approval — logical but check scaling/units for real interpretation.",
      impact: "Moderate",
    },
    {
      key: "duration",
      coeff: -0.3957,
      sign: "negative",
      short: "Longer loan durations reduce approval odds.",
      long: "Negative effect: longer durations are penalized by the model, decreasing approval probability — likely a risk-related signal.",
      impact: "Moderate",
    },
  ];

  return (
    <section className='mt-10'>
      <div className='mb-6'>
        <h2 className='text-3xl font-extrabold text-gray-800 mb-2'>
          🧮 Model Equations — Detailed Breakdown
        </h2>
        <p className='text-gray-600 max-w-4xl'>
          Below are the two logistic regression equations and a human-friendly
          breakdown of what each coefficient means and how it affects the
          model’s output.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Fair Model Column */}
        <div className='p-6 border rounded-xl bg-white shadow-sm'>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <h3 className='text-xl font-semibold mb-1'>Fair Model</h3>
              <p className='text-sm text-gray-600'>
                High-level: balanced dataset, low fairness gaps.
              </p>
            </div>
            <Badge className='self-start'>Fair</Badge>
          </div>

          {/* Equation */}
          <div className='mb-4'>
            <ModelEquation equation={fairEquation} />
          </div>

          {/* Terms Accordion */}
          <Accordion type='single' collapsible className='mb-4'>
            {fairTerms.map((t) => (
              <AccordionItem key={t.key} value={t.key}>
                <AccordionTrigger>
                  <div className='flex items-center justify-between w-full'>
                    <div>
                      <div className='text-sm font-medium'>{t.key}</div>
                      <div className='text-xs text-gray-600'>{t.short}</div>
                    </div>

                    <div className='text-right'>
                      <div
                        className={`text-sm font-semibold ${
                          t.sign === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.coeff > 0 ? `+${t.coeff}` : t.coeff}
                      </div>
                      <div className='text-xs text-gray-500'>{t.impact}</div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <p className='text-sm text-gray-700 mb-2'>{t.long}</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='w-4 h-4 text-gray-500 cursor-pointer' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-sm'>
                      <p className='text-sm'>
                        Impact labels:
                        <br />
                        <strong>Minor</strong> — small effect on predictions.
                        <br />
                        <strong>Moderate</strong> — noticeable effect, worth
                        inspecting.
                        <br />
                        <strong>Major</strong> — dominant effect; consider
                        feature scaling / encoding checks.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className='text-sm text-gray-700'>
            <strong>Summary:</strong> The fair model relies heavily on{" "}
            <em>cibil_score</em> and <em>loan_amount</em> (and income-related
            features) — these dominate the predictions. Most asset features
            exert small positive nudges.
          </div>
        </div>

        {/* Biased Model Column */}
        <div className='p-6 border rounded-xl bg-white shadow-sm'>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <h3 className='text-xl font-semibold mb-1'>Biased Model</h3>
              <p className='text-sm text-gray-600'>
                High-level: flagged for bias — main red flag is gender impact.
              </p>
            </div>
            <Badge variant='destructive' className='self-start'>
              Biased
            </Badge>
          </div>

          {/* Equation */}
          <div className='mb-4'>
            <ModelEquation equation={biasedEquation} />
          </div>

          {/* Terms Accordion */}
          <Accordion type='single' collapsible className='mb-4'>
            {biasedTerms.map((t) => (
              <AccordionItem key={t.key} value={t.key}>
                <AccordionTrigger>
                  <div className='flex items-center justify-between w-full'>
                    <div>
                      <div className='text-sm font-medium'>{t.key}</div>
                      <div className='text-xs text-gray-600'>{t.short}</div>
                    </div>

                    <div className='text-right'>
                      <div
                        className={`text-sm font-semibold ${
                          t.sign === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.coeff > 0 ? `+${t.coeff}` : t.coeff}
                      </div>
                      <div className='text-xs text-gray-500'>{t.impact}</div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <p className='text-sm text-gray-700 mb-2'>{t.long}</p>

                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='w-4 h-4 text-gray-500 cursor-pointer' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-sm'>
                      <p className='text-sm'>
                        Note: Coefficients are applied to normalized/scaled
                        inputs in most pipelines — always check preprocessing
                        (standardization, encoding) before interpreting raw
                        magnitudes.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className='text-sm text-gray-700'>
            <strong>Summary:</strong> The biased model gives a substantial
            positive coefficient to <em>gender</em> and a non-trivial weight to{" "}
            <em>age</em>. That gender term likely drives most of the demographic
            parity gap you observed; fix the encoding, preprocess, or apply
            fairness-aware constraints.
          </div>
        </div>
      </div>
    </section>
  );
}
