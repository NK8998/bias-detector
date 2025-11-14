export const Sidebar = ({
  sections,
}: {
  sections: { id: string; name: string }[];
}) => (
  <div className='w-64 fixed h-full bg-gray-900/80 backdrop-blur-lg p-6 space-y-4 border-r border-gray-800 hidden lg:block'>
    <h2 className='text-2xl font-extrabold text-white mb-6'>XAI Dashboard</h2>
    <nav className='space-y-2'>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className='block p-3 rounded-xl text-gray-300 hover:bg-blue-600/30 hover:text-white transition-colors duration-200'
        >
          {section.name}
        </a>
      ))}
    </nav>
  </div>
);
