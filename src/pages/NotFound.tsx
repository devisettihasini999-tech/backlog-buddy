import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty-state" style={{ maxWidth: 620, margin: '2.5rem auto' }}>
          <div className="empty-icon">
            <Compass size={28} />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>404 — page not found</h1>
          <p style={{ maxWidth: '46ch', margin: '0 auto 1.5rem' }}>
            The page you are looking for does not exist or has moved. Let's get you back to your
            preparation.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-primary btn-lg" to="/">
              <Home size={18} /> Back to Home
            </Link>
            <Link className="btn btn-secondary btn-lg" to="/search">
              <Search size={18} /> Search the site
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
