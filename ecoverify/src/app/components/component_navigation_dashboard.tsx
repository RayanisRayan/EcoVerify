"use client";
interface NavProps {
    name: string;
    isActive: boolean; // New prop for active state
    onClick: () => void; // New prop for click event
  }
export default function Navigation({name, isActive,onClick  }:NavProps) {
        let shown= isActive? "opacity-100": "opacity-0"
        let font = isActive? "font-medium": "font-normal"
    return(
        
        <div className="flex flex-row gap-[0.625rem] lg:w-fit items-center" onClick={onClick}> 
            <div className={`lg:h-14 lg:w-[0.6875rem]  bg-[#031b1b] lg:rounded-tr-[13.75px] lg:rounded-br-[13.75px] ${shown}`} /> {/* want to add shown here */}
            <div className={`lg:text-[#f2f3f4] font-sans lg:text-2xl ${font}`}>{name}</div>
        </div>
    )

}