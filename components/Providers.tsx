"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#161a24", color: "#ededed", border: "1px solid #232a3a" },
        }}
      />
    </SessionProvider>
  );
}
