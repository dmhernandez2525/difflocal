import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Image, FileType, Folder, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/text', label: 'Text', icon: FileText },
  { path: '/image', label: 'Image', icon: Image, disabled: true },
  { path: '/pdf', label: 'PDF', icon: FileType, disabled: true },
  { path: '/folder', label: 'Folder', icon: Folder, disabled: true },
  { path: '/excel', label: 'Excel', icon: FileSpreadsheet, disabled: true },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="pb-safe-bottom fixed bottom-0 left-0 right-0 z-50 animate-slide-up border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ path, label, icon: Icon, disabled }) => (
          <Link
            key={path}
            to={disabled ? '#' : path}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors',
              isActive(path) ? 'text-primary' : 'text-muted-foreground',
              disabled && 'pointer-events-none opacity-40'
            )}
            aria-disabled={disabled}
          >
            <Icon className={cn('h-5 w-5', isActive(path) && 'stroke-[2.5]')} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
