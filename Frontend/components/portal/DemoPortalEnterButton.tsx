"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Fingerprint } from "lucide-react";
import { toast } from "sonner";

type DemoPortalEnterButtonProps = {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
};

export function DemoPortalEnterButton({
  href,
  className,
  style,
  label = "Enter Portal",
}: DemoPortalEnterButtonProps) {
  const router = useRouter();
  const [scanning, setScanning] = React.useState(false);

  function enterPortal() {
    if (scanning) return;
    setScanning(true);
    toast("Biometric scan started", {
      description: "Frontend-only identity check running.",
    });
    window.setTimeout(() => {
      router.push(href);
    }, 900);
  }

  return (
    <button type="button" onClick={enterPortal} className={className} style={style}>
      {scanning ? (
        <>
          <Fingerprint size={18} className="animate-pulse" />
          Scanning...
        </>
      ) : (
        <>
          {label} <ArrowRight size={18} />
        </>
      )}
    </button>
  );
}
