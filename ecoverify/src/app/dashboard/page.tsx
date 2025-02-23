'use client';
import ComputeCard from "../components/computecard";
import Notifications from "../components/notification";
import { signIn,useSession } from "next-auth/react";
export default function Home() {
  const { data: session, status } = useSession() 
  console.log(session)
  const smComputes = [
    {
      header: "CO2 Level",
      footer: "+10%",
      main: "80%",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "CO2 Level",
      footer: "+10%",
      main: "80%",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "CO2 Level",
      footer: "+10%",
      main: "80%",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "CO2 Level",
      footer: "+10%",
      main: "80%",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "CO2 Level",
      footer: "+10%",
      main: "80%",
      increasing: true,
      width: "7.75rem",
    },
    {
      header: "CO2 Level",
      footer: "+10%",
      main: "80%",
      increasing: true,
      width: "7.75rem",
    },
  ];
  return (
    // top table
    <div className="flex flex-col mt-[10vh] gap-[3.2675rem] w-full">
      <div className="flex flex-row gap-[7.3125rem] justify-center">
        <ComputeCard
          size="md"
          header="CO2 Level"
          footer={null}
          main="450 ppm"
          increasing={true}
          width="16.25rem"
        />
        <ComputeCard
          size="md"
          header="CO2 Level"
          footer={null}
          main="450 ppm"
          increasing={true}
          width="16.25rem"
        />
        <ComputeCard
          size="md"
          header="CO2 Level"
          footer={"skibidi"}
          main="450 ppm"
          increasing={true}
          width="16.25rem"
        />
      </div>
      <div className="flex gap-[5.4375rem] justify-center">
        {/* main graph */}
        <div className="w-[501px] h-[306px]">
        <div className="w-[306.76px] h-[27.26px] text-black text-lg font-semibold font-['Fira Sans']">Carbon Emissions Per Month KT</div>
        <img src="/image.png" alt="" />
        </div>
        {/* other variables (temp, humedity, etc) */}
        <div className="flex flex-col gap-[1.6875rem] mt-[2.090625rem]">
          {[0, 1].map((row) => (
            <div
              key={row}
              className="flex flex-row gap-[1.6875rem] flex-nowrap"
            >
              {smComputes.slice(row * 3, row * 3 + 3).map((compute, index) => (
                <ComputeCard key={index} size="sm" {...compute} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-[20%]">
        <div className="flex flex-col gap-[1.3rem] justify-center">
            <div className="text-black text-4xl font-semibold font-['Fira Sans'] leading-[41.83px] w-fit">
                    Set Notifications
            </div>
            <div className="text-black/60 text-[0.8125rem] font-normal font-['Fira Sans'] leading-[20.91px]">Customize your alerts based on thresholds</div>
        </div>
        <div className="flex flex-col gap-[2rem]">
                <div className="flex flex-col gap-[0.218125rem]">
                    <p className="text-black text-xs font-medium font-sans leading-[17.43px]">Threshold Level</p>
                    <input type="text" className="w-[25rem] h-8 px-[0.63rem] bg-white rounded-md border border-black/10 font-nomral font-sans leading-[1rem] placeholder:text-black/50 focus:outline-none focus:ring-1 focus:ring-black/20" placeholder="Enter CO2 Level"/>
                    <div className="text-black/50 text-[10.46px] font-normal font-sans leading-[0.87125rem]">ppm</div>
                </div>
                <div className="flex flex-col gap-[0.218125rem]">
                    <p className="text-black text-xs font-medium font-sans leading-[17.43px]">Notification Frequency</p>
                    <div className="flex gap-[0.4375rem]">
                      <Notifications main="Hourly"/>
                      <Notifications main="Daily"/>
                      <Notifications main="Weekly"/>
                    </div>
                    <div className="text-black/50 text-[10.46px] font-normal font-sans leading-[0.87125rem]">Select frequency</div>
                </div>
                <div className="bg-gradient-to-r from-[#032221] to-[#2cc295] rounded-[6.97px] w-fit p-3 text-center text-white font-semibold font-['Fira Sans'] leading-[20.91px] hover:brightness-90"><span className="mx-6">Save</span></div>
          </div>
      </div>
          
    </div>
  );
}
