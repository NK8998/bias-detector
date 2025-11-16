"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

// Modern, light-themed responsive navbar
export default function Navbar() {
  const currentPath = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/model_comparison", label: "Model Comparison" },
    { href: "/test_applicant", label: "Test Applicant" },
    { href: "/avoiding_bias", label: "Avoiding Bias" },
  ];

  return (
    <nav className='sticky top-0 z-10 w-full border-b border-gray-200 bg-white text-gray-800 shadow-sm'>
      <div className='px-8 max-w-[1400px] mx-auto flex items-center justify-between py-4'>
        {/* App Name */}
        <div className='text-2xl font-bold tracking-tight text-gray-600'>
          BiasLens
        </div>

        {/* Nav Links (Desktop) */}
        <div className='hidden md:flex items-center gap-10 text-sm'>
          {navLinks.map((link) => {
            const isActive = link.href === currentPath;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-medium transition-colors relative group py-1",
                  isActive
                    ? "text-gray-600 font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                {link.label}
                {/* Active Link Underline Indicator */}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 w-full bg-gray-600 transform scale-x-0 transition-transform duration-300",
                    isActive && "scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Placeholder */}
        <div className='md:hidden'>
          <Button
            variant='outline'
            className='border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 p-2'
            size='sm'
          >
            <Menu className='w-5 h-5' />
          </Button>
        </div>
      </div>
    </nav>
  );
}
