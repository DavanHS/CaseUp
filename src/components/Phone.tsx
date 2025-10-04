import { cn } from "@/lib/utils";

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
      <img
        src={
          dark
            ? "/phone-template-dark-edges.png"
            : "/phone-template-white-edges.png"
        }
        className="pointer-events-none z-2 select-none relative w-full h-full"
      />
      <div className="absolute z-1 inset-0 overflow-hidden">
        <img
          src={imgSrc}
          alt="overlaying phone image"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};


export default Phone;