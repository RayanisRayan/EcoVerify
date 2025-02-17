interface probs{
    main:string;
}
export default function Notifications({main}:probs){
    return <div className="w-fit rounded-md bg-black/5 p-[6.97px] hover:bg-black/10"><p className="text-black text-xs font-sans font-normal leadding-[1rem]">{main}</p></div>
}