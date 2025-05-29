import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import React, { ReactNode } from "react";
import { dark } from "@clerk/themes";

import "../globals.css";

export const metadata = {
  title: "Auth",
  description: "A Next.JS 13 Meta Application",
};

const inter = Inter({
  subsets: ["latin"],
});

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
};

export default AuthLayout;

export const dynamic = "force-dynamic";
