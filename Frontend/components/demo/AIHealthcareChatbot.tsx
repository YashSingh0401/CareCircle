"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Mic,
  X,
  Bot,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  type: "normal" | "medical" | "emergency";
}

const suggestionChips = [
  { label: "Fever", query: "mujhe fever hai" },
  { label: "Emergency", query: "emergency contact" },
  { label: "Book Appointment", query: "appointment scheduling" },
  { label: "Find Doctor", query: "find active doctor" },
  { label: "Queue Status", query: "queue waiting time" },
  { label: "Lab Reports", query: "show lab reports" },
  { label: "Hospital Navigation", query: "where is lift and stairs" }
];

export function AIHealthcareChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      text: "Hello! I am your CareCircle AI Assistant. I can understand clinical queries in English and Hinglish (e.g. 'mujhe sardi hai' or 'emergency contact'). How can I assist you with floor navigation, lab reports, doctor schedules, or queue management today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "normal"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function getFallbackResponse(message: string): { reply: string; type: "normal" | "medical" | "emergency" } {
    const query = message.toLowerCase().trim();

    // Emergency intents
    if (
      query.includes("emergency") ||
      query.includes("sos") ||
      query.includes("accident") ||
      query.includes("pain") ||
      query.includes("critical") ||
      query.includes("bachao") ||
      query.includes("help")
    ) {
      return {
        reply: "⚠️ CRITICAL ALERT: Emergency protocol initiated. If you are experiencing a life-threatening symptom (such as severe chest pain, extreme breathing difficulties, or acute trauma), please trigger the dashboard's SOS system immediately or call our direct helpline at +91-99999-11111.",
        type: "emergency",
      };
    }

    // Medical/Fever intents
    if (
      query.includes("fever") ||
      query.includes("temp") ||
      query.includes("bukhar") ||
      query.includes("sardi") ||
      query.includes("cough") ||
      query.includes("sick") ||
      query.includes("bimari")
    ) {
      return {
        reply: "🩺 MEDICAL GUIDELINE: You reported fever/flu symptoms. Standard recommendation is to rest, monitor your core body temperature, and stay hydrated (aim for 3.0L fluids daily). If your temperature exceeds 101.5°F or is accompanied by severe chills, we suggest consulting Dr. Sarah in General Medicine.",
        type: "medical",
      };
    }

    // Lab reports
    if (
      query.includes("report") ||
      query.includes("lab") ||
      query.includes("hemoglobin") ||
      query.includes("blood") ||
      query.includes("test")
    ) {
      return {
        reply: "📊 CLINICAL INSIGHT: Your latest lab records are fully processed. Hemoglobin is stable at 13.8 g/dL (slightly below the 14.0 optimal baseline), indicating minor iron depletion. Your hydration levels are stable. You can review full breakdowns in the Vitals Panel.",
        type: "medical",
      };
    }

    // Navigation / Floor layout
    if (
      query.includes("navigate") ||
      query.includes("floor") ||
      query.includes("map") ||
      query.includes("lift") ||
      query.includes("stairs") ||
      query.includes("opd") ||
      query.includes("where")
    ) {
      return {
        reply: "🗺️ HOSPITAL DIRECTORY: CareCircle operates across 3 floors. Floor 1 (Ground) houses Reception, Pharmacy & Emergency. Floor 2 contains the Outpatient Department (OPD) and Diagnostic Labs. Floor 3 is restricted for Wards & ICU. You can take LIFT Core A (Central Corridor) or STAIRS B (Eastern Wing).",
        type: "medical",
      };
    }

    // Appointments
    if (
      query.includes("book") ||
      query.includes("appointment") ||
      query.includes("doctor") ||
      query.includes("clinic")
    ) {
      return {
        reply: "📅 SCHEDULING SYSTEM: To book a clinical appointment, you can navigate to the 'Find Doctor' panel on the main page. Dr. Vikram (Pediatrics) and Dr. Aisha (Cardiothoracic) are online and accepting reservations today.",
        type: "normal",
      };
    }

    // Queue status
    if (query.includes("queue") || query.includes("wait") || query.includes("token")) {
      return {
        reply: "⏱️ QUEUE TELEMETRY: Average outpatient lobby wait time is currently 11 minutes. Your active token is monitored and synchronized automatically with front desk check-in sensors.",
        type: "normal",
      };
    }

    // Standard greetings
    return {
      reply: "I am here to help you! Feel free to query about hospital floor guides (lifts/stairs), outpatient desks (OPD), doctor availability, queue times, or medical vitals.",
      type: "normal",
    };
  }

  async function handleSendMessage(textToSend: string) {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "normal"
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // Connect to Python chatbot backend
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: data.reply,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: data.type || "normal"
          }
        ]);
      } else {
        throw new Error("API Connection Failed");
      }
    } catch (err) {
      // Fallback NLP intent classification
      setTimeout(() => {
        const fallback = getFallbackResponse(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            text: fallback.reply,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: fallback.type
          }
        ]);
        setIsTyping(false);
      }, 700);
      return;
    }

    setIsTyping(false);
  }

  // Voice recognition simulation
  function handleVoiceInput() {
    setIsListening(true);
    toast.info("Microphone Active", {
      description: "Listening for English or Hinglish symptoms... (Simulating voice recognition)",
    });

    setTimeout(() => {
      setIsListening(false);
      // Mock voice recognized input
      const simulatedSymptoms = ["Fever assessment", "Book General Medicine appointment", "Emergency direct route", "Where are stairs and elevator?"];
      const chosenSymptom = simulatedSymptoms[Math.floor(Math.random() * simulatedSymptoms.length)];
      setInputText(chosenSymptom);
      toast.success("Voice recognition matched!", {
        description: `Transcribed text: "${chosenSymptom}"`,
      });
    }, 2800);
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[100] sm:bottom-8 sm:right-8">
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/30 bg-gradient-to-tr from-teal-600 via-cyan-600 to-emerald-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.55)] cursor-pointer"
        >
          {/* Pulsing glow ring */}
          <span className="absolute inset-0 rounded-full border-2 border-cyan-300/40 animate-ping opacity-60" />
          {isOpen ? (
            <X className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          ) : (
            <MessageSquare className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          )}
        </motion.button>
      </div>

      {/* Slide-out Interactive Chat Panel overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-24 right-6 z-[120] w-[calc(100vw-3rem)] sm:w-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#06111f]/90 shadow-[0_20px_50px_rgba(0,0,0,0.6)] shadow-cyan-500/5 backdrop-blur-2xl flex flex-col h-[480px] text-white"
          >
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-white/5 bg-[#0b1b30]/60 p-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                  <Bot className="h-5 w-5 animate-pulse" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </span>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1">
                    CareCircle AI Assistant
                    <Sparkles size={11} className="text-cyan-300 animate-pulse" />
                  </h3>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                    Online Hinglish Copilot
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/50 hover:text-white transition duration-200"
                aria-label="Close chatbot panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Message Log Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-transparent to-[#040d18]/40">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"} w-full`}
                  >
                    <div className="max-w-[85%]">
                      {/* Emergency bubble */}
                      {msg.type === "emergency" ? (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 shadow-[0_5px_15px_rgba(239,68,68,0.05)] shadow-rose-500/5">
                          <div className="flex items-center gap-1.5 text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <AlertTriangle size={13} className="text-rose-400 animate-pulse" />
                            Emergency Alert Card
                          </div>
                          <p className="text-xs leading-5 text-rose-100 font-medium">
                            {msg.text}
                          </p>
                        </div>
                      ) : msg.type === "medical" ? (
                        /* Medical card bubble */
                        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 shadow-[0_5px_15px_rgba(6,182,212,0.05)] shadow-cyan-500/5">
                          <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                            <Stethoscope size={13} className="text-cyan-400" />
                            Clinical Guidance
                          </div>
                          <p className="text-xs leading-5 text-cyan-100 font-medium">
                            {msg.text}
                          </p>
                        </div>
                      ) : (
                        /* Standard chat bubble */
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                            isBot
                              ? "bg-white/5 border border-white/5 text-white/85 rounded-tl-sm"
                              : "bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 rounded-tr-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <span className="text-[9px] text-white/35 font-bold uppercase mt-1 tracking-wider block text-right px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bot typing state load */}
              {isTyping && (
                <div className="flex items-center gap-2.5 w-full items-start">
                  <div className="rounded-2xl bg-white/5 border border-white/5 px-3 py-2 flex items-center justify-center gap-1.5 text-white/45">
                    <Loader2 size={13} className="animate-spin text-cyan-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Analyzing symptoms...</span>
                  </div>
                </div>
              )}

              {/* Active scroll checkpoint */}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-4 py-2 border-t border-white/5 bg-[#040c17]/60 overflow-x-auto scrollbar-none">
              <div className="flex gap-1.5 w-max">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSendMessage(chip.query)}
                    className="rounded-full border border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200 px-3 py-1 text-[10px] font-semibold text-white/70 transition duration-200 cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area console */}
            <div className="p-3 bg-[#071324]/80 border-t border-white/5 flex gap-2 items-center relative">
              
              {/* Simulated Voice pulse overlay */}
              {isListening && (
                <div className="absolute inset-0 bg-[#05111f] z-10 p-2 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                    </span>
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest animate-pulse">
                      Listening symptoms...
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsListening(false)}
                    className="rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-1 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <input
                type="text"
                placeholder="Ask about bukhar, emergency, lift, appointments..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                className="flex-1 rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
              
              {/* Voice button trigger */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className="rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-400/10 p-2 text-white/70 hover:text-cyan-300 transition duration-200 cursor-pointer"
                title="Voice Input"
              >
                <Mic size={14} />
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage(inputText)}
                className="rounded-xl border border-cyan-500/25 bg-gradient-to-tr from-cyan-600 to-teal-500 p-2 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:scale-105 active:scale-95 transition duration-200 cursor-pointer"
                title="Send Message"
              >
                <Send size={14} />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
