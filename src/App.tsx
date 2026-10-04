/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { scenarios, Scenario, NOTIFICATION_ACTIONS, TacticalOption } from './data/scenarios';
import { 
  AlertTriangle, 
  Timer, 
  FileText, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Share2, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle,
  Clock, 
  ListOrdered,
  Users,
  Building2,
  Mail,
  ShieldAlert,
  Award,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

type AppStage = 'CHOICE' | 'REGISTRATION' | 'SCENARIO' | 'CLASSIFICATION' | 'REPORT';

const STANDARD_TIME_LIMIT = 360; // 6 minutes total (3 min read + 3 min classify)
const MAX_SESSION_TIME = 900; // 15 minutes absolute cutoff

export default function App() {
  const [stage, setAppStage] = useState<AppStage>('CHOICE');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  
  // Team Registration
  const [teamMembers, setTeamMembers] = useState<string[]>(['', '', '']);
  const [regError, setRegError] = useState<string>('');

  // Timing states
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(180); // 3 minutes per phase
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [isDrillActive, setIsDrillActive] = useState<boolean>(false);
  const [retriesCount, setRetriesCount] = useState<number>(0);

  // User answers
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [notificationSequence, setNotificationSequence] = useState<Record<string, number>>(
    Object.fromEntries(NOTIFICATION_ACTIONS.map(a => [a.id, 0]))
  );
  const [selectedTacticalIds, setSelectedTacticalIds] = useState<string[]>([]);

  // Open scenario selection
  const handleSelectGroup = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setTeamMembers(['', '', '']);
    setRegError('');
    setAppStage('REGISTRATION');
  };

  // Add / Remove member slots
  const handleAddMemberSlot = () => {
    if (teamMembers.length < 6) {
      setTeamMembers(prev => [...prev, '']);
    }
  };

  const handleRemoveMemberSlot = (index: number) => {
    if (teamMembers.length > 3) {
      setTeamMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    setTeamMembers(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Start the drill after registration
  const handleStartDrill = () => {
    const validMembers = teamMembers.map(m => m.trim()).filter(Boolean);
    if (validMembers.length < 3) {
      setRegError('At least 3 member names are required / يلزم إدخال 3 أسماء أعضاء على الأقل');
      return;
    }
    if (validMembers.length > 6) {
      setRegError('Maximum 6 members allowed / الحد الأقصى 6 أعضاء فقط');
      return;
    }

    setRegError('');
    setPhaseTimeLeft(180); // 3 minutes reading time
    setTotalElapsedSeconds(0);
    setRetriesCount(0);
    setSelectedLevel('');
    setNotificationSequence(Object.fromEntries(NOTIFICATION_ACTIONS.map(a => [a.id, 0])));
    setSelectedTacticalIds([]);
    setIsDrillActive(true);
    setAppStage('SCENARIO');
  };

  // Master Clock & Phase countdown
  useEffect(() => {
    let interval: number;
    if (isDrillActive) {
      interval = window.setInterval(() => {
        setTotalElapsedSeconds(prev => {
          const nextTotal = prev + 1;
          // Absolute 15-minute max session cutoff
          if (nextTotal >= MAX_SESSION_TIME) {
            setIsDrillActive(false);
            setAppStage('REPORT');
            return MAX_SESSION_TIME;
          }
          return nextTotal;
        });

        setPhaseTimeLeft(prev => {
          if (prev <= 1) {
            // When phase 1 runs out (3 mins), auto-advance to classification
            if (stage === 'SCENARIO') {
              setAppStage('CLASSIFICATION');
              return 180; // 3 min for classification
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDrillActive, stage]);

  // Proceed from Reading to Classification
  const handleProceedToClassification = () => {
    setAppStage('CLASSIFICATION');
    setPhaseTimeLeft(180);
  };

  // Sequence dropdown handler - strictly unique
  const handleSequenceChange = (actionId: string, position: number) => {
    setNotificationSequence(prev => {
      const next = { ...prev };
      if (position === 0) {
        next[actionId] = 0;
        return next;
      }
      // Unselect any other action having this position
      Object.keys(next).forEach(id => {
        if (next[id] === position && id !== actionId) {
          next[id] = 0;
        }
      });
      next[actionId] = position;
      return next;
    });
  };

  // Tactical checkbox toggle
  const handleToggleTactical = (optId: string) => {
    setSelectedTacticalIds(prev => 
      prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId]
    );
  };

  // Sorted user notification sequence
  const sortedUserSequence = useMemo(() => {
    return Object.entries(notificationSequence)
      .filter(([_, pos]) => pos > 0)
      .sort(([_, a], [__, b]) => a - b)
      .map(([id]) => {
        const item = NOTIFICATION_ACTIONS.find(a => a.id === id);
        return {
          id,
          labelEn: item?.labelEn || '',
          labelAr: item?.labelAr || ''
        };
      });
  }, [notificationSequence]);

  // Calculation of Overtime / Negative Time
  const negativeSeconds = Math.max(0, totalElapsedSeconds - STANDARD_TIME_LIMIT);
  const isOvertime = negativeSeconds > 0;

  const formatMinSec = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate score (0-100)
  const scoreBreakdown = useMemo(() => {
    if (!selectedScenario) return { totalScore: 0, levelScore: 0, sequenceScore: 0, tacticalScore: 0, penalty: 0, isPassed: false };

    // 1. Classification (30 pts)
    let levelScore = 0;
    if (selectedLevel === selectedScenario.correctLevel) {
      levelScore = 30;
    }

    // 2. Notification Sequence (35 pts)
    let sequenceScore = 0;
    const userOrderedIds = sortedUserSequence.map(s => s.id);
    const key = selectedScenario.correctNotificationSequence;
    
    // Check key notifications match
    if (userOrderedIds.length > 0) {
      let matchedInOrder = 0;
      let lastIndexInUser = -1;
      
      key.forEach((keyId) => {
        const idx = userOrderedIds.indexOf(keyId);
        if (idx > -1 && idx > lastIndexInUser) {
          matchedInOrder++;
          lastIndexInUser = idx;
        }
      });
      const ratio = matchedInOrder / key.length;
      sequenceScore = Math.round(ratio * 35);
    }

    // 3. Tactical Actions (35 pts)
    let tacticalScore = 0;
    const correctOptions = selectedScenario.tacticalOptions.filter(o => o.isCorrect);
    const wrongOptions = selectedScenario.tacticalOptions.filter(o => !o.isCorrect);

    let correctSelected = 0;
    let wrongSelected = 0;

    selectedTacticalIds.forEach(id => {
      if (correctOptions.some(o => o.id === id)) correctSelected++;
      if (wrongOptions.some(o => o.id === id)) wrongSelected++;
    });

    const correctRatio = correctOptions.length > 0 ? (correctSelected / correctOptions.length) : 1;
    const rawTactical = correctRatio * 35 - (wrongSelected * 10);
    tacticalScore = Math.max(0, Math.round(rawTactical));

    // Time & Retry penalties
    const overtimeMinutes = Math.floor(negativeSeconds / 60);
    const timePenalty = overtimeMinutes * 2; // -2 pts per min of overtime
    const retryPenalty = retriesCount * 3; // -3 pts per retry
    const totalPenalty = timePenalty + retryPenalty;

    const rawTotal = levelScore + sequenceScore + tacticalScore;
    const finalScore = Math.max(0, Math.min(100, Math.round(rawTotal - totalPenalty)));
    const isPassed = finalScore >= 70;

    return {
      totalScore: finalScore,
      levelScore,
      sequenceScore,
      tacticalScore,
      penalty: totalPenalty,
      timePenalty,
      retryPenalty,
      isPassed
    };
  }, [selectedScenario, selectedLevel, sortedUserSequence, selectedTacticalIds, negativeSeconds, retriesCount]);

  // Submit assessment
  const handleSubmitAssessment = () => {
    setIsDrillActive(false);
    setAppStage('REPORT');
    if (scoreBreakdown.isPassed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0f172a', '#10b981', '#f59e0b']
      });
    }
  };

  // Retry assessment (within 15 minutes)
  const handleRetryAssessment = () => {
    if (totalElapsedSeconds >= MAX_SESSION_TIME) return;
    setRetriesCount(prev => prev + 1);
    setIsDrillActive(true);
    setAppStage('CLASSIFICATION');
  };

  // Reset drill completely
  const handleResetToHome = () => {
    setIsDrillActive(false);
    setSelectedScenario(null);
    setAppStage('CHOICE');
    setTotalElapsedSeconds(0);
    setRetriesCount(0);
  };

  // Export PDF Report
  const exportPDF = useCallback(() => {
    if (!selectedScenario) return;
    
    const doc = new jsPDF();
    const margin = 18;
    let y = 18;

    // Header with KSIA Branding
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 32, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('KSIA EMERGENCY RESPONSE TEAM (ERT)', margin, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Administrative Offices Drill Assessment Report | Topic 1.5 Classify the Emergency', margin, 22);

    y = 42;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`GROUP ${selectedScenario.id}: ${selectedScenario.titleEn}`, margin, y, { maxWidth: 174 });
    y += 14;

    // Team Members block
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, 174, 18, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('REGISTERED TEAM MEMBERS (3 - 6):', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const validMembers = teamMembers.filter(Boolean);
    doc.text(validMembers.join('  |  ') || 'None recorded', margin + 4, y + 13);
    y += 24;

    // Score & Pass/Fail Status Banner
    const isPass = scoreBreakdown.isPassed;
    doc.setFillColor(isPass ? 220 : 254, isPass ? 252 : 226, isPass ? 231 : 226);
    doc.rect(margin, y, 174, 22, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPass ? 22 : 185, isPass ? 101 : 28, isPass ? 52 : 28);
    doc.text(`RESULT: ${isPass ? 'PASSED (PASS)' : 'FAILED (NEEDS RETRY)'}  -  GRADE: ${scoreBreakdown.totalScore} / 100`, margin + 6, y + 10);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const negTimeStr = isOvertime ? `-${formatMinSec(negativeSeconds)}` : '00:00 (Within 6 min)';
    doc.text(`Passing Target: 70/100 | Total Time: ${formatMinSec(totalElapsedSeconds)} | Negative Time: ${negTimeStr} | Retries: ${retriesCount}`, margin + 6, y + 17);
    y += 30;

    // Section 1: Classification
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. EMERGENCY CLASSIFICATION (30 Pts)', margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Decision: ${selectedLevel || 'None selected'}`, margin + 4, y);
    y += 5;
    doc.setTextColor(100);
    doc.text(`Official Key: ${selectedScenario.correctLevel} | Score Earned: ${scoreBreakdown.levelScore}/30`, margin + 4, y);
    y += 10;

    // Section 2: Notification Sequence
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('2. NOTIFICATION SEQUENCE (35 Pts)', margin, y);
    y += 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    if (sortedUserSequence.length > 0) {
      sortedUserSequence.forEach((item, idx) => {
        doc.text(`${idx + 1}. ${item.labelEn}`, margin + 4, y, { maxWidth: 168 });
        y += 5;
      });
    } else {
      doc.text('No notification sequence organized.', margin + 4, y);
      y += 5;
    }
    doc.setTextColor(100);
    doc.text(`Sequence Score Earned: ${scoreBreakdown.sequenceScore}/35`, margin + 4, y);
    y += 10;

    // Section 3: Tactical Actions
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('3. IMMEDIATE TACTICAL ACTIONS (35 Pts)', margin, y);
    y += 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');

    selectedScenario.tacticalOptions.forEach(opt => {
      const isChecked = selectedTacticalIds.includes(opt.id);
      const isMarkGood = (opt.isCorrect && isChecked) || (!opt.isCorrect && !isChecked);
      const prefix = isChecked ? '[X]' : '[ ]';
      const indicator = isMarkGood ? '(Correct)' : '(Error)';
      doc.setTextColor(isMarkGood ? 40 : 180, isMarkGood ? 120 : 30, isMarkGood ? 40 : 30);
      doc.text(`${prefix} ${opt.textEn} ${indicator}`, margin + 4, y, { maxWidth: 168 });
      y += 5;
    });

    doc.setTextColor(100);
    doc.text(`Tactical Actions Score Earned: ${scoreBreakdown.tacticalScore}/35`, margin + 4, y);
    y += 12;

    // Penalties breakdown
    if (scoreBreakdown.penalty > 0) {
      doc.setTextColor(185, 28, 28);
      doc.setFontSize(8.5);
      doc.text(`Penalties Applied: -${scoreBreakdown.penalty} Pts (Overtime: -${scoreBreakdown.timePenalty} Pts, Retries: -${scoreBreakdown.retryPenalty} Pts)`, margin + 4, y);
      y += 8;
    }

    // Debrief & Facilitator Note
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 192, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text(`Facilitator Rationale: ${selectedScenario.levelRationaleEn}`, margin, y, { maxWidth: 174 });
    y += 8;
    doc.text(`Report generated offline at ${new Date().toLocaleString()} by KSIA ERT Technical App.`, margin, y);

    doc.save(`KSIA_ERT_Group_${selectedScenario.id}_Office_Report.pdf`);
  }, [selectedScenario, teamMembers, scoreBreakdown, selectedLevel, sortedUserSequence, selectedTacticalIds, negativeSeconds, isOvertime, totalElapsedSeconds, retriesCount]);

  // Share via WhatsApp
  const shareWhatsApp = () => {
    if (!selectedScenario) return;
    const validMembers = teamMembers.filter(Boolean).join(', ');
    const negTimeStr = isOvertime ? `-${formatMinSec(negativeSeconds)}` : '00:00';
    const text = `*KSIA ERT Readiness Drill Report*%0A` +
      `*Group:* ${selectedScenario.id} (${selectedScenario.titleEn})%0A` +
      `*Team Members:* ${validMembers}%0A` +
      `*Grade:* ${scoreBreakdown.totalScore}/100 [${scoreBreakdown.isPassed ? 'PASSED / اجتياز' : 'FAILED / لم يجتز'}]%0A` +
      `*Total Time:* ${formatMinSec(totalElapsedSeconds)} (Negative Time: ${negTimeStr})%0A` +
      `*Retries:* ${retriesCount}%0A` +
      `*Classification:* ${selectedLevel}%0A` +
      `*Standard Passing Score:* 70`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Share via Email
  const shareEmail = () => {
    if (!selectedScenario) return;
    const validMembers = teamMembers.filter(Boolean).join(', ');
    const negTimeStr = isOvertime ? `-${formatMinSec(negativeSeconds)}` : '00:00';
    const subject = encodeURIComponent(`KSIA ERT Drill - Group ${selectedScenario.id} Report: ${scoreBreakdown.totalScore}/100`);
    const body = encodeURIComponent(
      `KSIA Emergency Response Team Readiness Drill\n` +
      `-----------------------------------------\n` +
      `Group Number: Group ${selectedScenario.id}\n` +
      `Scenario: ${selectedScenario.titleEn}\n` +
      `Team Members: ${validMembers}\n\n` +
      `Final Grade: ${scoreBreakdown.totalScore} / 100\n` +
      `Result: ${scoreBreakdown.isPassed ? 'PASSED (>= 70)' : 'FAILED (< 70)'}\n` +
      `Total Elapsed Time: ${formatMinSec(totalElapsedSeconds)}\n` +
      `Negative Time (Overtime): ${negTimeStr}\n` +
      `Retries Count: ${retriesCount}\n` +
      `Classification: ${selectedLevel}\n\n` +
      `Score Breakdown:\n` +
      `- Classification: ${scoreBreakdown.levelScore} / 30\n` +
      `- Notification Sequence: ${scoreBreakdown.sequenceScore} / 35\n` +
      `- Tactical Actions: ${scoreBreakdown.tacticalScore} / 35\n` +
      `- Penalty Deductions: -${scoreBreakdown.penalty}\n`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const remainingSessionSeconds = Math.max(0, MAX_SESSION_TIME - totalElapsedSeconds);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16 antialiased selection:bg-amber-200">
      {/* Top Professional Header */}
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-xl shadow-md text-slate-950">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">KSIA ERT DRILL</h1>
                {selectedScenario && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                    Group {selectedScenario.id} | المجموعة {selectedScenario.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Airport Administrative Offices Emergency Readiness | طوارئ المكاتب الإدارية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton />

            {/* Timers display during active drill */}
            {isDrillActive && (
              <div className="flex items-center gap-2">
                {/* 15-Minute Session Limit */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-300" title="Max 15 min session limit">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono font-semibold">{formatMinSec(remainingSessionSeconds)}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">Left (15m Max)</span>
                </div>

                {/* Overtime / Negative Time Indicator */}
                {isOvertime ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 border border-red-500 text-white text-xs font-mono font-bold animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>-{formatMinSec(negativeSeconds)}</span>
                    <span className="text-[10px] uppercase font-sans">Overtime (سالب)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-mono font-bold">
                    <Timer className="w-3.5 h-3.5" />
                    <span>{formatMinSec(phaseTimeLeft)}</span>
                    <span className="text-[10px] uppercase font-sans text-slate-400">Phase</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: GROUP SELECTION */}
          {stage === 'CHOICE' && (
            <motion.div 
              key="choice"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200/80 text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/60 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  Airport Administrative Offices Emergency Scenarios | مكاتب المطار الإدارية
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Topic 1.5: Classify the Emergency (Case-Card Drill)
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">
                  Select your assigned Group button below. You will register your team members (3 to 6 members), read the office scenario, and qualify the emergency under strict time limits.
                </p>
                <div className="text-xs text-slate-500 bg-slate-50 py-2 px-4 rounded-xl inline-block border border-slate-200">
                  <span className="font-bold text-slate-700">Rules:</span> 3 min reading + 3 min classification (6 min standard). Max retry ceiling is 15 minutes. Excess time converts to negative time and affects grading. Passing score: 70/100.
                </div>
              </div>

              {/* Group Buttons 1 to 10 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectGroup(s)}
                    className="p-4 md:p-5 rounded-2xl bg-white border-2 border-slate-200/80 hover:border-amber-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left flex flex-col justify-between group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center font-black text-lg transition-colors shadow-sm">
                        {s.id}
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-amber-600 transition-colors">
                        Admin Office
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-amber-700 transition-colors line-clamp-2">
                        Group {s.id}
                      </h4>
                      <p className="text-xs text-slate-500 font-arabic mt-1 line-clamp-1">
                        المجموعة {s.id}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: TEAM REGISTRATION (3 to 6 members) */}
          {stage === 'REGISTRATION' && selectedScenario && (
            <motion.div 
              key="registration"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                      {selectedScenario.id}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        Group {selectedScenario.id} Registration
                      </h3>
                      <p className="text-xs text-slate-500 font-arabic">
                        تسجيل أعضاء فريق المجموعة {selectedScenario.id}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAppStage('CHOICE')}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold underline"
                  >
                    Change Group | تغيير المجموعة
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-700" />
                    Requirement: Enter 3 to 6 team member names.
                  </p>
                  <p className="font-arabic text-amber-800">
                    شَرط البدء: إدخال أسماء أعضاء الفريق (3 أعضاء على الأقل وحتى 6 كحد أقصى).
                  </p>
                </div>

                {/* Team member input fields */}
                <div className="space-y-3">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-7 text-xs font-black text-slate-400 text-center">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => handleMemberChange(idx, e.target.value)}
                        placeholder={`Member ${idx + 1} Full Name ${idx < 3 ? '(Required / إلزامي)' : '(Optional / اختياري)'}`}
                        className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                          idx < 3 && !member.trim() && regError ? 'border-red-400 ring-red-200 bg-red-50/30' : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200 bg-slate-50/50'
                        }`}
                      />
                      {teamMembers.length > 3 && idx >= 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberSlot(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 text-xs"
                          title="Remove slot"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {teamMembers.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddMemberSlot}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100/60 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    + Add Another Member Slot (Up to 6) | إضافة عضو آخر
                  </button>
                )}

                {regError && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {regError}
                  </p>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    Timer starts immediately on start | يبدأ الوقت فور الضغط
                  </span>
                  <button
                    onClick={handleStartDrill}
                    className="flex items-center gap-2 bg-slate-900 text-amber-400 hover:bg-slate-800 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <span>Start Emergency Drill</span>
                    <span className="text-xs font-arabic text-white">| ابدأ التمرين</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PHASE 1 - SCENARIO READING & ANALYSIS (3 Minutes) */}
          {stage === 'SCENARIO' && selectedScenario && (
            <motion.div 
              key="scenario"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
                {/* Header banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      Phase 1: Scenario Reading (3 min) | المرحلة 1: القراءة
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Group {selectedScenario.id}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                    Phase Time: {formatMinSec(phaseTimeLeft)}
                  </div>
                </div>

                {/* Scenario Title */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                    {selectedScenario.titleEn}
                  </h3>
                  <p className="text-lg font-bold text-amber-800 font-arabic mt-1" dir="rtl">
                    {selectedScenario.titleAr}
                  </p>
                </div>

                {/* Scenario Details Cards in 2 columns */}
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Context & Location */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-black tracking-wider text-slate-500 uppercase">
                      <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-amber-600" /> Location & Context</span>
                      <span className="font-arabic font-bold text-slate-400">الموقع والسياق</span>
                    </div>
                    <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                      {selectedScenario.contextEn}
                    </p>
                    <p className="text-xs text-slate-600 font-arabic leading-relaxed" dir="rtl">
                      {selectedScenario.contextAr}
                    </p>
                    <div className="pt-2 text-xs text-slate-500 border-t border-slate-200/60">
                      <span className="font-bold text-slate-700">Room:</span> {selectedScenario.locationEn}
                      <div className="font-arabic text-slate-600" dir="rtl">{selectedScenario.locationAr}</div>
                    </div>
                  </div>

                  {/* Threat Profile */}
                  <div className="bg-red-50/60 p-5 rounded-2xl border border-red-200/70 space-y-3">
                    <div className="flex items-center justify-between text-xs font-black tracking-wider text-red-700 uppercase">
                      <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-600" /> Threat & Telemetry</span>
                      <span className="font-arabic font-bold text-red-500">التهديد والمؤشرات</span>
                    </div>
                    <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                      {selectedScenario.threatEn}
                    </p>
                    <p className="text-xs text-red-900 font-arabic leading-relaxed" dir="rtl">
                      {selectedScenario.threatAr}
                    </p>
                  </div>

                  {/* Occupancy & Casualties */}
                  <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200/70 space-y-3">
                    <div className="flex items-center justify-between text-xs font-black tracking-wider text-blue-700 uppercase">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-600" /> Occupancy & Casualties</span>
                      <span className="font-arabic font-bold text-blue-500">المتواجدون والإصابات</span>
                    </div>
                    <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                      {selectedScenario.occupancyEn}
                    </p>
                    <p className="text-xs text-blue-900 font-arabic leading-relaxed" dir="rtl">
                      {selectedScenario.occupancyAr}
                    </p>
                  </div>

                  {/* Constraints */}
                  <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/70 space-y-3">
                    <div className="flex items-center justify-between text-xs font-black tracking-wider text-amber-800 uppercase">
                      <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-amber-600" /> Physical Constraints</span>
                      <span className="font-arabic font-bold text-amber-600">القيود والتحديات</span>
                    </div>
                    <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                      {selectedScenario.constraintsEn}
                    </p>
                    <p className="text-xs text-amber-950 font-arabic leading-relaxed" dir="rtl">
                      {selectedScenario.constraintsAr}
                    </p>
                  </div>
                </div>

                {/* Team members on record */}
                <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-slate-800">Team:</span>
                  {teamMembers.filter(Boolean).map((m, i) => (
                    <span key={i} className="bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 font-medium">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleProceedToClassification}
                    className="flex items-center gap-2 bg-slate-900 text-amber-400 hover:bg-slate-800 px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all group"
                  >
                    <span>Proceed to Deliverables</span>
                    <span className="text-xs font-arabic text-white">| الانتقال للتصنيف والإجراءات</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PHASE 2 - CLASSIFICATION & DELIVERABLES (3 Minutes Standard, Overtime allowed up to 15m) */}
          {stage === 'CLASSIFICATION' && selectedScenario && (
            <motion.div 
              key="classification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-8">
                {/* Header status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      Phase 2: Deliverables & Qualification | نموذج التصنيف والتقييم
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2">
                      Group {selectedScenario.id}: {selectedScenario.titleEn}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Drill Time: <span className="font-mono font-bold text-slate-800">{formatMinSec(totalElapsedSeconds)}</span></div>
                    {isOvertime && (
                      <div className="text-xs font-bold text-red-600">
                        Negative Time (Overtime): -{formatMinSec(negativeSeconds)}
                      </div>
                    )}
                  </div>
                </div>

                {/* DELIVERABLE 1: Classification Level (30 Pts) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      1. Declare Classification Level (30 Pts) | تحديد مستوى الطوارئ
                    </label>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Required / إلزامي
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        level: 'Level 1',
                        labelEn: 'Level 1 (Localized Incident)',
                        labelAr: 'المستوى 1 (حادث موضعي محدود)',
                        descEn: 'Contained in room by office ERT',
                        descAr: 'يتم احتواؤه في الغرفة عبر طاقم المبنى'
                      },
                      {
                        level: 'Level 2',
                        labelEn: 'Level 2 (Facility Emergency)',
                        labelAr: 'المستوى 2 (طوارئ المنشأة)',
                        descEn: 'Threatens floor/wing; needs Civil Defense',
                        descAr: 'يهدد الجناح/الطابق ويتطلب الدفاع المدني'
                      },
                      {
                        level: 'Level 3',
                        labelEn: 'Level 3 (Major Disaster)',
                        labelAr: 'المستوى 3 (كارثة كبرى)',
                        descEn: 'Multi-agency full scale aerodrome response',
                        descAr: 'استجابة شاملة على مستوى المطار بالكامل'
                      }
                    ].map((item) => (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setSelectedLevel(item.level)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                          selectedLevel === item.level 
                            ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300' 
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-black text-sm ${selectedLevel === item.level ? 'text-amber-900' : 'text-slate-800'}`}>
                            {item.labelEn}
                          </span>
                          {selectedLevel === item.level && (
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <p className="text-xs font-arabic text-slate-600 mb-1" dir="rtl">
                          {item.labelAr}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.descEn}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DELIVERABLE 2: Notification Sequence (35 Pts) */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      2. Notification Sequence (35 Pts) | تسلسل البلاغات والإخطار
                    </label>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Use dropdowns to assign 1, 2, 3... (Numbers are strictly unique)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Select the order in which notifications must be transmitted. Selecting an existing number will automatically reassign it.
                  </p>

                  <div className="space-y-2">
                    {NOTIFICATION_ACTIONS.map((action) => {
                      const pos = notificationSequence[action.id] || 0;
                      return (
                        <div 
                          key={action.id}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            pos > 0 ? 'bg-amber-50/60 border-amber-300 shadow-xs' : 'bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <select
                              value={pos}
                              onChange={(e) => handleSequenceChange(action.id, parseInt(e.target.value))}
                              className={`appearance-none h-10 w-14 text-center rounded-xl border-2 font-black text-base transition-all cursor-pointer ${
                                pos > 0 
                                  ? 'bg-slate-900 border-slate-900 text-amber-400' 
                                  : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'
                              }`}
                            >
                              <option value={0}>--</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs md:text-sm font-bold ${pos > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                              {action.labelEn}
                            </p>
                            <p className="text-[11px] font-arabic text-slate-500 mt-0.5" dir="rtl">
                              {action.labelAr}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DELIVERABLE 3: Immediate Tactical Actions Checkboxes (35 Pts) */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      3. Immediate Tactical Actions (35 Pts) | الإجراءات التكتيكية الفورية
                    </label>
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Select all correct life-safety actions (Avoid hazardous pitfalls)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Mark the actions your team will execute immediately. Warning: Selecting dangerous options causes penalty deductions.
                  </p>

                  <div className="space-y-2.5">
                    {selectedScenario.tacticalOptions.map((opt) => {
                      const isChecked = selectedTacticalIds.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleToggleTactical(opt.id)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked 
                              ? 'bg-blue-50/70 border-blue-500 shadow-sm' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className={`text-xs md:text-sm font-bold ${isChecked ? 'text-blue-950' : 'text-slate-800'}`}>
                              {opt.textEn}
                            </p>
                            <p className="text-xs font-arabic text-slate-600 mt-1" dir="rtl">
                              {opt.textAr}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
                  <button
                    onClick={() => setAppStage('SCENARIO')}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Review Scenario | مراجعة السيناريو
                  </button>

                  <button
                    onClick={handleSubmitAssessment}
                    disabled={!selectedLevel || sortedUserSequence.length === 0 || selectedTacticalIds.length === 0}
                    className="flex items-center gap-2 bg-slate-900 text-amber-400 hover:bg-slate-800 px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Submit & Qualify Drill</span>
                    <span className="text-xs font-arabic text-white">| تسليم وتقييم التمرين</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FINAL REPORT & QUALIFICATION GRADE (0-100, PASS >= 70) */}
          {stage === 'REPORT' && selectedScenario && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-200/80 space-y-8 overflow-hidden">
                {/* Score & Banner */}
                <div className="text-center space-y-3">
                  <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${
                    scoreBreakdown.isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {scoreBreakdown.isPassed ? (
                      <Award className="w-10 h-10" />
                    ) : (
                      <XCircle className="w-10 h-10" />
                    )}
                  </div>
                  
                  <div>
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                      scoreBreakdown.isPassed 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {scoreBreakdown.isPassed ? 'PASSED / اجتياز ناجح' : 'FAILED / لم يجتز (أقل من 70)'}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                      Grade: {scoreBreakdown.totalScore} / 100
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">
                      KSIA ERT Case-Card Qualification Score (Passing threshold is 70)
                    </p>
                  </div>
                </div>

                {/* Group & Team Details */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Assigned Group & Location
                    </span>
                    <p className="font-extrabold text-slate-900 text-sm">
                      Group {selectedScenario.id}: {selectedScenario.titleEn}
                    </p>
                    <p className="text-slate-600 font-arabic mt-0.5" dir="rtl">
                      {selectedScenario.titleAr}
                    </p>
                  </div>

                  <div>
                    <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Registered Team Members ({teamMembers.filter(Boolean).length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {teamMembers.filter(Boolean).map((m, i) => (
                        <span key={i} className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg text-slate-700 font-semibold">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time & Penalties Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Elapsed</span>
                    <span className="text-base font-black text-slate-800 font-mono">{formatMinSec(totalElapsedSeconds)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Standard Limit</span>
                    <span className="text-base font-black text-slate-800 font-mono">06:00</span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${isOvertime ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className="text-[10px] font-bold uppercase block">Negative Time</span>
                    <span className="text-base font-black font-mono">
                      {isOvertime ? `-${formatMinSec(negativeSeconds)}` : '00:00'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Retries Taken</span>
                    <span className="text-base font-black text-slate-800 font-mono">{retriesCount}</span>
                  </div>
                </div>

                {/* Score Breakdown Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Part 1 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">1. Classification</span>
                      <span className="text-xs font-black text-slate-900">{scoreBreakdown.levelScore}/30</span>
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">Chosen: {selectedLevel || 'None'}</p>
                      <p className="text-slate-500 mt-1">Official: <span className="font-bold text-emerald-700">{selectedScenario.correctLevel}</span></p>
                    </div>
                  </div>

                  {/* Part 2 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">2. Sequence</span>
                      <span className="text-xs font-black text-slate-900">{scoreBreakdown.sequenceScore}/35</span>
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-3">
                      {sortedUserSequence.map((s, i) => `${i+1}. ${s.labelEn.split(':')[0]}`).join(' → ')}
                    </div>
                  </div>

                  {/* Part 3 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">3. Tactical</span>
                      <span className="text-xs font-black text-slate-900">{scoreBreakdown.tacticalScore}/35</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {selectedTacticalIds.length} actions selected
                      {scoreBreakdown.penalty > 0 && (
                        <p className="text-red-600 font-bold mt-1">Penalties: -{scoreBreakdown.penalty} Pts</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Facilitator Debrief Key */}
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    Facilitator Assessment Rationale | مرجع المدرب للتقييم
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {selectedScenario.levelRationaleEn}
                  </p>
                  <p className="text-xs text-amber-950 font-arabic leading-relaxed" dir="rtl">
                    {selectedScenario.levelRationaleAr}
                  </p>
                </div>

                {/* Action Buttons: Export PDF, WhatsApp, Email, Retry */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                  <button
                    onClick={exportPDF}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-3.5 rounded-xl font-bold shadow-md transition-all text-xs md:text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                  </button>

                  <button
                    onClick={shareWhatsApp}
                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-3.5 rounded-xl font-bold shadow-md transition-all text-xs md:text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </button>

                  <button
                    onClick={shareEmail}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-3.5 rounded-xl font-bold shadow-md transition-all text-xs md:text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>

                  {/* Retry Option (Allowed if within 15 minutes limit) */}
                  {totalElapsedSeconds < MAX_SESSION_TIME && (
                    <button
                      onClick={handleRetryAssessment}
                      className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3.5 rounded-xl font-bold shadow-md transition-all text-xs md:text-sm"
                      title="Adjust answers and recalculate score (overtime continues to count)"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry Assessment
                    </button>
                  )}

                  <button
                    onClick={handleResetToHome}
                    className="p-3.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Start New Group Drill"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <OfflineIndicator />
    </div>
  );
}
