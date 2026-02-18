import clsx from "clsx";

interface SkeletonLoaderProps {
  className?: string;
}

export default function SkeletonLoader({ className }: SkeletonLoaderProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 shadow-neu",
        className
      )}
    />
  );
}
