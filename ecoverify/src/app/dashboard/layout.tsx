'use client'
import DashboardNavbar from "../components/dashboard_nav";
import { SessionProvider } from "next-auth/react";

export default function sidebar({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <div className="flex h-[100vh] ">
            <div className="md:min-w-[11.4375rem] md:max-w-[10%] md:min-h-full bg-gradient-to-b from-[#2cc295] to-[#03624c] flex flex-col pt-[9.5rem]">
              <DashboardNavbar names={["Rayan","Muath"]}/>
            </div>
            <SessionProvider>
            {children}
            </SessionProvider>
        </div>
       
    );
  }