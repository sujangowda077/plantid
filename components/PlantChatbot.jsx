'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { generateChatResponse } from '@/lib/plantIntelligence';

const nowTime = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

const severityClass = {
  mild: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  severe: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export default function PlantChatbot({ plantName = 'plants in general', onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPrevention, setExpandedPrevention] = useState({});

  const scrollerRef = useRef(null);
  const initializedRef = useRef(false);
  const previousPlantRef = useRef(plantName);

  const basePlantName = plantName || 'plants in general';

  const pushMessage = (message) => {
    setMessages((prev) => {
      const merged = [...prev, message];
      if (merged.length > 50) return merged.slice(merged.length - 50);
      return merged;
    });
  };

  const createBotMessage = (text, intent = 'greeting', diseaseData = null, suggestions = []) => ({
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: 'bot',
    text,
    intent,
    timestamp: nowTime(),
    diseaseData,
    suggestions
  });

  const createUserMessage = (text) => ({
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: 'user',
    text,
    timestamp: nowTime(),
    diseaseData: null,
    suggestions: []
  });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    pushMessage(
      createBotMessage(
        `Hey! 👋 I am your Plant Assistant. I see you are looking at ${basePlantName}! 🌿\nAsk me anything about caring for it, diseases, watering, and more!`,
        'greeting',
        null,
        ['How do I care for it?', 'Any diseases?', 'Watering tips']
      )
    );
  }, [basePlantName]);

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (previousPlantRef.current === basePlantName) return;
    previousPlantRef.current = basePlantName;

    pushMessage(
      createBotMessage(
        `Plant context updated 🌿 I am now focused on ${basePlantName}. Ask me for care, diagnosis, watering, sunlight, or quick tips!`,
        'greeting',
        null,
        ['How do I care for it?', 'Any diseases?', 'Watering tips']
      )
    );
  }, [basePlantName]);

  useEffect(() => {
    const onOpenRequest = (event) => {
      const detail = event.detail || {};
      if (detail.plantName && detail.plantName !== basePlantName) {
        pushMessage(
          createBotMessage(
            `I got a diagnosis request related to ${detail.plantName} 🔬 You can ask me to compare symptoms too.`,
            'greeting',
            null,
            ['Diagnose this symptom', 'How to prevent?', 'Care tips 🌿']
          )
        );
      }

      setIsOpen(true);
      if (detail.prefill) setInputText(detail.prefill);
    };

    window.addEventListener('open-plant-chatbot', onOpenRequest);
    return () => window.removeEventListener('open-plant-chatbot', onOpenRequest);
  }, [basePlantName]);

  const conversationHistory = useMemo(
    () => messages.slice(-3).map((msg) => ({ role: msg.role, text: msg.text, intent: msg.intent })),
    [messages]
  );

  const submitMessage = (rawText) => {
    const text = String(rawText || '').trim();
    if (!text || isTyping) return;

    pushMessage(createUserMessage(text));
    setInputText('');
    setIsTyping(true);

    window.setTimeout(() => {
      const response = generateChatResponse(basePlantName, text, conversationHistory);
      pushMessage(
        createBotMessage(response.message, response.intent, response.diseaseData, response.suggestions || [])
      );
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage(inputText);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    if (typeof onClose === 'function') onClose();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div
          className="card mb-3 flex flex-col overflow-hidden"
          style={{
            width: '380px',
            height: '520px',
            background: 'var(--bg-card)',
            borderColor: 'var(--bd-light)',
            animation: 'bounceIn 0.24s ease both, fadeIn 0.24s ease both',
            transformOrigin: 'bottom right'
          }}
        >
          <div
            className="forest-gradient px-4 py-3 border-b"
            style={{ borderColor: 'var(--bd-light)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm">Plant Assistant</p>
                <span className="badge badge-emerald mt-1 max-w-[220px] truncate">{basePlantName}</span>
              </div>
              <button
                onClick={closeChat}
                className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-3 bg-surface space-y-3">
            {messages.map((message) => {
              const isBot = message.role === 'bot';
              return (
                <div key={message.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[88%] space-y-1">
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        isBot ? 'border border-theme bg-card text-primary' : 'text-white'
                      }`}
                      style={
                        isBot
                          ? {}
                          : {
                              background: 'linear-gradient(135deg, #0d5c3a 0%, #147a50 100%)'
                            }
                      }
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>

                    {isBot && message.diseaseData && (
                      <div className="card p-3 space-y-2 border border-theme">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-primary">Disease Detected</p>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                              severityClass[message.diseaseData.severity] || severityClass.mild
                            }`}
                          >
                            {message.diseaseData.severity}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-secondary">{message.diseaseData.name}</p>
                        <p className="text-xs text-muted">{message.diseaseData.description}</p>

                        <div>
                          <p className="text-[11px] font-semibold text-primary mb-1">Likely Symptoms</p>
                          <div className="flex flex-wrap gap-1.5">
                            {message.diseaseData.symptoms.slice(0, 6).map((symptom) => (
                              <span key={symptom} className="chip text-[10px] px-2 py-0.5">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-primary mb-1">Treatment Steps</p>
                          <ol className="text-xs text-muted space-y-1 list-decimal pl-4">
                            {message.diseaseData.treatment.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="rounded-xl overflow-hidden border border-theme">
                          <img
                            src={message.diseaseData.imageUrl}
                            alt={message.diseaseData.name}
                            className="w-full h-[140px] object-cover"
                          />
                          <p className="text-[10px] px-2 py-1 bg-subtle text-muted">
                            Visual reference: {message.diseaseData.name}
                          </p>
                        </div>

                        <button
                          className="btn-secondary text-xs py-2"
                          onClick={() =>
                            setExpandedPrevention((prev) => ({
                              ...prev,
                              [message.id]: !prev[message.id]
                            }))
                          }
                        >
                          {expandedPrevention[message.id] ? 'Hide prevention tips' : 'Show prevention tips'}
                        </button>

                        {expandedPrevention[message.id] && (
                          <ul className="text-xs text-muted space-y-1 list-disc pl-4">
                            {message.diseaseData.prevention.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {isBot && !!message.suggestions?.length && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={`${message.id}-${suggestion}`}
                            className="chip text-[11px]"
                            onClick={() => setInputText(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className={`text-[10px] ${isBot ? 'text-muted text-left' : 'text-muted text-right'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 border border-theme bg-card text-primary flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted inline-block" style={{ animation: 'pulseGlow 1s infinite' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted inline-block" style={{ animation: 'pulseGlow 1s 0.2s infinite' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted inline-block" style={{ animation: 'pulseGlow 1s 0.4s infinite' }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-subtle" style={{ borderColor: 'var(--bd-light)' }}>
            <div className="flex items-center gap-2">
              <input
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field text-sm py-2.5"
                placeholder={`Ask about ${basePlantName}...`}
              />
              <button
                className="btn-primary px-4 py-2.5 w-auto"
                onClick={() => submitMessage(inputText)}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => (isOpen ? closeChat() : setIsOpen(true))}
        className="relative w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0d5c3a 0%, #1da066 100%)',
          boxShadow: 'var(--sh-emerald-lg)',
          animation: isOpen ? 'none' : 'floatA 4s ease-in-out infinite'
        }}
        aria-label={isOpen ? 'Close Plant Assistant' : 'Open Plant Assistant'}
      >
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(34, 197, 94, 0.35)', animation: 'pulseGlow 1.8s infinite' }}
          />
        )}
        <span className={`relative text-xl ${isOpen ? '' : 'float-leaf'}`}>{isOpen ? '✕' : '🌿'}</span>
      </button>
    </div>
  );
}
