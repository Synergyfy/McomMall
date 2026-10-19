"use client";

/**
 * Scrolls the given container (defaults to the document) to the first invalid
 * field, focuses it and flashes a destructive ring so the user immediately
 * understands what needs fixing.
 */
export function scrollToFirstError(
  container?: ParentNode | null,
  options: { delay?: number } = {},
): void {
  if (typeof document === "undefined") return;

  const run = () => {
    const root: ParentNode = container ?? document;
    const control =
      root.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      root.querySelector<HTMLElement>("[data-field-error]") ??
      root.querySelector<HTMLElement>('[data-slot="form-message"]');

    if (!control) return;

    const scrollTarget =
      (control.closest('[data-slot="form-item"]') as HTMLElement | null) ?? control;

    scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });

    if (typeof control.focus === "function") {
      control.focus({ preventScroll: true });
    }

    control.classList.add("ring-2", "ring-destructive");
    window.setTimeout(() => {
      control.classList.remove("ring-2", "ring-destructive");
    }, 2500);
  };

  const delay = options.delay ?? 0;
  if (delay > 0) {
    window.setTimeout(run, delay);
  } else {
    // Defer to the next frame so freshly rendered error nodes are in the DOM.
    window.requestAnimationFrame(run);
  }
}
