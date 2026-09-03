import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");

  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] =
    useState(false);

  const [userResponse, setUserResponse] = useState("");

  const [feedback, setFeedback] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "ava",
      text: "Hey! How was your day today?",
    },
  ]);

  const recognitionRef = useRef(null);

  /* =========================
     TEXT TO SPEECH
  ========================= */

  const speakAva = (text) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAva = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };


  /* =========================
     START PRACTICE
  ========================= */

  const startPractice = () => {
    setMessages([
      {
        sender: "ava",
        text: "Hey! How was your day today?",
      },
    ]);

    setFeedback(null);
    setScreen("conversation");

    setTimeout(() => {
      speakAva("Hey! How was your day today?");
    }, 500);
  };


  /* =========================
     MICROPHONE
  ========================= */

  const handleMicrophone = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    if (isThinking || isSpeaking) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      setUserResponse("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      finalTranscript = transcript;

      setUserResponse(transcript);
    };

    recognition.onend = async () => {
      setIsListening(false);

      const message =
        finalTranscript.trim();

      if (!message) {
        return;
      }

      const updatedMessages = [
        ...messages,
        {
          sender: "user",
          text: message,
        },
      ];

      setMessages(updatedMessages);

      setUserResponse("");
      setIsThinking(true);

      try {
        const conversation =
          updatedMessages.map((item) => ({
            role:
              item.sender === "user"
                ? "user"
                : "assistant",
            content: item.text,
          }));

        const response = await fetch(
          "https://Dulu-backend-n7m3.onrender.com/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message,
              conversation,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "AI request failed"
          );
        }

        const avaMessage = {
          sender: "ava",
          text: data.reply,
        };

        setMessages((previous) => [
          ...previous,
          avaMessage,
        ]);

        setIsThinking(false);

        speakAva(data.reply);
      } catch (error) {
        console.error(
          "AI error:",
          error
        );

        const errorMessage = {
          sender: "ava",
          text:
            "Sorry, I couldn't respond right now. Please try again.",
        };

        setMessages((previous) => [
          ...previous,
          errorMessage,
        ]);

        setIsThinking(false);
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
      setUserResponse("");
    };

    recognitionRef.current =
      recognition;

    recognition.start();
  };


  /* =========================
     FINISH PRACTICE
  ========================= */

  const finishPractice = async () => {
    stopAva();

    recognitionRef.current?.stop();

    setIsListening(false);
    setIsThinking(false);
    setIsGeneratingFeedback(true);

    setScreen("feedback");

    try {
      const response = await fetch(
        "https://Dulu-backend-n7m3.onrender.com/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            conversation: messages,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Feedback generation failed"
        );
      }

      setFeedback(data);
    } catch (error) {
      console.error(
        "Feedback error:",
        error
      );

      setFeedback({
        summary:
          "We couldn't generate your feedback this time. Your conversation was still a good step toward practicing English.",
        strength:
          "You completed a real conversation in English.",
        grammar: [],
        vocabulary: [],
        nextStep:
          "Try another short conversation and focus on speaking naturally.",
      });
    }

    setIsGeneratingFeedback(false);
  };


  /* =========================
     EXIT
  ========================= */

  const exitConversation = () => {
    recognitionRef.current?.stop();

    stopAva();

    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
    setUserResponse("");
    setFeedback(null);

    setMessages([
      {
        sender: "ava",
        text: "Hey! How was your day today?",
      },
    ]);

    setScreen("home");
  };


  /* =========================
     PRACTICE AGAIN
  ========================= */

  const practiceAgain = () => {
    setFeedback(null);

    setMessages([
      {
        sender: "ava",
        text: "Hey! How was your day today?",
      },
    ]);

    setScreen("conversation");

    setTimeout(() => {
      speakAva(
        "Hey! How was your day today?"
      );
    }, 500);
  };


  /* =========================
     FEEDBACK SCREEN
  ========================= */

  if (screen === "feedback") {
    return (
      <div className="feedback-page">

        <header className="conversation-header">
          <div className="logo">
            Dulu
          </div>

          <button
            className="exit-button"
            onClick={exitConversation}
          >
            Home
          </button>
        </header>


        <main className="feedback-main">

          <p className="conversation-label">
            YOUR PRACTICE REPORT
          </p>

          <h1 className="feedback-title">
            Nice work. You showed up.
          </h1>

          {isGeneratingFeedback ? (
            <div className="feedback-loading">

              <div className="loading-circle">
                ✦
              </div>

              <h2>
                Ava is reviewing your
                conversation...
              </h2>

              <p>
                Looking for useful patterns
                and suggestions.
              </p>

            </div>
          ) : feedback ? (

            <div className="feedback-content">

              <section className="feedback-card summary-card">

                <p className="feedback-card-label">
                  OVERVIEW
                </p>

                <p className="feedback-summary">
                  {feedback.summary}
                </p>

              </section>


              <section className="feedback-card">

                <p className="feedback-card-label">
                  WHAT YOU DID WELL
                </p>

                <h2>
                  {feedback.strength}
                </h2>

              </section>


              {feedback.grammar &&
                feedback.grammar.length >
                  0 && (

                  <section className="feedback-card">

                    <p className="feedback-card-label">
                      SMALL GRAMMAR FIXES
                    </p>

                    <div className="feedback-list">

                      {feedback.grammar.map(
                        (item, index) => (
                          <div
                            className="feedback-item"
                            key={index}
                          >

                            <p className="used-text">
                              You said: "{item.original}"
                            </p>

                            <p className="better-text">
                              Try: "{item.better}"
                            </p>

                            <p className="explanation">
                              {item.explanation}
                            </p>

                          </div>
                        )
                      )}

                    </div>

                  </section>
                )}


              {feedback.vocabulary &&
                feedback.vocabulary.length >
                  0 && (

                  <section className="feedback-card">

                    <p className="feedback-card-label">
                      BETTER PHRASES
                    </p>

                    <div className="feedback-list">

                      {feedback.vocabulary.map(
                        (item, index) => (
                          <div
                            className="feedback-item"
                            key={index}
                          >

                            <p className="used-text">
                              Instead of "{item.used}"
                            </p>

                            <p className="better-text">
                              Try "{item.better}"
                            </p>

                            <p className="example-text">
                              {item.example}
                            </p>

                          </div>
                        )
                      )}

                    </div>

                  </section>
                )}


              <section className="feedback-card next-step-card">

                <p className="feedback-card-label">
                  TRY THIS NEXT TIME
                </p>

                <h2>
                  {feedback.nextStep}
                </h2>

              </section>


              <div className="feedback-actions">

                <button
                  className="start-button"
                  onClick={practiceAgain}
                >
                  Practice again →
                </button>

                <button
                  className="secondary-button"
                  onClick={exitConversation}
                >
                  Back to home
                </button>

              </div>

            </div>

          ) : null}

        </main>
      </div>
    );
  }


  /* =========================
     CONVERSATION SCREEN
  ========================= */

  if (screen === "conversation") {
    return (
      <div className="conversation-page">

        <header className="conversation-header">

          <div className="logo">
            Dulu
          </div>

          <button
            className="exit-button"
            onClick={exitConversation}
          >
            Exit
          </button>

        </header>


        <main className="conversation-main">

          <p className="conversation-label">
            CASUAL CONVERSATION
          </p>


          <div className="conversation-avatar">

            <div
              className={`avatar-circle ${
                isSpeaking
                  ? "avatar-speaking"
                  : ""
              }`}
            >

              <div className="avatar-face">

                <div className="eyes">
                  <span></span>
                  <span></span>
                </div>

                <div
                  className={`mouth ${
                    isSpeaking
                      ? "mouth-speaking"
                      : ""
                  }`}
                ></div>

              </div>

            </div>

          </div>


          <div className="speaking-indicator">

            <span className="status-dot"></span>

            {isListening
              ? "Ava is listening"
              : isThinking
              ? "Ava is thinking..."
              : isSpeaking
              ? "Ava is speaking"
              : "Ava is ready"}

          </div>


          <div className="messages-container">

            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.sender ===
                    "user"
                      ? "user-message"
                      : "ava-message"
                  }`}
                >

                  <p className="speaker-name">
                    {message.sender ===
                    "user"
                      ? "You"
                      : "Ava"}
                  </p>

                  <p className="question">
                    {message.text}
                  </p>

                </div>
              )
            )}


            {userResponse && (
              <div className="message user-message live-message">

                <p className="speaker-name">
                  You
                </p>

                <p className="question">
                  {userResponse}
                </p>

              </div>
            )}


            {isThinking && (
              <div className="message ava-message">

                <p className="speaker-name">
                  Ava
                </p>

                <p className="question">
                  Thinking...
                </p>

              </div>
            )}

          </div>


          <button
            className="finish-button"
            onClick={finishPractice}
            disabled={
              isThinking ||
              isListening ||
              isGeneratingFeedback
            }
          >
            Finish practice
          </button>


          {isSpeaking && (
            <button
              className="stop-speaking-button"
              onClick={stopAva}
            >
              🔇 Stop Ava
            </button>
          )}


          <button
            className={`mic-button ${
              isListening
                ? "listening"
                : ""
            }`}
            onClick={
              handleMicrophone
            }
            disabled={
              isThinking ||
              isSpeaking
            }
            aria-label={
              isListening
                ? "Stop listening"
                : "Start speaking"
            }
          >
            {isListening
              ? "⏹️"
              : "🎙️"}
          </button>


          <p className="mic-hint">

            {isListening
              ? "I'm listening..."
              : isThinking
              ? "Ava is preparing a response..."
              : isSpeaking
              ? "Ava is speaking..."
              : "Tap the microphone and start speaking"}

          </p>

        </main>
      </div>
    );
  }


  /* =========================
     HOME SCREEN
  ========================= */

  return (
    <div className="app">

      <header className="navbar">

        <div className="logo">
          Dulu
        </div>

        <div className="tagline">
          Practice English. Naturally.
        </div>

      </header>


      <main className="hero">

        <section className="intro">

          <p className="eyebrow">
            AI SPEAKING PARTNER
          </p>

          <h1>
            Speak more.
            <br />
            <span>
              Worry less.
            </span>
          </h1>

          <p className="description">
            Have a natural conversation
            with your AI speaking partner
            and get helpful feedback when
            you're done.
          </p>

          <button
            className="start-button"
            onClick={startPractice}
          >
            Start practicing →
          </button>

        </section>


        <section className="avatar-section">

          <div className="avatar-card">

            <div className="avatar-circle">

              <div className="avatar-face">

                <div className="eyes">
                  <span></span>
                  <span></span>
                </div>

                <div className="mouth"></div>

              </div>

            </div>

            <div className="avatar-status">

              <span className="status-dot"></span>

              Ava is ready to talk

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;
