import "./globals.css";
import Navbar from "./components/navbar_home";
export default function Home() {
  return (
    <>
      <Navbar names={["Home", "Contact US", "US"]} />
      <main>
        <div className="flex gap-0">
          <div className="flex gap-[0.625rem] mt-[15.375rem] ml-[8rem] flex-col ">
            <div className="font-sans text-[2.25rem] text-verifycolor ml-[0.625rem] font-[500]">
              <span className="text-caribian_green">Eco</span>Verify
            </div>
            <div className="text-black font-sans font-[600]  text-8xl ml-[0.625rem] w-[35.75rem]">
              Audits... Made Easier
            </div>
            <div className="font-sans text-[2.25rem] text-verifycolor ml-[0.625rem] font-[500]">
              Check your system
            </div>
            <div className="w-[11.91375rem] h-[69.96px] px-[3.144375rem] py-[1.01rem] rounded-[35.53px] border-2 border-[#03624c] justify-center items-center gap-[0.393125rem] inline-flex">
              <div className="text-black text-3xl font-normal font-sans">
                Log In
              </div>
            </div>
          </div>
          <div className="mt-[8.875rem]">
              <img src="/Sheild.png" alt="sheild" className="w-749 h-749 drop-shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
          </div>
        </div>
      </main>
    </>
  );
}
