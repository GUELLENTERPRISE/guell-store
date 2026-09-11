import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: 'Get to Know Us',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers', path: '/careers' },
        { label: 'Press Releases', path: '/press' },
        { label: 'GÜELL Science', path: '/science' },
      ],
    },
    {
      title: 'Make Money with Us',
      links: [
        { label: 'Sell on GÜELL', path: '/sell' },
        { label: 'Become an Affiliate', path: '/affiliate' },
        { label: 'Advertise Your Products', path: '/advertising' },
        { label: 'Self-Publish with Us', path: '/publish' },
      ],
    },
    {
      title: 'GÜELL Payment Products',
      links: [
        { label: 'GÜELL Business Card', path: '/business-card' },
        { label: 'Shop with Points', path: '/points' },
        { label: 'Reload Your Balance', path: '/reload' },
        { label: 'Currency Converter', path: '/currency' },
      ],
    },
    {
      title: 'Let Us Help You',
      links: [
        { label: 'Your Account', path: '/?tab=account' },
        { label: 'Your Orders', path: '/?tab=orders' },
        { label: 'Shipping Rates & Policies', path: '/shipping' },
        { label: 'Returns & Replacements', path: '/returns' },
        { label: 'Manage Your Content', path: '/content' },
        { label: 'Help', path: '/help' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-800 text-white mt-12" role="contentinfo">
      {/* Back to top bar */}
      <div 
        className="bg-gray-700 hover:bg-gray-600 text-center py-4 cursor-pointer transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="text-sm font-medium">Back to top</span>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-base mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-sm text-gray-300 hover:text-white hover:underline transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and copyright */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/a049a212-1421-489b-aa8c-83da074e2508.png" 
              alt="GÜELL – Home" 
              className="h-8 cursor-pointer" 
              onClick={() => navigate('/')}
              loading="lazy"
              width="96"
              height="32"
            />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GÜELL. All rights reserved.
            </span>
          </div>

          {/* Social media links */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Legal links */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <button onClick={() => navigate('/terms')} className="hover:text-white hover:underline">
            Terms & Conditions
          </button>
          <span>•</span>
          <button onClick={() => navigate('/privacy')} className="hover:text-white hover:underline">
            Privacy Policy
          </button>
          <span>•</span>
          <button onClick={() => navigate('/cookies')} className="hover:text-white hover:underline">
            Cookies Notice
          </button>
          <span>•</span>
          <button onClick={() => navigate('/accessibility')} className="hover:text-white hover:underline">
            Accessibility
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span>Free Shipping on Orders $25+</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            <span>Easy Returns</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>24/7 Customer Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
