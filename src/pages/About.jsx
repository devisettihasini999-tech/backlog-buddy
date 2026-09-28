import React from 'react'
import { Link } from 'react-router-dom'
import { SectionTitle, Badge } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'
import { APP_NAME, TAGLINE } from '../lib/config.js'

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SectionTitle icon={I.info} title={`About ${APP_NAME}`} sub={TAGLINE} />

      <div className="card space-y-6 p-7 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <section>
          <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Why we built this</h3>
          <p>
            Every semester, thousands of engineering students face the same problem: a backlog subject, a supplementary exam a
            few weeks away, and no idea where to start. Official PDFs live in random group chats, "important questions" come
            from seniors with no source, and nobody can tell you what actually gets asked. {APP_NAME} exists to fix exactly
            that — one organised place with previous papers, a labelled important-question bank, model papers and honest
            preparation guidance.
          </p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">What you get</h3>
          <ul className="space-y-2">
            <li className="flex gap-2.5"><I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> Subject-wise previous year papers with a built-in PDF viewer and downloads.</li>
            <li className="flex gap-2.5"><I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> Important questions labelled as Very Important, Frequently Asked, Repeated, Important Topic or Practice.</li>
            <li className="flex gap-2.5"><I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> Unit-wise question grouping so you can study by unit.</li>
            <li className="flex gap-2.5"><I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> Model papers for final-week timed practice.</li>
            <li className="flex gap-2.5"><I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> Sprint plans, hall-note sheets and formula one-pagers.</li>
            <li className="flex gap-2.5"><I.check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> A personal dashboard: favourites, bookmarks, saved papers, progress and a preparation checklist.</li>
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">An honest note on "important questions"</h3>
          <p>
            The labels and "appeared in N previous papers" counts are <b>preparation recommendations computed from the papers
            currently in our library</b>. Frequent in the past is a good bet for priority — but nothing here predicts or
            guarantees what will appear in your exam. Treat this as a study-prioritisation tool, not a leak.
          </p>
        </section>

        <section>
          <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">Current status</h3>
          <p className="mb-3">
            The platform is running with <Badge cls="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">demo / sample data</Badge>{' '}
            so you can test the full experience. Sample papers are generated and clearly marked. Real papers, regulations,
            universities and colleges can be added through the admin panel, and more branches and semesters can be attached
            as the database is extended.
          </p>
          <p>
            Have feedback, a paper to contribute, or found a mistake?{' '}
            <Link to="/contact" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Send it via the contact page</Link> — it lands directly in our feedback database.
          </p>
        </section>
      </div>
    </div>
  )
}
