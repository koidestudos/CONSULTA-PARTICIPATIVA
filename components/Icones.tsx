type Nome = "escudo" | "organizacao" | "analise" | "educacao" | "divulgacao" | "check";

const comum = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function Icone({ nome }: { nome: Nome }) {
  if (nome === "escudo") {
    return (
      <svg {...comum}>
        <path d="M12 3.2 5.2 6.1v5.7c0 4 2.7 7 6.8 8.6 4.1-1.6 6.8-4.6 6.8-8.6V6.1L12 3.2z" />
        <path d="m8.8 12.1 2.2 2.2 4.3-4.3" />
      </svg>
    );
  }
  if (nome === "organizacao") {
    return (
      <svg {...comum}>
        <circle cx="7" cy="8" r="2.2" />
        <circle cx="17" cy="8" r="2.2" />
        <circle cx="12" cy="16.5" r="2.2" />
        <path d="M9 9.2 10.8 14.6M15 9.2 13.2 14.6M9.2 8h5.6" />
      </svg>
    );
  }
  if (nome === "analise") {
    return (
      <svg {...comum}>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m14.8 14.8 4.2 4.2M8.2 10.5h4.6" />
      </svg>
    );
  }
  if (nome === "educacao") {
    return (
      <svg {...comum}>
        <path d="M4 6.5h6.2c1 0 1.9.3 2.8.9 1-.6 1.8-.9 2.8-.9H20V17.6h-4.2c-1 0-1.9.3-2.8.9-1-.6-1.8-.9-2.8-.9H4V6.5z" />
        <path d="M12 7.4v11.1" />
      </svg>
    );
  }
  if (nome === "divulgacao") {
    return (
      <svg {...comum}>
        <path d="M5 19V11M10 19V7M15 19v-5M20 19V5" />
      </svg>
    );
  }
  return (
    <svg {...comum}>
      <path d="M5 12.5 9.2 17 19 7" />
    </svg>
  );
}
