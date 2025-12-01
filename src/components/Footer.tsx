import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">HarvAI</h3>
            <p className="text-muted-foreground text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Creator Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('footer.creator')}</h3>
            <div className="space-y-2">
              <p className="text-foreground font-medium">RANGESHPANDIAN PT</p>
              <p className="text-muted-foreground text-sm">
                <a 
                  href="mailto:rangeshpandian@gmail.com" 
                  className="hover:text-primary transition-colors"
                >
                  rangeshpandian@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('footer.copyright')}</h3>
            <p className="text-muted-foreground text-sm">
              © 2024 HarvAI. {t('footer.rights')}
            </p>
            <p className="text-muted-foreground text-sm">
              {t('footer.developed')} RANGESHPANDIAN PT
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            {t('footer.mission')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;