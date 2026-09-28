import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu, Moon, Search, ShieldCheck, Sun, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Toasts } from './ui';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/papers', label: 'Question Papers' },
  { to: '/important', label: 'Important Questions' },
  { to: '/resources', label: 'Study Resources' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Logo() {
  return (
    <Link to="/" className="brand" aria-label="Backlog Buddy home">
      <span className="brand-mark">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 2 8l10 5 8-4v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11l-6 3-6-3z" fill="#fff" opacity=".9" />
        </svg>
      </span>
      <span>
        Backlog <span className="accent-text">Buddy</span>
      </span>
    </Link>
  );
}

export function Layout() {
  const { theme, toggleTheme, remoteStatus } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="main-nav" aria-label="Main navigation">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => navigate('/search')} aria-label="Search">
              <Search size={18} />
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle colour theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link className="btn btn-secondary btn-sm hide-mobile" to="/dashboard">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link className="btn btn-primary btn-sm hide-mobile" to="/admin">
              <ShieldCheck size={15} /> Admin
            </Link>
            <button
              className="icon-btn mobile-toggle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <div className="container">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/dashboard">Student Dashboard</NavLink>
            <NavLink to="/admin">Admin Panel</NavLink>
            <NavLink to="/search">Search</NavLink>
            <div className="row" style={{ marginTop: '0.9rem' }}>
              <span className={`badge badge-${remoteStatus === 'connected' ? 'green' : 'blue'}`}>
                {remoteStatus === 'connected' ? 'Supabase connected' : 'Demo data mode'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ minHeight: '62vh' }}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Logo />
              <p style={{ marginTop: '0.9rem', maxWidth: '34ch' }}>
                Your one-stop study platform for engineering backlog preparation — previous papers,
                important questions, repeated topics and study resources, organised subject by subject.
              </p>
              <div className="row" style={{ gap: '0.5rem' }}>
                <span className={`badge badge-${remoteStatus === 'connected' ? 'green' : 'blue'}`}>
                  {remoteStatus === 'connected' ? 'Supabase connected' : 'Demo data mode'}
                </span>
                <span className="badge badge-slate">Free for students</span>
              </div>
            </div>
            <div>
              <h4>Explore</h4>
              <Link to="/subjects">Browse Subjects</Link>
              <Link to="/papers">Question Paper Library</Link>
              <Link to="/important">Important Questions</Link>
              <Link to="/resources">Study Resources</Link>
              <Link to="/search">Search Everything</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/dashboard">Student Dashboard</Link>
              <Link to="/dashboard?tab=checklist">Preparation Checklist</Link>
              <Link to="/admin">Admin Panel</Link>
              <Link to="/contact">Contact & Feedback</Link>
            </div>
            <div>
              <h4>Popular Branches</h4>
              <Link to="/subjects?branch=cse">CSE</Link>
              <Link to="/subjects?branch=aiml">AI & ML</Link>
              <Link to="/subjects?branch=ece">ECE</Link>
              <Link to="/subjects?branch=mech">Mechanical</Link>
              <Link to="/subjects?branch=civil">Civil</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Backlog Buddy · Prepare Smart. Clear Your Backlogs.</span>
            <span>
              Labels & repeat counts are preparation guidance based on available papers — never exam
              predictions.
            </span>
          </div>
        </div>
      </footer>
      <Toasts />
    </>
  );
}
