import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-base font-bold">ISL Converter</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            A two-way communication aid between English / Hindi and Indian Sign
            Language: words become a sign sequence, and signs become words.
          </p>
          <Badge variant="secondary" className="mt-3">
            Demo classifier — interface testing only
          </Badge>
        </div>

        <nav aria-label="Pages" className="text-sm">
          <p className="font-semibold">Pages</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link to="/translate" className="hover:text-foreground hover:underline">
                Translate
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground hover:underline">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-foreground hover:underline">
                Home
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="font-semibold">Please note</p>
          <p className="mt-3 text-muted-foreground">
            Gloss order follows a simplified ISL structure and is a learning aid,
            not a certified translation. Videos are added by an administrator with
            the signer's permission.
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        Built as a college project · English and Hindi input · Indian Sign
        Language output
      </div>
    </footer>
  );
}
