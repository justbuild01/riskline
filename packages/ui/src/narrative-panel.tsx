import * as React from "react";

export type NarrativeStatus = "loading" | "ready" | "error";

export function NarrativePanel({
  status,
  narrative,
  errorMessage,
}: {
  status: NarrativeStatus;
  narrative?: string;
  errorMessage?: string;
}) {
  if (status === "loading") {
    return (
      <p className="font-body text-sm text-ink-muted" role="status">
        Kimi is reading the numbers and writing the summary — this usually takes a few seconds.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="font-body text-sm text-correlated" role="alert">
        Couldn&apos;t generate a narrative right now
        {errorMessage ? `: ${errorMessage}` : "."} The numbers above are still accurate — check
        that <code>HF_TOKEN</code> is set on the server and try refreshing.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 font-body text-sm leading-relaxed text-ink">
      {(narrative ?? "").split("\n").filter(Boolean).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}
