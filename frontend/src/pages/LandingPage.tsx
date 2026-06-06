import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  GraduationCap, 
  Languages, 
  Sun, 
  Moon, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Simple animation for numbers
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [enrolmentSaved, setEnrolmentSaved] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [officers, setOfficers] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 50;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setSchoolsCount(Math.min(Math.floor((350 / steps) * step), 350));
      setEnrolmentSaved(Math.min(parseFloat(((94.2 / steps) * step).toFixed(1)), 94.2));
      setAccuracy(Math.min(parseFloat(((89.4 / steps) * step).toFixed(1)), 89.4));
      setOfficers(Math.min(Math.floor((120 / steps) * step), 120));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#05050f] text-white flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* Top Navbar */}
      <nav className="w-full border-b border-white/5 bg-[#05050f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#a855f7] to-[#00e5ff] shadow-md shadow-cyan-500/10">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5 leading-none">
              <span className="text-red-500 font-extrabold">ಕನ್ನಡ</span>
              <span className="text-yellow-400 font-bold">ಸೇವಾ</span>
              <span className="text-xs font-normal border-l border-white/10 pl-2 text-slate-400 hidden sm:inline">
                Education AI Portal
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language switch */}
            <button
              onClick={() => changeLanguage(language === 'en' ? 'kn' : 'en')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 text-xs font-medium cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5 text-cyan-400" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {/* Theme Toggle placeholder (always dark, but support toggle click) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full border border-white/10 hover:bg-white/5 cursor-pointer text-yellow-400"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Student Portal button */}
            <button 
              onClick={() => {
                navigate('/login?mode=student');
              }}
              className="hidden md:inline-flex text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-all"
            >
              {language === 'en' ? 'Student Portal' : 'ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್'}
            </button>

            {/* Access Platform */}
            <button
              onClick={() => navigate('/login')}
              className="btn-gradient px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {language === 'en' ? 'Access Platform →' : 'ವೇದಿಕೆ ಪ್ರವೇಶಿಸಿ →'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-xs text-cyan-400 mb-8 animate-pulse-soft">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{language === 'en' ? 'SYSTEM ONLINE · PROMOTING KANNADA LITERACY' : 'ಸಿಸ್ಟಮ್ ಆನ್‌ಲೈನ್ · ಕನ್ನಡ ಸಾಕ್ಷರತೆ ಪ್ರಚಾರ'}</span>
        </div>

        {/* Giant heading */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl leading-tight font-mono-header">
          <span className="text-gradient font-extrabold">
            {language === 'en' ? 'Strengthening Kannada-Medium' : 'ಕನ್ನಡ ಮಾಧ್ಯಮ ಬಲಪಡಿಸುವುದು'}
          </span>
          <br />
          <span className="text-white">
            {language === 'en' ? 'Government Schools' : 'ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ಸಬಲೀಕರಣ'}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          {language === 'en' 
            ? 'AI-driven predictive insights to counter declining enrolment and address linguistic gaps in government institutes across Karnataka.'
            : 'ಕರ್ನಾಟಕದಾದ್ಯಂತ ಸರ್ಕಾರಿ ಸಂಸ್ಥೆಗಳಲ್ಲಿ ದಾಖಲಾತಿ ಇಳಿಕೆ ಮತ್ತು ಭಾಷಾ ಅಂತರವನ್ನು ನಿವಾರಿಸಲು ಎಐ-ಚಾಲಿತ ಮುನ್ಸೂಚಕ ಒಳನೋಟಗಳು.'}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="btn-gradient px-6 py-3 rounded-xl text-sm font-semibold shadow-xl shadow-cyan-500/30 flex items-center space-x-2 cursor-pointer"
          >
            <span>{language === 'en' ? 'Access Platform' : 'ವೇದಿಕೆ ಪ್ರವೇಶಿಸಿ'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('solutions');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-xl text-sm font-semibold border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer"
          >
            {language === 'en' ? 'Learn More' : 'ಹೆಚ್ಚು ತಿಳಿಯಿರಿ'}
          </button>
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-y border-white/5 bg-[#0d0d1f]/30 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono-header">{schoolsCount}+</span>
            <span className="text-xs text-slate-400 mt-2 text-center">
              {language === 'en' ? 'Schools Tracked' : 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ಶಾಲೆಗಳು'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono-header">{enrolmentSaved}%</span>
            <span className="text-xs text-slate-400 mt-2 text-center">
              {language === 'en' ? 'Enrolment Saved' : 'ಉಳಿಸಿದ ದಾಖಲಾತಿ'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-pink-500 font-mono-header">{accuracy}%</span>
            <span className="text-xs text-slate-400 mt-2 text-center">
              {language === 'en' ? 'Prediction Accuracy' : 'ಮುನ್ಸೂಚನೆ ನಿಖರತೆ'}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono-header">{officers}+</span>
            <span className="text-xs text-slate-400 mt-2 text-center">
              {language === 'en' ? 'Active Officers' : 'ಸಕ್ರಿಯ ಅಧಿಕಾರಿಗಳು'}
            </span>
          </div>
        </div>
      </section>

      {/* State of the Art Solutions */}
      <section id="solutions" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-mono-header">
            {language === 'en' ? 'State-of-the-Art Solutions' : 'ಅತ್ಯಾಧುನಿಕ ಪರಿಹಾರಗಳು'}
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
            {language === 'en' 
              ? 'Modern analytics engineered to preserve regional language learning structures.'
              : 'ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಕಲಿಕಾ ರಚನೆಗಳನ್ನು ಉಳಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಆಧುನಿಕ ವಿಶ್ಲೇಷಣೆ.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glow-card p-8 flex flex-col h-full">
            <div className="h-12 w-12 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">
              {language === 'en' ? 'Enrolment Analytics' : 'ದಾಖಲಾತಿ ವಿಶ್ಲೇಷಣೆ'}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {language === 'en'
                ? 'Identify taluk-level school dropouts and model future school-medium demographic transitions with precision.'
                : 'ತಾಲೂಕು ಮಟ್ಟದಲ್ಲಿ ಶಾಲಾ ಡ್ರಾಪ್‌ಔಟ್‌ಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಭವಿಷ್ಯದ ಶಾಲಾ ಮಾಧ್ಯಮ ಪರಿವರ್ತನೆಗಳನ್ನು ನಿಖರವಾಗಿ ರೂಪಿಸಿ.'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="glow-card p-8 flex flex-col h-full border-t-purple-500/20">
            <div className="h-12 w-12 rounded-xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center mb-6">
              <AlertTriangle className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">
              {language === 'en' ? 'Early Warning System' : 'ಶೀಘ್ರ ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ'}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {language === 'en'
                ? 'AI scoring models identify students showing early patterns of chronic absenteeism or linguistic proficiency gaps.'
                : 'ನಿರಂತರ ಗೈರುಹಾಜರಿ ಅಥವಾ ಭಾಷಾ ಪ್ರಾವೀಣ್ಯತೆಯ ಕೊರತೆ ತೋರುವ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಎಐ ಸ್ಕೋರಿಂಗ್ ಮಾದರಿಗಳು ಗುರುತಿಸುತ್ತವೆ.'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="glow-card p-8 flex flex-col h-full">
            <div className="h-12 w-12 rounded-xl bg-pink-950/50 border border-pink-500/20 flex items-center justify-center mb-6">
              <BookOpen className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">
              {language === 'en' ? 'Targeted Action Cards' : 'ಉದ್ದೇಶಿತ ಕ್ರಿಯಾ ಕಾರ್ಡ್‌ಗಳು'}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {language === 'en'
                ? 'Instantly deploy, track, and measure custom school intervention materials (e.g. Bilingual Bridge kits) in real-time.'
                : 'ಕಸ್ಟಮ್ ಶಾಲಾ ಮಧ್ಯಸ್ಥಿಕೆ ಸಾಮಗ್ರಿಗಳನ್ನು (ಉದಾ. ದ್ವಿಭಾಷಾ ಬ್ರಿಡ್ಜ್ ಕಿಟ್‌ಗಳು) ತಕ್ಷಣವೇ ನಿಯೋಜಿಸಿ, ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಅಳೆಯಿರಿ.'}
            </p>
          </div>
        </div>
      </section>

      {/* Impact in the Field */}
      <section className="py-20 border-t border-white/5 bg-[#0d0d1f]/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-mono-header">
              {language === 'en' ? 'Impact in the Field' : 'ಕ್ಷೇತ್ರದಲ್ಲಿ ಪರಿಣಾಮ'}
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              {language === 'en' ? 'What leaders are saying about Kannada Seva\'s deployment.' : 'ಕನ್ನಡ ಸೇವಾ ನಿಯೋಜನೆಯ ಬಗ್ಗೆ ನಾಯಕರು ಏನು ಹೇಳುತ್ತಿದ್ದಾರೆ.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="glow-card p-8 bg-[#0d0d1f]/50 border-white/5">
              <p className="text-slate-300 italic text-sm leading-relaxed">
                {language === 'en'
                  ? '"Kannada Seva has completely transformed how our taluk monitors student attendance and prevents medium transitions. The predictive model flag system allowed us to rescue 40+ admissions this semester alone."'
                  : '"ಕನ್ನಡ ಸೇವಾ ನಮ್ಮ ತಾಲೂಕು ವಿದ್ಯಾರ್ಥಿಗಳ ಹಾಜರಾತಿಯನ್ನು ಹೇಗೆ ಗಮನಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಬದಲಾಯಿಸಿದೆ. ಮುನ್ಸೂಚಕ ಮಾದರಿ ವ್ಯವಸ್ಥೆಯು ಈ ಸೆಮಿಸ್ಟರ್‌ನಲ್ಲೇ 40 ಕ್ಕೂ ಹೆಚ್ಚು ದಾಖಲಾತಿಗಳನ್ನು ಉಳಿಸಲು ನಮಗೆ ಸಹಾಯ ಮಾಡಿದೆ."'}
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-cyan-950 flex items-center justify-center font-bold text-cyan-400">
                  SK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Suresh Kumar</h4>
                  <p className="text-xs text-slate-400">BEO, Mangaluru</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glow-card p-8 bg-[#0d0d1f]/50 border-white/5">
              <p className="text-slate-300 italic text-sm leading-relaxed">
                {language === 'en'
                  ? '"Deploying Bilingual Bridge workbooks based on automated linguistic disparity warnings was seamless. Our field workers saved hours of diagnostics using the AI alerts checklist."'
                  : '"ಸ್ವಯಂಚಾಲಿತ ಭಾಷಾ ಕೊರತೆಯ ಎಚ್ಚರಿಕೆಗಳ ಆಧಾರದ ಮೇಲೆ ದ್ವಿಭಾಷಾ ಬ್ರಿಡ್ಜ್ ಕಾರ್ಯಪುಸ್ತಕಗಳನ್ನು ನಿಯೋಜಿಸುವುದು ತುಂಬಾ ಸುಲಭವಾಯಿತು. ನಮ್ಮ ಸಿಬ್ಬಂದಿ ಎಐ ಎಚ್ಚರಿಕೆಗಳ ಪಟ್ಟಿಯನ್ನು ಬಳಸಿಕೊಂಡು ಗಂಟೆಗಟ್ಟಲೆ ರೋಗನಿರ್ಣಯ ಸಮಯವನ್ನು ಉಳಿಸಿದ್ದಾರೆ."'}
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-purple-950 flex items-center justify-center font-bold text-purple-400">
                  AG
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dr. Asha Gowda</h4>
                  <p className="text-xs text-slate-400">NGO Lead, Vidya Trust</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 bg-[#05050f]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            ಕನ್ನಡ ಸೇವಾ © 2026. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span className="hover:text-white cursor-pointer">{language === 'en' ? 'Privacy Policy' : 'ಗೌಪ್ಯತಾ ನೀತಿ'}</span>
            <span className="hover:text-white cursor-pointer">{language === 'en' ? 'Terms of Service' : 'ಸೇವಾ ನಿಯಮಗಳು'}</span>
            <span className="hover:text-white cursor-pointer">{language === 'en' ? 'Support' : 'ಬೆಂಬಲ'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
