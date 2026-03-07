import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">
              Namangan Elonlar
            </h3>
            <p className="text-sm">
              Namangan uchun e'lonlar platformasi. Sotib oling, soting,
              xizmatlarni toping.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Kategoriyalar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/nedvizhimost" className="hover:text-primary-400">
                  Ko'chmas mulk
                </Link>
              </li>
              <li>
                <Link href="/category/avtomobili" className="hover:text-primary-400">
                  Avtomobillar
                </Link>
              </li>
              <li>
                <Link href="/category/elektronika" className="hover:text-primary-400">
                  Elektronika
                </Link>
              </li>
              <li>
                <Link href="/category/uslugi" className="hover:text-primary-400">
                  Xizmatlar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Ma'lumot</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-400">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-primary-400">
                  Qoidalar
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400">
                  Kontaktlar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Yordam</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-primary-400">
                  Yordam
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Namangan Elonlar. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}

