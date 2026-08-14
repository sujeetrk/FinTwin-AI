"use client";

import {
  Bot,
  Send,
  Sparkles,
  X,
  Minus,
  RefreshCw,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  useEffect,
  useRef,
  useState,
} from "react";


// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";


// ============================================================
// MESSAGE TYPE
// ============================================================

type Message = {
  role: "user" | "assistant";
  content: string;
};


// ============================================================
// GET JWT TOKEN
// ============================================================

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token")
  );
}


// ============================================================
// FLOATING AI CHAT
// ============================================================

export default function FloatingAIChat() {

  // ----------------------------------------------------------
  // CHAT OPEN / CLOSE
  // ----------------------------------------------------------

  const [isOpen, setIsOpen] =
    useState(false);


  // ----------------------------------------------------------
  // MESSAGE
  // ----------------------------------------------------------

  const [message, setMessage] =
    useState("");


  // ----------------------------------------------------------
  // CHAT HISTORY
  // ----------------------------------------------------------

  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        content:
          "Hi! I'm your FinTwin AI assistant. I can help you understand your spending, savings, budgets and financial goals.",
      },
    ]);


  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  const [loading, setLoading] =
    useState(false);


  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  const [error, setError] =
    useState("");


  // ----------------------------------------------------------
  // INPUT REF
  // ----------------------------------------------------------

  const inputRef =
    useRef<HTMLInputElement>(null);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);


  // ==========================================================
  // AUTO SCROLL TO NEWEST RESPONSE
  // ==========================================================

  useEffect(() => {

    const timer = setTimeout(() => {

      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

    }, 100);


    return () => clearTimeout(timer);

  }, [messages]);


  // ==========================================================
  // FOCUS INPUT WHEN CHAT OPENS
  // ==========================================================

  useEffect(() => {

    if (isOpen) {

      setTimeout(() => {

        inputRef.current?.focus();

      }, 100);

    }

  }, [isOpen]);


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage = async (
    customMessage?: string
  ) => {

    const question =
      (
        customMessage ??
        message
      ).trim();


    // Don't send empty message

    if (!question) {
      return;
    }


    // --------------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------------

    const token =
      getToken();


    if (!token) {

      setError(
        "Please login to use FinTwin AI."
      );

      return;

    }


    // --------------------------------------------------------
    // ADD USER MESSAGE
    // --------------------------------------------------------

    setMessages(
      (previous) => [
        ...previous,
        {
          role: "user",
          content: question,
        },
      ]
    );


    // Clear input

    setMessage("");

    setError("");

    setLoading(true);


    // --------------------------------------------------------
    // CALL BACKEND
    // --------------------------------------------------------

    try {

      const response =
        await fetch(
          `${API_URL}/ai-twin/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                message: question,
              }),
          }
        );


      // ------------------------------------------------------
      // UNAUTHORIZED
      // ------------------------------------------------------

      if (response.status === 401) {

        throw new Error(
          "Your login session has expired. Please login again."
        );

      }


      // ------------------------------------------------------
      // OTHER ERRORS
      // ------------------------------------------------------

      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);


        throw new Error(
          errorData?.detail ||
          "Unable to get a response from FinTwin AI."
        );

      }


      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      const result =
        await response.json();


      const answer =
        result.answer ||
        "I couldn't generate a response right now.";


      // Add AI response

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content: answer,
          },
        ]
      );


    } catch (err) {

      console.error(
        "FinTwin AI Chat Error:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting FinTwin AI."
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !loading
    ) {

      e.preventDefault();

      sendMessage();

    }

  };


  // ==========================================================
  // QUICK QUESTIONS
  // ==========================================================

  const quickQuestions = [
    "How can I improve my savings?",
    "Am I spending too much?",
    "How is my financial health?",
  ];


  // ==========================================================
  // CLEAR CHAT
  // ==========================================================

  const clearChat = () => {

    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I'm your FinTwin AI assistant. I can help you understand your spending, savings, budgets and financial goals.",
      },
    ]);

    setError("");

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* =====================================================
          CHAT POPUP
      ===================================================== */}

      {isOpen && (

        <div
          className="
            fixed
            bottom-24
            right-5
            z-[9998]
            flex
            h-[min(600px,calc(100vh-110px))]
            w-[min(390px,calc(100vw-24px))]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-700
            bg-[#0f172a]
            shadow-[0_20px_70px_rgba(0,0,0,0.55)]
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-700
              bg-[#020617]
              px-4
              py-3
            "
          >

            {/* LEFT */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-400
                "
              >

                <Sparkles size={20} />

              </div>


              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <span
                    className="
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    FinTwin AI
                  </span>


                  {/* ONLINE INDICATOR */}

                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_8px_rgba(52,211,153,0.7)]
                    "
                  />

                </div>


                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  Your personal financial assistant
                </p>

              </div>

            </div>


            {/* RIGHT */}

            <div
              className="
                flex
                items-center
                gap-1
              "
            >

              {/* CLEAR CHAT */}

              <button
                type="button"
                onClick={clearChat}
                title="Clear chat"
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
              >

                <RefreshCw size={16} />

              </button>


              {/* MINIMIZE */}

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                title="Minimize"
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
              >

                <Minus size={18} />

              </button>


              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                title="Close"
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
              >

                <X size={18} />

              </button>

            </div>

          </div>


          {/* =================================================
              CHAT MESSAGES
          ================================================= */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-[#0f172a]
              p-4
            "
          >

            <div
              className="
                space-y-4
              "
            >

              {messages.map(
                (item, index) => (

                  <div
                    key={index}
                    className={
                      item.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >

                    {/* USER MESSAGE */}

                    {item.role === "user" ? (

                      <div
                        className="
                          max-w-[82%]
                          rounded-2xl
                          rounded-br-md
                          bg-emerald-500
                          px-4
                          py-3
                          text-sm
                          leading-6
                          text-slate-950
                        "
                      >

                        {item.content}

                      </div>

                    ) : (

                      /* AI MESSAGE */

                      <div
                        className="
                          flex
                          w-full
                          min-w-0
                          items-start
                          gap-2
                        "
                      >

                        <div
                          className="
                            mt-1
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-emerald-500/10
                            text-emerald-400
                          "
                        >

                          <Bot size={15} />

                        </div>


                        <div
                          className="
                            min-w-0
                            max-w-[calc(100%-36px)]
                            overflow-hidden
                            rounded-2xl
                            rounded-bl-md
                            border
                            border-slate-700
                            bg-slate-900
                            px-4
                            py-3
                            text-sm
                            leading-6
                            text-slate-200
                            break-words
                          "
                        >
                          <div
                            className="
                              prose
                              prose-invert
                              max-w-none
                              text-sm
                              leading-6
                              text-slate-200

                              [&_h1]:mb-3
                              [&_h1]:mt-1
                              [&_h1]:text-base
                              [&_h1]:font-bold
                              [&_h1]:text-white

                              [&_h2]:mb-3
                              [&_h2]:mt-4
                              [&_h2]:text-base
                              [&_h2]:font-bold
                              [&_h2]:text-emerald-400

                              [&_h3]:mb-2
                              [&_h3]:mt-4
                              [&_h3]:text-sm
                              [&_h3]:font-bold
                              [&_h3]:text-emerald-400

                              [&_strong]:font-bold
                              [&_strong]:text-white

                              [&_ul]:my-2
                              [&_ul]:list-disc
                              [&_ul]:pl-5

                              [&_ol]:my-2
                              [&_ol]:list-decimal
                              [&_ol]:pl-5

                              [&_li]:my-1

                              [&_p]:my-2

                              [&_hr]:my-4
                              [&_hr]:border-slate-700
                            "
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {item.content}
                            </ReactMarkdown>
                          </div>
                        </div>

                      </div>

                    )}

                  </div>

                )
              )}


              {/* THINKING */}

              {loading && (

                <div
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >

                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-emerald-500/10
                      text-emerald-400
                    "
                  >

                    <Bot size={15} />

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-2xl
                      rounded-bl-md
                      border
                      border-slate-700
                      bg-slate-900
                      px-4
                      py-3
                      text-sm
                      text-slate-400
                    "
                  >

                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />

                    FinTwin AI is thinking...

                  </div>

                </div>

              )}


              {/* ERROR */}

              {error && (

                <div
                  className="
                    rounded-xl
                    border
                    border-red-500/20
                    bg-red-500/5
                    p-3
                    text-xs
                    leading-5
                    text-red-300
                  "
                >

                  {error}

                </div>

              )}

              <div ref={messagesEndRef} />

            </div>

          </div>


          {/* =================================================
              QUICK QUESTIONS
          ================================================= */}

          <div
            className="
              shrink-0
              border-t
              border-slate-800
              bg-[#0f172a]
              px-3
              pt-3
            "
          >

            <p
              className="
                mb-2
                px-1
                text-[11px]
                font-medium
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Suggested questions
            </p>


            <div
              className="
                flex
                flex-wrap
                gap-2
                pb-2
              "
            >

              {quickQuestions.map(
                (question) => (

                  <button
                    type="button"
                    key={question}
                    onClick={() =>
                      sendMessage(question)
                    }
                    disabled={loading}
                    className="
                      shrink-0
                      rounded-full
                      border
                      border-emerald-500/20
                      bg-emerald-500/5
                      px-3
                      py-1.5
                      text-[11px]
                      text-emerald-300
                      transition
                      hover:border-emerald-500/40
                      hover:bg-emerald-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >

                    {question}

                  </button>

                )
              )}

            </div>

          </div>


          {/* =================================================
              INPUT
          ================================================= */}

          <div
            className="
              shrink-0
              border-t
              border-slate-800
              bg-[#020617]
              p-3
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                p-1
                transition
                focus-within:border-emerald-500/60
              "
            >

              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask your AI Twin..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-3
                  py-2
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  disabled:opacity-50
                "
              />


              <button
                type="button"
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  loading ||
                  !message.trim()
                }
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-emerald-500
                  text-slate-950
                  transition
                  hover:bg-emerald-400
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                title="Send message"
              >

                <Send size={16} />

              </button>

            </div>


            <p
              className="
                mt-2
                text-center
                text-[10px]
                text-slate-600
              "
            >
              FinTwin AI provides insights based on your financial data.
            </p>

          </div>

        </div>

      )}


      {/* =====================================================
          FLOATING AI BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (previous) => !previous
          )
        }
        aria-label={
          isOpen
            ? "Close FinTwin AI"
            : "Open FinTwin AI"
        }
        title="FinTwin AI"
        className="
          fixed
          bottom-6
          right-6
          z-[9999]
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          border
          border-emerald-300/40
          bg-emerald-500
          text-slate-950
          shadow-[0_8px_30px_rgba(16,185,129,0.35)]
          transition-all
          duration-200
          hover:scale-105
          hover:bg-emerald-400
          active:scale-95
        "
      >

        {isOpen ? (
          <X size={23} />
        ) : (
          <Sparkles size={24} />
        )}


        {/* ONLINE DOT */}

        {!isOpen && (

          <span
            className="
              absolute
              right-0
              top-0
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-[#020617]
              bg-emerald-300
            "
          />

        )}

      </button>

    </>
  );
}