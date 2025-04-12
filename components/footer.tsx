export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0 flex flex-col justify-center items-center">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} AlkoGuessr. All rights reserved.
        </p>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          This is a fan project and is not affiliated with Alko.
        </p>
      </div>
    </footer>
  );
}
