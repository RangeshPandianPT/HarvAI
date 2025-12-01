import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Language } from "@/i18n/translations";
import { Globe } from "lucide-react";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "english", name: "English", flag: "🇬🇧" },
  { code: "hindi", name: "हिंदी", flag: "🇮🇳" },
  { code: "kannada", name: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "tamil", name: "தமிழ்", flag: "🇮🇳" },
  { code: "telugu", name: "తెలుగు", flag: "🇮🇳" },
  { code: "marathi", name: "मराठी", flag: "🇮🇳" }
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className="w-[180px] bg-background/80 backdrop-blur-sm border-primary/20">
        <Globe className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};