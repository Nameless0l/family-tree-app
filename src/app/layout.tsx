import { Inter } from 'next/font/google';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Arbre Généalogique Familial',
  description: 'Application pour visualiser et explorer votre arbre généalogique',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Mon Arbre Généalogique</h1>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-100 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} - Projet d'Arbre Généalogique</p>
          </div>
        </footer>
      </body>
    </html>
  );
}