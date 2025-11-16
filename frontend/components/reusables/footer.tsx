export default function Footer() {
  return (
    <footer className='bg-gray-800 text-white py-6 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 text-center'>
        <p className='text-sm'>
          &copy; {new Date().getFullYear()} BiasLens. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
