import Image from "next/image";
import { ReactNode } from "react";

const AuthLayout = ({children}: {children: ReactNode}) => {
  return <>
  <nav className="flex w-full bg-slate-800 items-center gap-2 p-3 shadow-lg shadow-gray-900">
    <Image src="/brand/icon.png" alt="logo" width={50} height={50} />
    <h1 className="text-2xl font-bold text-slate-100">ClickToPlay</h1>
  </nav>
  {children}
  </>
};

export default AuthLayout;
