import { ALargeSmall, Contrast, Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { usePreferences, type FontSize } from "@/lib/a11y/preferences";

const SIZES: { value: FontSize; label: string; hint: string }[] = [
  { value: "small", label: "S", hint: "Small text" },
  { value: "normal", label: "M", hint: "Normal text" },
  { value: "large", label: "L", hint: "Large text" },
  { value: "xlarge", label: "XL", hint: "Extra large text" },
];

export function AccessibilityControls() {
  const { fontSize, contrast, motion, setFontSize, setContrast, setMotion } =
    usePreferences();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Text size and contrast settings">
          <ALargeSmall className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Text &amp; contrast</span>
          <span className="sm:hidden">Aa</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <p className="text-sm font-semibold">Reading comfort</p>
        <p className="mt-1 text-xs text-muted-foreground">
          These settings stay on this device and apply to every page.
        </p>

        <Separator className="my-3" />

        <div className="flex items-center justify-between gap-3">
          <Label id="font-size-label" className="flex items-center gap-2 text-sm font-medium">
            <ALargeSmall className="size-4" aria-hidden="true" />
            Text size
          </Label>
          <div className="flex items-center gap-1" role="group" aria-labelledby="font-size-label">
            {SIZES.map((size) => (
              <Button
                key={size.value}
                type="button"
                variant={fontSize === size.value ? "default" : "outline"}
                size="sm"
                className="h-8 w-9 px-0"
                aria-pressed={fontSize === size.value}
                title={size.hint}
                onClick={() => setFontSize(size.value)}
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="high-contrast"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Contrast className="size-4" aria-hidden="true" />
              High contrast
            </Label>
            <Switch
              id="high-contrast"
              checked={contrast === "high"}
              onCheckedChange={(checked) => setContrast(checked ? "high" : "normal")}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="reduce-motion"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Gauge className="size-4" aria-hidden="true" />
              Reduce motion
            </Label>
            <Switch
              id="reduce-motion"
              checked={motion === "reduced"}
              onCheckedChange={(checked) => setMotion(checked ? "reduced" : "full")}
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Text size scales the whole page; high contrast removes the tinted
          surfaces and shadows.
        </p>
      </PopoverContent>
    </Popover>
  );
}
