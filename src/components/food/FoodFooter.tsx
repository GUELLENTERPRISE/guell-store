import { Utensils, Truck, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const FoodFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "About Us", href: "/food/about" },
    { name: "Restaurants", href: "/food/restaurants" },
    { name: "Delivery Info", href: "/food/delivery" },
    { name: "Contact", href: "/food/contact" },
    { name: "Careers", href: "/food/careers" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/guellfood", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/guellfood", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/guellfood", label: "Instagram" }
  ];

  return (
    <footer className="bg-orange-700 text-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-card/20 rounded-full flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">GÜELL Food</h3>
                <p className="text-white/90">Delicious meals, delivered fast</p>
              </div>
            </div>
            
            <p className="text-white/80 leading-relaxed mb-6">
              Your trusted partner for restaurant delivery. We connect you with the best local restaurants, 
              ensuring fresh, delicious food arrives at your doorstep. From quick lunches to family dinners, 
              we're here to satisfy every craving.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>30-45 min delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>1-800-FOOD</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>support@guellfood.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Categories</h4>
            <ul className="space-y-3">
              {['Pizza', 'Burgers', 'Sushi', 'Asian', 'Mexican', 'Healthy'].map((category) => (
                <li key={category}>
                  <a 
                    href={`/food?category=${category.toLowerCase()}`}
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="/food/help" className="text-white/80 hover:text-white transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/food/faq" className="text-white/80 hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/food/terms" className="text-white/80 hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/food/privacy" className="text-white/80 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get the App</h4>
            <div className="bg-card/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <div className="text-white text-xs font-bold">App</div>
                </div>
                <div className="text-white/90">
                  <div className="font-semibold">Download GÜELL Food</div>
                  <div className="text-sm">iOS & Android</div>
                </div>
              </div>
              <div className="flex gap-2">
                <a href="#" className="bg-card/20 hover:bg-card/30 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors">
                  App Store
                </a>
                <a href="#" className="bg-card/20 hover:bg-card/30 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors">
                  Google Play
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Left Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Available in 50+ cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                <span className="text-sm">1000+ restaurants</span>
              </div>
            </div>

            {/* Middle Section - Newsletter */}
            <div className="flex-1 max-w-md">
              <div className="bg-card/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h4 className="font-semibold mb-2">Get Food Deals</h4>
                <p className="text-white/80 text-sm mb-3">Exclusive offers and restaurant news</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-card/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <button className="bg-card text-orange-600 hover:bg-muted px-4 py-2 rounded-lg font-medium transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section - Social */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm text-white/60 mb-2">Follow Us</div>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-card/20 hover:bg-card/30 rounded-full flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-orange-800 border-t border-orange-700 px-4 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/80">
            © {currentYear} GÜELL Food. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href="/food/terms" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="/food/privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="/food/cookies" className="hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FoodFooter;
