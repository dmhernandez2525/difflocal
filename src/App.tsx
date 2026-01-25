import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './app/page';
import { TextDiffPage } from './app/text/page';
import { NotFoundPage } from './app/not-found';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="text" element={<TextDiffPage />} />
          {/* Future routes */}
          {/* <Route path="image" element={<ImageDiffPage />} /> */}
          {/* <Route path="pdf" element={<PdfDiffPage />} /> */}
          {/* <Route path="folder" element={<FolderDiffPage />} /> */}
          {/* <Route path="excel" element={<ExcelDiffPage />} /> */}
          {/* <Route path="about" element={<AboutPage />} /> */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
