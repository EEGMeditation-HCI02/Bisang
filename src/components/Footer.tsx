import './CSS/Footer.css';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full rounded-t-[3rem] mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-16 py-20 w-full max-w-7xl mx-auto gap-8">
        <div className="font-headline italic text-2xl text-primary font-bold">
          BeeSang
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm uppercase tracking-widest text-on-surface-variant font-medium">
          <a className="hover:text-primary transition-colors" href="#">The Science</a>
          <a className="hover:text-primary transition-colors" href="#">Neuro-Privacy</a>
          <a className="hover:text-primary transition-colors" href="#">Our Story</a>
          <a className="hover:text-primary transition-colors" href="#">Support</a>
        </div>
        
        <div className="text-on-surface-variant text-sm text-center md:text-right">
          © {new Date().getFullYear()} BeeSang Sanctuary. Engineered for clarity.
        </div>
      </div>
    </footer>
  );
}
