import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">PneumoAI</h3>
            <p className="text-sm text-muted-foreground">
              AI-assisted pneumonia detection for educational and research purposes.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <div className="space-y-2">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary block">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary block">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary block">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <p className="text-sm text-muted-foreground">support@pneumoai.com</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2024 PneumoAI. All rights reserved. Not for clinical use.
          </p>
        </div>
      </div>
    </footer>
  )
}
