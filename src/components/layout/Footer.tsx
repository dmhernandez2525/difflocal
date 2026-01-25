import { Shield, WifiOff } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>100% Client-Side</span>
          </div>
          <div className="flex items-center gap-1">
            <WifiOff className="h-4 w-4" />
            <span>Works Offline</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Your data never leaves your browser.{' '}
          <a
            href="https://github.com/dmhernandez2525/difflocal"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            View source
          </a>
        </p>
      </div>
    </footer>
  );
}
