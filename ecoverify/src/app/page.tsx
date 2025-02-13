import "./globals.css";
import Navbar from "./components/navbar_home";
import Link from "next/link";
export default function Home() {
  return (
    <>
      <Navbar names={["Home", "Contact US", "US"]} />
      <main>
        <div className="flex gap-[5vw] justify-between px-[7vw]">
          <div className="flex gap-[0.625rem] mt-[15.375rem] ml-[8.888888888vw] flex-col ">
            <div className="font-sans text-[2.25rem] text-verifycolor ml-[0.625rem] font-[500]">
              <span className="text-caribian_green">Eco</span>Verify
            </div>
            <div className="text-black font-sans font-[600]  text-8xl ml-[0.625rem] w-[35.75rem]">
              Audits... Made Easier
            </div>
            <div className="font-sans text-[2.25rem] text-verifycolor ml-[0.625rem] font-[500]">
              Check your system
            </div>
            <Link href="/login" className="contents">
            <div className="w-[11.91375rem] h-[69.96px] px-[3.144375rem] py-[1.01rem] rounded-[35.53px] border-[3px] border-[#03624c] justify-center items-center gap-[0.393125rem] flex">
              
              <div className="text-black text-3xl font-normal font-sans">
                Log In
              </div>
    
            </div>
            </Link>
            <div className="h-[2.52625rem] px-[1.798125rem] py-[0.606875/rem] rounded-[20.32px] border border-[#03624c]/40 justify-center items-center gap-[0.225rem] inline-flex w-[8.375rem]">
              <div className="text-black/30 text-lg font-normal font-['Fira Sans']">
                Sign Up
              </div>
            </div>
          </div>
          <div className="mt-[8.875rem] w-[52vw] h-[35vw] mr-[8.888888888vw]">
            <img
              src="/Sheild.png"
              alt="sheild"
              className="max-w-[50vw] lg:max-w-[40vw]  drop-shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] m-auto absolute top-[10%]"
            />
            <div className="min-w-[100%] h-[100%] max-h-[30vw] bg-gradient-to-b from-[#03624c] to-[#2cc295] rounded-tl-[309px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[10px] -z-1 mt-[8rem] ml-[5rem]" />
          </div>
        </div>
      </main>
    </>
  );
}
