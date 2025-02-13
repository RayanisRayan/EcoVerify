'use client'

import Navigation from "./home_nav";
import { useState } from "react";

interface navbarProbs {
    names: string[];
  }
export default function Navbar({names}:navbarProbs) {
        const [activeIndex, setActiveIndex] = useState<number>(0);
        return (<div className="fixed top-0 w-full gap-[1rem] ml-[15.888888888vw] flex items-start ">
            
             {names.map((name:string,i:number)=>(
                <Navigation key = {i} name={name} isActive={activeIndex===i} onClick={()=> {setActiveIndex(i);
                    console.log(activeIndex)
                }}/>

             ))}
        </div>)
          
}