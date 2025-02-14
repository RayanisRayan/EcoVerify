'use client'

import Navigation from "./component_navigation_dashboard";
import { useState } from "react";

interface navbarProbs {
    names: string[];
  }
export default function DashboardNavbar({names}:navbarProbs) {
        const [activeIndex, setActiveIndex] = useState<number>(0);
        return (<div className="flex lg:flex-col lg:gap-[2.375rem]">
            
             {names.map((name:string,i:number)=>(
                <Navigation key = {i} name={name} isActive={activeIndex===i} onClick={()=> {setActiveIndex(i);
                }}/>

             ))}
        </div>)
          
}