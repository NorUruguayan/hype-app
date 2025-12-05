"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import HypeBurst from "./HypeBurst.client";

export default function CelebrationOnParam() {
  const sp = useSearchParams();
  const [fire, setFire] = useState(false);

  useEffect(() => {
    if (!sp) return;
    const t = sp.get("toast");
    if (t === "streak") setFire(true);
  }, [sp]);

  return <HypeBurst when={fire} />;
}