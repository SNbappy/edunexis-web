const LINK =
  "font-semibold text-foreground underline-offset-2 transition-colors duration-120 hover:text-primary hover:underline"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1400px] justify-end px-4 py-3 text-[11.5px] text-muted-foreground sm:px-6">
        <p>
          Developed by{" "}
          <a href="https://www.linkedin.com/in/snbappy/" target="_blank" rel="noopener noreferrer" className={LINK}>
            Md. Sabbir Hossain Bappy
          </a>{" "}
          at{" "}
          <a href="https://nowsin.me/" target="_blank" rel="noopener noreferrer" className={LINK}>
            CyberSecurity Lab
          </a>
        </p>
      </div>
    </footer>
  )
}
