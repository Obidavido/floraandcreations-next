"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="section container"><div className="empty-state"><p className="eyebrow">A small pause</p><h1>We could not load this page.</h1><p>Please try again, or contact the Flora and Creations team directly.</p><button className="button button-primary" onClick={() => reset()}>Try again</button></div></div>;
}
