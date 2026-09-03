import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center bg-surface px-5 py-12 sm:py-16">
      <Link href="/" className="mb-10 flex items-center">
        <Image src="/brand/images/agriminds_svg.svg" alt="AgriMinds" width={612} height={139} priority className="h-9 w-auto object-contain" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
