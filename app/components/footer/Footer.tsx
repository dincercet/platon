const footer = "Copyright © 2024";

export default function Footer({ primary }: { primary: boolean }) {
  return (
    <div className="text-center">
      {primary ? (
        <p className="py-8 dark:bg-indigo-950 dark:shadow-inner dark:shadow-zinc-950">
          {footer}
        </p>
      ) : (
        <p className="py-8 dark:bg-zinc-950 dark:shadow-inner dark:shadow-indigo-950">
          {footer}
        </p>
      )}
    </div>
  );
}
