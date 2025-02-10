"use client";
interface NavProps {
    name: string;
    isActive: boolean; // New prop for active state
    onClick: () => void; // New prop for click event
  }
export default function Navigation({name, isActive,onClick  }:NavProps) {
  return (
    <div className="mr-[1rem]"
      onClick={onClick}
      style={{
        minHeight: "3.125rem",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "0.625rem",
        display: "inline-flex",
      }}
    >
      <div
    //   height is not reflected
        style={{
          alignSelf: "stretch",
          height: "0.6875rem",
          background: isActive?"#031B1B":"#F2F3F4",
          borderBottomLeftRadius: 13.75,
          borderBottomRightRadius: 13.75,
        }}
      />
      <div
        style={{
          paddingLeft: "1rem",
          paddingRight: "1rem",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.625rem",
          display: "inline-flex",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "black",
            fontSize: "1.5rem",
            fontFamily: "Fira Sans",
            fontWeight: isActive ? "500" : "400",
            wordWrap: "break-word",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}
