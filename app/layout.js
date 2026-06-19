import './globals.css';

export const metadata = {
  title: 'WeatherJS',
  description: 'A simple Next.js weather app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
