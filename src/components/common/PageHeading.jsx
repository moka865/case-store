/**
 * Shared start-aligned page heading.
 * Sets tabIndex={-1} on <h1> so MainLayout can move keyboard/screen-reader focus
 * cleanly to the page title on route changes without flashing a visible ring.
 */
export function PageHeading({ title, description = null, className = '' }) {
  return (
    <div className={`max-w-[56ch] text-start ${className}`}>
      <h1
        tabIndex={-1}
        className="type-h1 text-[var(--charcoal)] outline-none"
      >
        {title}
      </h1>
      {description ? (
        <p className="type-body mt-3 text-[var(--graphite)]">{description}</p>
      ) : null}
    </div>
  );
}
