'use client'

import Navigation from "./home_nav";
import { useState } from "react";

interface navbarProbs {
    names: string[];
  }
export default function Navbar({names}:navbarProbs) {
        const [activeIndex, setActiveIndex] = useState<number | null>(null);
        return (<div className="fixed top-0 w-full gap-[1rem] ml-[8.8125rem] flex items-start ">
            
             {names.map((name:string,i:number)=>(
                <Navigation key = {i} name={name} isActive={activeIndex===i} onClick={()=> {setActiveIndex(i);
                    console.log(activeIndex)
                }}/>

             ))}
        </div>)
          
}