import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { History, LogIn, LogOut, Menu, Sparkles, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('nav.logout'));
      navigate("/");
    }
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
          <img 
            src={logo} 
            alt="PalmSeer Logo" 
            className="h-10 w-10 group-hover:animate-pulse-glow transition-all"
          />
          <span className="font-display text-xl text-gradient-gold">PalmSeer</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/sample">
            <Button variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{t('nav.sampleAnalysis')}</span>
            </Button>
          </Link>
          
          <Link to="/history">
            <Button variant="ghost" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              <span>{t('nav.history')}</span>
            </Button>
          </Link>
          
          {user ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>{t('nav.logout')}</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span>{t('nav.login')}</span>
              </Button>
            </Link>
          )}

          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link to="/sample" onClick={closeMenu}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{t('nav.sampleAnalysis')}</span>
              </Button>
            </Link>
            
            <Link to="/history" onClick={closeMenu}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <History className="h-4 w-4" />
                <span>{t('nav.history')}</span>
              </Button>
            </Link>
            
            {user ? (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>{t('nav.logout')}</span>
              </Button>
            ) : (
              <Link to="/auth" onClick={closeMenu}>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>{t('nav.login')}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;