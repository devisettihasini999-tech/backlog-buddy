import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/ui';

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactPage() {
  const { addFeedback, toast, feedback } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (message.trim().length < 10) next.message = 'Message should be at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    addFeedback({ name: name.trim(), email: email.trim(), topic, message: message.trim() });
    toast('Thanks! Your message has been recorded.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Contact & feedback"
          title="We would love to hear from you"
          subtitle="Found a broken paper link? Want your college's papers added? Send us a message — student feedback shapes what we build next."
        />

        <div className="grid" style={{ gridTemplateColumns: '1.15fr 0.85fr', gap: '1.75rem', alignItems: 'start' }}>
          <form className="card" onSubmit={submit} noValidate>
            <div className="grid grid-2">
              <div className="field">
                <label htmlFor="c-name">Your name *</label>
                <input
                  id="c-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Rao"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="c-email">Email address *</label>
                <input
                  id="c-email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>
            <div className="field" style={{ marginTop: '1.05rem' }}>
              <label htmlFor="c-topic">Topic</label>
              <select id="c-topic" className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option>Feedback</option>
                <option>Report a broken paper link</option>
                <option>Request new subjects or papers</option>
                <option>College / university partnership</option>
                <option>Bug report</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field" style={{ marginTop: '1.05rem' }}>
              <label htmlFor="c-msg">Message *</label>
              <textarea
                id="c-msg"
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you need — the more detail, the better we can help."
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>
            <button className="btn btn-primary btn-lg btn-block" type="submit" style={{ marginTop: '1.25rem' }}>
              <Send size={17} /> Send message
            </button>
            <p className="small muted" style={{ margin: '0.95rem 0 0' }}>
              Demo mode: submissions are stored in your browser and visible in the{' '}
              <Link to="/admin">admin panel</Link>. Connect the Supabase database to collect messages
              centrally.
            </p>
          </form>

          <div className="stack">
            <div className="card">
              <h3>Quick contact</h3>
              <div className="stack" style={{ marginTop: '1.05rem', gap: '0.85rem' }}>
                <div className="row" style={{ gap: '0.75rem' }}>
                  <div className="feature-icon" style={{ margin: 0, width: 42, height: 42, borderRadius: 11, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="small muted">Email</div>
                    <div style={{ fontWeight: 700 }}>support@backlogbuddy.app</div>
                  </div>
                </div>
                <div className="row" style={{ gap: '0.75rem' }}>
                  <div className="feature-icon" style={{ margin: 0, width: 42, height: 42, borderRadius: 11, background: 'var(--green-soft)', color: 'var(--green)' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="small muted">Built for</div>
                    <div style={{ fontWeight: 700 }}>Engineering students, everywhere</div>
                  </div>
                </div>
                <div className="row" style={{ gap: '0.75rem' }}>
                  <div className="feature-icon" style={{ margin: 0, width: 42, height: 42, borderRadius: 11, background: 'var(--amber-soft)', color: 'var(--amber)' }}>
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="small muted">Response time</div>
                    <div style={{ fontWeight: 700 }}>Usually within 2 working days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="row" style={{ gap: '0.55rem' }}>
                <ShieldCheck size={18} color="var(--green)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Messages recorded so far</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.65rem 0' }}>
                {feedback.length}
              </div>
              <p className="small" style={{ margin: 0 }}>
                Your feedback stays on this device until a database is connected. Administrators can view
                all submissions in the admin panel.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.05rem' }}>Before you write…</h3>
              <p className="small" style={{ margin: '0.75rem 0 0' }}>
                Many common questions are answered on the <Link to="/about">About page</Link> — including
                how our repeat analysis works and why we never predict exam questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
