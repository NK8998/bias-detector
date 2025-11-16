import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Simple responsive navbar with black/white theme
export default function Navbar() {
  return (
    <nav className='w-full border-b border-white/10 bg-black text-white px-6 py-4 flex items-center justify-between'>
      {/* App Name */}
      <div className='text-xl font-semibold tracking-wide'>BiasLens</div>

      {/* Nav Links */}
      <div className='hidden md:flex items-center gap-8 text-sm'>
        <Link href='/' className='hover:text-red-400 transition-colors'>
          Home
        </Link>
        <Link
          href='/model_comparison'
          className='hover:text-red-400 transition-colors'
        >
          Model Comparison
        </Link>
        <Link
          href='/test_applicant'
          className='hover:text-red-400 transition-colors'
        >
          Test Applicant
        </Link>
        <Link
          href='/avoiding_bias'
          className='hover:text-red-400 transition-colors'
        >
          Avoiding Bias
        </Link>
      </div>

      {/* Mobile Menu Placeholder (optional expand later) */}
      <div className='md:hidden'>
        <Button
          variant='outline'
          className='border-white text-white hover:bg-white hover:text-black'
        >
          Menu
        </Button>
      </div>
    </nav>
  );
}
