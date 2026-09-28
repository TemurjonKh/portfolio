import Link from "next/link";

export default function NotFound() {
  return (
    <main className="cosmos tk-empty">
      <h1>That page isn’t here.</h1>
      <p>The link may be old, or the page may have moved.</p>
      <p><Link className="tk-button tk-button--solid" href="/">Back to the portfolio</Link></p>
    </main>
  );
}
