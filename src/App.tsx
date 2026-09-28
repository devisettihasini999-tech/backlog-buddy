import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { SubjectsPage } from './pages/Subjects';
import { SubjectDetailPage } from './pages/SubjectDetail';
import { PapersPage } from './pages/Papers';
import { PaperViewerPage } from './pages/PaperViewer';
import { ImportantQuestionsPage } from './pages/ImportantQuestions';
import { SearchPage } from './pages/Search';
import { DashboardPage } from './pages/Dashboard';
import { AdminPage } from './pages/Admin';
import { ResourcesPage } from './pages/Resources';
import { AboutPage } from './pages/About';
import { ContactPage } from './pages/Contact';
import { NotFoundPage } from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="subjects/:subjectId" element={<SubjectDetailPage />} />
        <Route path="papers" element={<PapersPage />} />
        <Route path="papers/:paperId" element={<PaperViewerPage />} />
        <Route path="important" element={<ImportantQuestionsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
