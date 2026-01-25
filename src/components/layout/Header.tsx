import { Link, useLocation } from 'react-router-dom';
import { FileText, Image, FileSpreadsheet, Folder, FileType } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { path: '/text', label: 'Text', icon: FileText },
  { path: '/image', label: 'Image', icon: Image, disabled: true },
  { path: '/pdf', label: 'PDF', icon: FileType, disabled: true },
  { path: '/folder', label: 'Folder', icon: Folder, disabled: true },
  { path: '/excel', label: 'Excel', icon: FileSpreadsheet, disabled: true },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">DiffLocal</span>
        </Link>

        <nav className="flex items-center space-x-1">
          {navItems.map(({ path, label, icon: Icon, disabled }) => (
            <Link
              key={path}
              to={disabled ? '#' : path}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === path
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                disabled && 'pointer-events-none opacity-50'
              )}
              aria-disabled={disabled}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-2">
          <a
            href="https://github.com/dmhernandez2525/difflocal"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
