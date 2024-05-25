import { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
}

export default function BuilderWrapper({ children }: WrapperProps) {
  return <div className="border rounded-xl mb-4 shadow-lg">{children}</div>;
}
