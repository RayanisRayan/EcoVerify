import Grid from "../components/grid";
export default function Home() {
  return (
    <>
    <div className="absolute md:m-auto md:my-[30vh] md:w-[411px] md:h-[300px] md:rounded-[20px] left-0 right-0 bg-white  shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] z-10 flex flex-col md:gap-[1.664375rem] md:px-[2rem]">
      <div className="md:mt-[3.5rem]">
          <label className="w-[2.20125rem] text-black text-xs font-semibold font-['Fira Sans'] leading-[1.089375rem]">Email</label>
          <input className="w-full h-[31.37px] px-[10.46px] py-[6.97px] bg-white rounded-md border border-black/10 text-xs font-sans text-black font-[500]" placeholder="example@gmail.com"></input>
      </div>
      <div className="">
          <label className="w-[2.20125rem] text-black text-xs font-semibold font-['Fira Sans'] leading-[1.089375rem]">Password</label>
          <input className="w-full h-[31.37px] px-[10.46px] py-[6.97px] bg-white rounded-md border border-black/10 text-xs font-sans text-black font-[500]" id="password" type="password"></input>
      </div>
      <div className="mx-auto w-[50%] flex flex-col p-0 gap-0 align-middle">
            <div className="w-[100%] lg:h-[41.91px] lg:p-[10.46px] bg-gradient-to-r from-[#032221] to-[#2cc295] lg:rounded-[6.97px] flex-col justify-center items-center inline-flex hover:brightness-90"><p className="text-white lg:text-sm font-semibold font-['Fira Sans'] lg:leading-[20.91px]">Log In</p></div>
            <p className="text-center text-caribian_green text-[0.7rem] font-normal font-['Fira Sans'] underline leading-[20.91px] hover:brightness-90">Forgot your password?</p>
      </div>
    </div>
    {/* Background */}
    <div className=" fixed inset-0  bg-[#f2f3f4]  overflow-hidden flex ">
        <div className="absolute w-[1329px] h-[895px]  origin-top-left bg-gradient-to-b to-[#03624c] from-[#2cc295] rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[309px] -translate-x-[915px] -translate-y-[30%] " />
        <Grid></Grid>
        <div className="w-[973px] h-[895px] left-[80%] top-[500px] absolute bg-gradient-to-b from-[#03624c] to-[#2cc295] rounded-tl-[309px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-[10px]" />

    </div>
    </>
  );
}
