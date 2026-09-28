import React from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Backlog Buddy error boundary:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container section">
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p style={{ maxWidth: '52ch', margin: '0 auto 1.2rem' }}>
              An unexpected error occurred while rendering this page. Your saved data is safe in this
              browser. Try reloading — if the problem persists, please report it on the contact page.
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Reload page
              </button>
              <a className="btn btn-secondary" href="/contact">
                Report this issue
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
