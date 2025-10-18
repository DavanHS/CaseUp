import { cn } from "@/lib/utils";
import Image from "next/image";

interface PhoneProps extends React.HTMLAttributes<HTMLDivElement> {
  imgSrc?: string;
  dark?: boolean;
}

const Phone = ({ imgSrc, className, dark = false, ...props }: PhoneProps) => {
  return (
    <div
      className={cn(
        "relative pointer-events-none z-50 overflow-hidden",
        className
      )}
      {...props}
    >
      <Image
        src={
          dark
            ? "/phone-template-dark-edges.png"
            : "/phone-template-white-edges.png"
        }
        alt="Phone case template"
        className="pointer-events-none z-2 select-none relative w-full h-full"
        width={896}
        height={1831}
        priority
      />
      <div className="absolute z-1 inset-0 overflow-hidden">
        <Image
          src={imgSrc || ""}
          alt="Custom phone case design"
          className="object-cover w-full h-full"
          width={896}
          height={1831}
        />
      </div>
    </div>
  );
};


export default Phone;