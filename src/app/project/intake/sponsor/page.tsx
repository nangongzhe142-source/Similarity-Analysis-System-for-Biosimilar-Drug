"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SponsorIntakeView } from "@/components/intake/SponsorIntakeView";
import { useIntake } from "@/components/intake/IntakeProvider";

export default function SponsorIntakePage() {
  const { role } = useIntake();
  const router = useRouter();

  useEffect(() => {
    if (role !== "sponsor") {
      router.replace("/project");
    }
  }, [role, router]);

  if (role !== "sponsor") {
    return null;
  }

  return <SponsorIntakeView />;
}
