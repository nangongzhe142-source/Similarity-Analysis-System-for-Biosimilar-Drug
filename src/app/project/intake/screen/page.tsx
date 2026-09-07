"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenIntakeView } from "@/components/intake/ScreenIntakeView";
import { useIntake } from "@/components/intake/IntakeProvider";

export default function ScreenIntakePage() {
  const { role } = useIntake();
  const router = useRouter();

  useEffect(() => {
    if (role !== "reviewer") {
      router.replace("/project");
    }
  }, [role, router]);

  if (role !== "reviewer") {
    return null;
  }

  return <ScreenIntakeView />;
}
