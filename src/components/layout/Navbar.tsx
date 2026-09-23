import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, Menu, X } from "lucide-react";

import { AccessibilityControls } from "@/components/a11y/AccessibilityControls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/translate", label: "Translate" },
  { to: "/recognize", label: "Recognize" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md"
          aria-label="ISL Converter home"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ArrowLeftRight className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            ISL Converter
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{
                className: "rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <AccessibilityControls />
          <Link to="/translate" className="hidden sm:block">
            <Button size="sm">Start translating</Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className={cn("border-t border-border bg-background px-4 pb-4 pt-2 md:hidden")}
        >
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-3 text-sm font-medium hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
