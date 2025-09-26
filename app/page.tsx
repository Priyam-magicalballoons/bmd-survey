"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Osteocare-Bone-Health-Survey");
  }, []);
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <p className="mt-20 text-4xl font-bold">Loading...</p>
    </div>
  );
};

export default page;
