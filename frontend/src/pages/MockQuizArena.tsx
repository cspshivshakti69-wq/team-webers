import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Play, 
  Clock, 
  Award, 
  ChevronRight, 
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';

interface Question {
  id: number;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  answer: number; // index of options (0-3)
}

interface Attempt {
  id: string;
  subjects: string[];
  score: string;
  date: string;
  timeTaken: string;
  difficulty: string;
}

// 20 Mock questions for evaluation
const QUIZ_QUESTIONS: Question[] = [
  { id: 1, subject: 'Physics', difficulty: 'Easy', question: 'What is the SI unit of electric current?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], answer: 1 },
  { id: 2, subject: 'Physics', difficulty: 'Medium', question: 'Which law describes the force between two charged particles?', options: ['Newton\'s Law', 'Coulomb\'s Law', 'Ohm\'s Law', 'Gauss\'s Law'], answer: 1 },
  { id: 3, subject: 'Physics', difficulty: 'Hard', question: 'What is the speed of light in a vacuum in standard scientific notation?', options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '1.5 x 10^8 m/s', '3 x 10^9 m/s'], answer: 0 },
  
  { id: 4, subject: 'Chemistry', difficulty: 'Easy', question: 'What is the chemical formula of common table salt?', options: ['H2O', 'NaCl', 'CO2', 'HCl'], answer: 1 },
  { id: 5, subject: 'Chemistry', difficulty: 'Medium', question: 'Which gas is released when calcium carbonate reacts with hydrochloric acid?', options: ['Oxygen', 'Carbon Dioxide', 'Hydrogen', 'Chlorine'], answer: 1 },
  { id: 6, subject: 'Chemistry', difficulty: 'Hard', question: 'What is the hybridization of carbon in methane (CH4)?', options: ['sp', 'sp2', 'sp3', 'sp3d'], answer: 2 },

  { id: 7, subject: 'Mathematics', difficulty: 'Easy', question: 'What is the derivative of x^2 with respect to x?', options: ['x', '2x', 'x^2', '2'], answer: 1 },
  { id: 8, subject: 'Mathematics', difficulty: 'Medium', question: 'What is the value of log10(1000)?', options: ['1', '2', '3', '10'], answer: 2 },
  { id: 9, subject: 'Mathematics', difficulty: 'Hard', question: 'What is the integral of 1/x dx?', options: ['e^x + C', 'ln|x| + C', 'x^2 + C', '-1/x^2 + C'], answer: 1 },

  { id: 10, subject: 'Biology', difficulty: 'Easy', question: 'Which organelle is known as the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'], answer: 1 },
  { id: 11, subject: 'Biology', difficulty: 'Medium', question: 'Which blood cells are responsible for carrying oxygen throughout the body?', options: ['White Blood Cells', 'Red Blood Cells', 'Platelets', 'Plasma'], answer: 1 },
  { id: 12, subject: 'Biology', difficulty: 'Hard', question: 'What is the primary site of photosynthesis in a plant cell?', options: ['Mitochondria', 'Chloroplast', 'Vacuole', 'Cytoplasm'], answer: 1 },

  { id: 13, subject: 'General Knowledge', difficulty: 'Easy', question: 'What is the capital city of Karnataka?', options: ['Mysuru', 'Hubballi', 'Bengaluru', 'Mangaluru'], answer: 2 },
  { id: 14, subject: 'General Knowledge', difficulty: 'Medium', question: 'Who is the famous Kannada poet known as "Rashtrakavi" who wrote the state anthem "Jaya Bharata Jananiya Tanujate"?', options: ['Kuvempu', 'D. R. Bendre', 'Masti Venkatesha Iyengar', 'Girish Karnad'], answer: 0 },
  { id: 15, subject: 'General Knowledge', difficulty: 'Hard', question: 'Which district in Karnataka is famous for Gol Gumbaz, the dome with whispering gallery?', options: ['Belagavi', 'Vijayapura', 'Dharwad', 'Bidar'], answer: 1 }
];

export const MockQuizArena: React.FC = () => {
  const [screen, setScreen] = useState<'CONFIG' | 'ACTIVE' | 'RESULTS'>('CONFIG');
  const [pastAttempts, setPastAttempts] = useState<Attempt[]>(() => {
    try {
      const saved = localStorage.getItem('ks-quiz-attempts');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });
  
  // Config filters
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['All']);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Active quiz variables
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  // Timer variables
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // 1. Configure and Start Quiz
  const handleToggleSubject = (sub: string) => {
    if (sub === 'All') {
      setSelectedSubjects(['All']);
      return;
    }

    setSelectedSubjects(prev => {
      const filtered = prev.filter(s => s !== 'All');
      if (filtered.includes(sub)) {
        const next = filtered.filter(s => s !== sub);
        return next.length === 0 ? ['All'] : next;
      } else {
        return [...filtered, sub];
      }
    });
  };

  const startQuiz = () => {
    // Filter questions
    let pool = [...QUIZ_QUESTIONS];
    
    if (!selectedSubjects.includes('All')) {
      pool = pool.filter(q => selectedSubjects.includes(q.subject));
    }
    
    if (selectedDifficulty !== 'All') {
      pool = pool.filter(q => q.difficulty === selectedDifficulty);
    }

    // Shuffle and pick limit
    pool = pool.sort(() => 0.5 - Math.random()).slice(0, questionCount);

    if (pool.length === 0) {
      alert("No questions found for the selected criteria. Try easing filters!");
      return;
    }

    setQuizQuestions(pool);
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedAnswer(null);
    setTimeLeft(pool.length * 60); // 1 minute per question
    startTimeRef.current = Date.now();
    setScreen('ACTIVE');
  };

  // Timer effect
  useEffect(() => {
    if (screen === 'ACTIVE') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  // Next Question
  const handleNext = () => {
    if (selectedAnswer !== null) {
      setUserAnswers(prev => ({ ...prev, [currentIndex]: selectedAnswer }));
    }

    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Load already answered if exists
      setSelectedAnswer(userAnswers[currentIndex + 1] !== undefined ? userAnswers[currentIndex + 1] : null);
    } else {
      finishQuiz();
    }
  };

  // Finish Quiz
  const finishQuiz = () => {
    // Add final answer if selected
    let finalAnswers = { ...userAnswers };
    if (selectedAnswer !== null) {
      finalAnswers[currentIndex] = selectedAnswer;
    }

    // Calculate score
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.answer) {
        correct++;
      }
    });

    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const min = Math.floor(elapsedSeconds / 60);
    const sec = elapsedSeconds % 60;
    const timeString = `${min}m ${sec}s`;

    const attemptScore = `${correct}/${quizQuestions.length}`;
    
    // Save attempt
    const newAttempt: Attempt = {
      id: `att-${Date.now()}`,
      subjects: selectedSubjects.includes('All') ? ['All Subjects'] : selectedSubjects,
      score: attemptScore,
      date: new Date().toLocaleDateString(),
      timeTaken: timeString,
      difficulty: selectedDifficulty
    };

    setPastAttempts(prev => {
      const updated = [newAttempt, ...prev];
      try {
        localStorage.setItem('ks-quiz-attempts', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save attempt', err);
      }
      return updated;
    });
    setScreen('RESULTS');
  };

  const currentQuestion = quizQuestions[currentIndex];
  const progressPercentage = quizQuestions.length > 0 ? ((currentIndex + 1) / quizQuestions.length) * 100 : 0;

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#05050f] text-white space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-mono-header">Mock Quiz Arena</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Practice competitive exam questions across 5 subjects.
          </p>
        </div>
      </div>

      {/* ==========================================
          1. CONFIGURATION VIEW
          ========================================== */}
      {screen === 'CONFIG' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          
          {/* Configure Panel (7 Cols) */}
          <div className="lg:col-span-7 glow-card p-6 space-y-6">
            <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header flex items-center space-x-2">
              <Sliders className="h-4.5 w-4.5 text-cyan-400" />
              <span>Configure Quiz</span>
            </h3>

            {/* Subject Selector */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Select Subjects
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Knowledge'].map(sub => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => handleToggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-400 border-transparent hover:border-white/10'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {['All', 'Easy', 'Medium', 'Hard'].map(diff => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                          : 'bg-white/5 text-slate-400 border-transparent hover:border-white/10'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Number of Questions
                </label>
                <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
                  {questionCount} Questions
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>5</span>
                <span>20</span>
                <span>40</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startQuiz}
              className="w-full btn-gradient py-3 rounded-xl text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-1.5 cursor-pointer mt-4"
            >
              <Play className="h-4 w-4" />
              <span>Start Quiz Arena</span>
            </button>

          </div>

          {/* Past Attempts (5 Cols) */}
          <div className="lg:col-span-5 glow-card p-6 flex flex-col justify-between h-[360px]">
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono-header flex items-center space-x-2">
                <Trophy className="h-4.5 w-4.5 text-yellow-500" />
                <span>Past Attempts</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Evaluation results recorded on this device.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {pastAttempts.length > 0 ? (
                pastAttempts.map(att => (
                  <div key={att.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs hover:border-white/10 transition-colors">
                    <div>
                      <div className="font-bold text-white">{att.subjects.join(', ')}</div>
                      <div className="text-[9px] text-slate-500 mt-1 flex space-x-2 font-mono">
                        <span>📅 {att.date}</span>
                        <span>⏱ {att.timeTaken}</span>
                        <span>📶 {att.difficulty}</span>
                      </div>
                    </div>

                    <span className="h-9 w-9 rounded-full bg-cyan-950/80 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 font-mono text-xs">
                      {att.score}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-slate-600 font-sans mt-6">
                  No attempts yet. Start your first quiz!
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          2. ACTIVE QUIZ VIEW
          ========================================== */}
      {screen === 'ACTIVE' && currentQuestion && (
        <div className="max-w-2xl mx-auto glow-card p-8 space-y-6 font-sans relative">
          
          {/* Active Header (Question Count + Timer) */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
                {currentQuestion.subject} · {currentQuestion.difficulty}
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                Question {currentIndex + 1} of {quizQuestions.length}
              </h3>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-400 font-mono text-xs font-bold">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="py-4">
            <h2 className="text-lg font-bold text-white leading-relaxed font-mono-header">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((opt, idx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedAnswer === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full flex items-center p-4 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow shadow-cyan-500/5'
                      : 'bg-[#0d0d1f] text-slate-300 border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                >
                  <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold font-mono mr-3 text-xs transition-colors ${
                    isSelected ? 'bg-cyan-400 text-black' : 'bg-white/5 text-slate-400'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Controls (Progress bar + Next button) */}
          <div className="border-t border-white/5 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              {/* Progress bar */}
              <div className="flex-1 max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{currentIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          3. RESULTS SCORECARD VIEW
          ========================================== */}
      {screen === 'RESULTS' && (
        <div className="max-w-md mx-auto glow-card p-8 text-center space-y-6 font-sans">
          
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-500/35 mb-2 text-cyan-400">
            <Award className="h-6 w-6 animate-bounce" />
          </div>

          <div>
            <h2 className="text-xl font-bold font-mono-header text-white">Quiz Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your scores have been compiled and registered successfully.
            </p>
          </div>

          {/* Circular Score display */}
          <div className="relative flex items-center justify-center py-6">
            <div className="h-32 w-32 rounded-full border-4 border-cyan-500/20 flex flex-col items-center justify-center bg-[#0d0d1f] shadow-lg shadow-cyan-500/5 relative">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono-header">
                {pastAttempts[0]?.score || '0/0'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Score</span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 gap-3 bg-[#0d0d1f] p-4 rounded-xl border border-white/5 text-xs">
            <div className="text-center p-2">
              <span className="text-slate-500 block">Time Taken</span>
              <span className="font-bold text-white mt-1 block">{pastAttempts[0]?.timeTaken || '0s'}</span>
            </div>
            <div className="text-center p-2">
              <span className="text-slate-500 block">Difficulty</span>
              <span className="font-bold text-white mt-1 block">{pastAttempts[0]?.difficulty || 'All'}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setScreen('CONFIG')}
              className="w-1/2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => setScreen('CONFIG')}
              className="w-1/2 btn-gradient py-3 rounded-xl text-xs font-extrabold shadow shadow-cyan-500/10 cursor-pointer flex justify-center items-center space-x-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Back to Arena</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
