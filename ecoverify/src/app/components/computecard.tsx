interface probs {
  header: string;
  footer: string | null;
  main: string;
  increasing: boolean|null;
  width: string;
  size: string;
}
interface arrowProbs {
  increasing: boolean;
}
function Arrow({ increasing }: arrowProbs) {
  if (increasing) {
    return (
      <div data-svg-wrapper>
        <svg
          width="38"
          height="37"
          viewBox="0 0 38 37"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.25 20.5833L19 15.8333L23.75 20.5833"
            stroke="#DE2200"
            strokeWidth="3.16667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  return (
    <div data-svg-wrapper>
      <svg
        width="38"
        height="37"
        viewBox="0 0 38 37"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.75 15.8333L19 20.5833L14.25 15.8333"
          stroke="#00DF81"
          stroke-width="3.16667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  );
}
export default function ComputeCard({header,footer,main,increasing,width,size}:probs){
    // provide width in the classname, the min is to fit content. 
    // outer flex div
    let bottomPadding = footer===null? "pb-[2.75rem]":"";
    if (size==="md"){
    return(
    
    <div className={`min-w-fit bg-white font-sans p-[1rem] flex flex-col gap-1 w-[${width}] rounded-[23px] ${bottomPadding}`}>
        <div className="header text-black/50 text-base leading-normal">{header}</div>

        <div className="flex flex-row gap-8 [@container(min-width:140px):gap-[21px]]">
            
            <div className="text-black text-[1.75rem] font-medium font-sans leading-9">{main}</div>
            {/* Want to check if increasing is not null and if so I want to put a div here */}
            {
                increasing!==null && (<Arrow increasing={increasing}/>)
            }
        </div>
             {/* Want to check if footer is not null and if so I want to put a div here */}
             {
                footer!==null && (<div className="text-black text-base font-normal font-sans leading-normal">{footer}</div>)
            }
            
    </div>
    
    )
  }
  if (size==="sm"){
    return(
    <div className={`min-w-fit bg-white font-sans px-2 py-[0.88rem] flex flex-col gap-1 w-[${width}] rounded-[23px] ${bottomPadding}`}>
        <div className="header text-black/50 text-base leading-normal">{header}</div>

        <div className="flex flex-row gap-2 [@container(min-width:140px):gap-[21px]]">
            
            <div className="text-black text-[1.75rem] font-medium font-sans leading-9">{main}</div>
            {/* Want to check if increasing is not null and if so I want to put a div here */}
            {
                increasing!==null && (<Arrow increasing={increasing}/>)
            }
        </div>
             {/* Want to check if footer is not null and if so I want to put a div here */}
             {
                footer!==null && (<div className="text-black text-base font-normal font-sans leading-normal">{footer}</div>)
            }
            
    </div>
    )
  }
}
