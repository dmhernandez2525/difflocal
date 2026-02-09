import { Link } from 'react-router-dom';
import {
  FileText,
  Image,
  FileType,
  Folder,
  FileSpreadsheet,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const features = [
  {
    title: 'Text & Code',
    description: 'Compare text files with syntax highlighting for 15+ languages',
    icon: FileText,
    path: '/text',
    available: true,
  },
  {
    title: 'Images',
    description: 'Visual diff with slider, fade, and pixel comparison views',
    icon: Image,
    path: '/image',
    available: false,
  },
  {
    title: 'PDFs',
    description: 'Extract and compare text from PDF documents',
    icon: FileType,
    path: '/pdf',
    available: false,
  },
  {
    title: 'Folders',
    description: 'Compare entire directory structures and their contents',
    icon: Folder,
    path: '/folder',
    available: false,
  },
  {
    title: 'Excel',
    description: 'Cell-by-cell comparison with formula support',
    icon: FileSpreadsheet,
    path: '/excel',
    available: false,
  },
];

const trustPoints = [
  {
    icon: Shield,
    title: '100% Client-Side',
    description: 'All processing happens in your browser. Your files never leave your device.',
  },
  {
    icon: Zap,
    title: 'No Upload, No Wait',
    description: 'Instant comparisons without waiting for server responses.',
  },
  {
    icon: Globe,
    title: 'Works Offline',
    description: 'Install as a PWA and use it anywhere, even without internet.',
  },
];

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Compare anything.
          <br />
          <span className="text-muted-foreground">Upload nothing.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:mt-6 sm:text-lg">
          A free, privacy-first diff tool that processes text, images, PDFs, folders, and Excel
          files entirely in your browser. Your data never leaves your machine.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
          <Link
            to="/text"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Start Comparing
          </Link>
          <a
            href="https://github.com/dmhernandez2525/difflocal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Trust Points */}
      <section className="mx-auto mt-12 max-w-4xl sm:mt-20">
        <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mt-12 sm:mt-20">
        <h2 className="text-center text-xl font-bold sm:text-2xl">Compare Any File Type</h2>
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon, path, available }) => (
            <Link
              key={title}
              to={available ? path : '#'}
              className={cn(
                'group relative rounded-lg border p-4 transition-colors sm:p-6',
                available ? 'hover:border-primary hover:bg-accent' : 'cursor-not-allowed opacity-60'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  {!available && <span className="text-xs text-muted-foreground">Coming soon</span>}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground sm:mt-3">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Privacy Note */}
      <section className="mx-auto mt-12 max-w-2xl rounded-lg border bg-muted/50 p-4 text-center sm:mt-20 sm:p-6">
        <Shield className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-4 font-semibold">Privacy by Design</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          DiffLocal is built with privacy as a core principle. There are no servers storing your
          data, no cookies tracking your usage, and no analytics collecting your information. You
          can verify this by disconnecting from the internet — the tool still works perfectly.
        </p>
      </section>
    </div>
  );
}
