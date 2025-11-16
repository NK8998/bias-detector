import Navbar from "@/components/reusables/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <Navbar />
      <main className='flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start'>
        <h1 className='text-5xl font-bold text-black dark:text-white mb-8'>
          Welcome to BiasLens
        </h1>
        <p className='text-lg text-gray-700 dark:text-gray-300 mb-16'>
          Uncover and understand biases in AI models with our comprehensive
          tools and resources.
        </p>
      </main>
    </div>
  );
}
