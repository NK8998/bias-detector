import Footer from "@/components/reusables/footer";
import Navbar from "@/components/reusables/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans text-black dark:text-white'>
      <Navbar />

      {/* Hero Section */}
      <section className='w-full px-8 py-32 flex flex-col items-center text-center max-w-4xl mx-auto'>
        <h1 className='text-6xl font-extrabold tracking-tight mb-6'>
          Welcome to <span className='text-red-600'>BiasLens</span>
        </h1>
        <p className='text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl leading-relaxed'>
          Explore, evaluate, and understand model bias. Build trustworthy AI by
          visualizing fairness, testing applicants, and comparing biased vs
          balanced datasets.
        </p>

        <Link href='/model_comparison'>
          <Button
            size='lg'
            className='rounded-xl px-8 py-6 text-lg font-semibold'
          >
            Get Started <ArrowRight className='ml-2' />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className='w-full px-8 py-12 grid gap-8 md:grid-cols-3 max-w-6xl mx-auto'>
        <Card className='border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              Model Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className='text-gray-600 dark:text-gray-300'>
            Upload a biased and balanced dataset and see how fairness metrics,
            accuracies, and slices shift. Visualized beautifully for clarity.
          </CardContent>
        </Card>

        <Card className='border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              Applicant Testing
            </CardTitle>
          </CardHeader>
          <CardContent className='text-gray-600 dark:text-gray-300'>
            Adjust applicant attributes in real-time and watch how your model
            responds. A perfect playground for stress-testing your AI.
          </CardContent>
        </Card>

        <Card className='border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              Fairness Insights
            </CardTitle>
          </CardHeader>
          <CardContent className='text-gray-600 dark:text-gray-300'>
            Learn how bias emerges, how to avoid it, and how proper dataset
            preparation drastically changes outcomes.
          </CardContent>
        </Card>
      </section>

      {/* Final CTA */}
      <section className='w-full px-8 py-20 text-center max-w-3xl mx-auto'>
        <h2 className='text-4xl font-bold mb-4'>Build Better Models.</h2>
        <p className='text-lg text-gray-600 dark:text-gray-300 mb-8'>
          Bias isn’t magic. It’s measurable—and fixable. Start exploring your
          models with BiasLens today.
        </p>

        <Link href='/test_applicant'>
          <Button size='lg' className='rounded-xl px-8 py-6 text-lg'>
            Try the Applicant Playground
          </Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
