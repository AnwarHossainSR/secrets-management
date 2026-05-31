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
          style: { background: "#141414", color: "#ededed", border: "1px solid #222222" },
        }}
      />
    </SessionProvider>
  );
}
