import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [rating, setRating] = useState(0);
  const [wouldPracticeAgain, setWouldPracticeAgain] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [sessionStartTime, setSessionStartTime] = useState(null);

  const [sessionStats, setSessionStats] = useState({
    turns: 0,
    duration: 0,
  });

  const [messages, setMessages] = useState([]);

  const recognitionRef = useRef(null);

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

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

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  const startPractice = () => {
    const startTime = Date.now();

    setSessionStartTime(startTime);

    setMessages([
      {
        sender: "ava",
        text: "Hey! How was your day today?",
      },
    ]);

    setUserResponse("");
    setFeedback(null);
    setRating(0);
    setWouldPracticeAgain(null);
    setFeedbackSubmitted(false);

    setSessionStats({
      turns: 0,
      duration: 0,
    });

    setScreen("conversation");

    setTimeout(() => {
      speakText("Hey! How was your day today?");
    }, 300);
  };

  const handleMicrophone = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;

      setUserResponse(transcript);

      await sendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const sendMessage = async (message) => {
    if (!message.trim()) {
      return;
    }

    setIsThinking(true);

    const updatedMessages = [
      ...messages,
      {
        sender: "user",
        text: message,
      },
    ];

    setMessages(updatedMessages);

    try {
      const conversation = updatedMessages.map((item) => ({
        role: item.sender === "user" ? "user" : "assistant",
        content: item.text,
      }));

      const response = await fetch(
        "https://speakly-backend-n7m3.onrender.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversation,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from Ava.");
      }

      const data = await response.json();

      const avaMessage = {
        sender: "ava",
        text: data.reply,
      };

      setMessages((prev) => [...prev, avaMessage]);

      setSessionStats((prev) => ({
        ...prev,
        turns: prev.turns + 1,
      }));

      speakText(data.reply);
    } catch (error) {
      console.error("Chat error:", error);

      const fallbackMessage = {
        sender: "ava",
        text:
          "Sorry, I had a little trouble there. Could you say that again?",
      };

      setMessages((prev) => [...prev, fallbackMessage]);

      speakText(fallbackMessage.text);
    } finally {
      setIsThinking(false);
      setUserResponse("");
    }
  };

  const finishPractice = async () => {
    stopSpeaking();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);

    const duration = sessionStartTime
      ? Math.floor((Date.now() - sessionStartTime) / 1000)
      : 0;

    setSessionStats((prev) => ({
      ...prev,
      duration,
    }));

    setScreen("feedback");
    setIsGeneratingFeedback(true);

    try {
      const response = await fetch(
        "https://speakly-backend-n7m3.onrender.com/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation: messages,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate feedback.");
      }

      const data = await response.json();

      setFeedback(data);
    } catch (error) {
      console.error("Feedback error:", error);

      setFeedback({
        summary:
          "You completed a speaking practice session. Keep practicing regularly to build confidence.",
        strength:
          "You actively participated in the conversation.",
        grammar: [],
        vocabulary: [],
        nextStep:
          "Try speaking for a little longer in your next session.",
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const submitUserFeedback = () => {
    if (!rating || wouldPracticeAgain === null) {
      return;
    }

    setFeedbackSubmitted(true);
  };

  const exitPractice = () => {
    stopSpeaking();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
    setIsThinking(false);

    setScreen("home");

    setMessages([]);
    setUserResponse("");
    setFeedback(null);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (screen === "home") {
    return (
      <div className="app">
        <header className="navbar">
          <div className="logo">Speakly</div>

          <div className="nav-tagline">
            Practice English. Naturally.
          </div>
        </header>

        <main className="home-container">
          <section className="hero">
            <div className="hero-text">
              <p className="eyebrow">
                AI English Speaking Coach
              </p>

              <h1>
                Speak more.
                <br />
                Worry less.
              </h1>

              <p className="hero-description">
                Practice real English conversations with
                Ava, your friendly AI speaking partner.
              </p>

              <button
                className="primary-button"
                onClick={startPractice}
              >
                Start practicing
              </button>

              <p className="small-note">
                No judgment. No pressure. Just practice.
              </p>
            </div>

            <div className="home-avatar-container">
              <div className="avatar-large">
                <div className="avatar-face">
                  <div className="avatar-eyes">
                    <span />
                    <span />
                  </div>

                  <div className="avatar-mouth" />
                </div>
              </div>

              <div className="avatar-name">Ava</div>

              <div className="avatar-status">
                Your AI speaking partner
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (screen === "conversation") {
    return (
      <div className="app">
        <header className="conversation-header">
          <div className="logo">Speakly</div>

          <button
            className="exit-button"
            onClick={exitPractice}
          >
            Exit
          </button>
        </header>

        <main className="conversation-container">
          <div className="conversation-top">
            <div className="avatar-large conversation-avatar">
              <div
                className={`avatar-face ${
                  isSpeaking ? "avatar-speaking" : ""
                }`}
              >
                <div className="avatar-eyes">
                  <span />
                  <span />
                </div>

                <div
                  className={`avatar-mouth ${
                    isSpeaking ? "mouth-speaking" : ""
                  }`}
                />
              </div>
            </div>

            <div className="ava-info">
              <h2>Ava</h2>

              <p>
                {isThinking
                  ? "Thinking..."
                  : isSpeaking
                  ? "Speaking..."
                  : "Listening"}
              </p>
            </div>
          </div>

          <div className="conversation-box">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user"
                    ? "user-message"
                    : "ava-message"
                }`}
              >
                <span className="message-label">
                  {message.sender === "user" ? "You" : "Ava"}
                </span>

                <p>{message.text}</p>
              </div>
            ))}

            {isThinking && (
              <div className="message ava-message">
                <span className="message-label">Ava</span>

                <p className="thinking-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </p>
              </div>
            )}
          </div>

          <div className="conversation-controls">
            <button
              className={`microphone-button ${
                isListening ? "microphone-active" : ""
              }`}
              onClick={handleMicrophone}
              disabled={isThinking}
            >
              {isListening ? "Listening..." : "🎤 Speak"}
            </button>

            {isSpeaking && (
              <button
                className="stop-speaking-button"
                onClick={stopSpeaking}
              >
                Stop Ava
              </button>
            )}

            <button
              className="finish-button"
              onClick={finishPractice}
            >
              Finish practice
            </button>
          </div>

          <p className="conversation-note">
            Speak naturally. You don't need perfect English.
          </p>
        </main>
      </div>
    );
  }

  if (screen === "feedback") {
    return (
      <div className="app">
        <header className="conversation-header">
          <div className="logo">Speakly</div>

          <button
            className="exit-button"
            onClick={() => setScreen("home")}
          >
            Home
          </button>
        </header>

        <main className="feedback-container">
          {isGeneratingFeedback ? (
            <section className="feedback-card">
              <div className="feedback-loading">
                <div className="loading-circle" />

                <h2>
                  Ava is reviewing your conversation...
                </h2>

                <p>
                  Give us a moment to prepare your feedback.
                </p>
              </div>
            </section>
          ) : (
            <>
              <section className="feedback-header">
                <p className="eyebrow">Session complete</p>

                <h1>Your speaking report</h1>

                <p>
                  Here's a quick look at how your
                  conversation went.
                </p>
              </section>

              <section className="session-stats">
                <div className="stat-card">
                  <span className="stat-value">
                    {sessionStats.turns}
                  </span>

                  <span className="stat-label">Turns</span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">
                    {formatDuration(sessionStats.duration)}
                  </span>

                  <span className="stat-label">
                    Practice time
                  </span>
                </div>

                <div className="stat-card">
                  <span className="stat-value">✓</span>

                  <span className="stat-label">
                    Completed
                  </span>
                </div>
              </section>

              {feedback && (
                <>
                  <section className="feedback-card">
                    <h2>Overview</h2>

                    <p>{feedback.summary}</p>
                  </section>

                  <section className="feedback-card">
                    <h2>What you did well</h2>

                    <p>{feedback.strength}</p>
                  </section>

                  {feedback.grammar &&
                    feedback.grammar.length > 0 && (
                      <section className="feedback-card">
                        <h2>Grammar fixes</h2>

                        {feedback.grammar.map(
                          (item, index) => (
                            <div
                              className="feedback-item"
                              key={index}
                            >
                              <p>
                                <strong>You said:</strong>{" "}
                                "{item.original}"
                              </p>

                              <p>
                                <strong>
                                  More natural:
                                </strong>{" "}
                                "{item.better}"
                              </p>

                              <p className="feedback-explanation">
                                {item.explanation}
                              </p>
                            </div>
                          )
                        )}
                      </section>
                    )}

                  {feedback.vocabulary &&
                    feedback.vocabulary.length > 0 && (
                      <section className="feedback-card">
                        <h2>Better phrases</h2>

                        {feedback.vocabulary.map(
                          (item, index) => (
                            <div
                              className="feedback-item"
                              key={index}
                            >
                              <p>
                                <strong>You used:</strong>{" "}
                                {item.used}
                              </p>

                              <p>
                                <strong>Try:</strong>{" "}
                                {item.better}
                              </p>

                              <p className="feedback-example">
                                Example: {item.example}
                              </p>
                            </div>
                          )
                        )}
                      </section>
                    )}

                  <section className="feedback-card">
                    <h2>Next step</h2>

                    <p>{feedback.nextStep}</p>
                  </section>

                  {!feedbackSubmitted ? (
                    <section className="feedback-card rating-card">
                      <h2>
                        How was this practice session?
                      </h2>

                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className={`star ${
                              rating >= star
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => setRating(star)}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <p className="rating-question">
                        Would you practice with Ava again?
                      </p>

                      <div className="yes-no-buttons">
                        <button
                          className={`choice-button ${
                            wouldPracticeAgain === true
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setWouldPracticeAgain(true)
                          }
                        >
                          Yes
                        </button>

                        <button
                          className={`choice-button ${
                            wouldPracticeAgain === false
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setWouldPracticeAgain(false)
                          }
                        >
                          Not yet
                        </button>
                      </div>

                      <button
                        className="submit-feedback-button"
                        disabled={
                          rating === 0 ||
                          wouldPracticeAgain === null
                        }
                        onClick={submitUserFeedback}
                      >
                        Submit feedback
                      </button>
                    </section>
                  ) : (
                    <section className="feedback-card">
                      <div className="feedback-thanks">
                        <div className="thanks-icon">✓</div>

                        <h2>Thanks for the feedback!</h2>

                        <p>
                          Your response helps improve
                          Speakly.
                        </p>
                      </div>
                    </section>
                  )}

                  <div className="feedback-actions">
                    <button
                      className="primary-button"
                      onClick={startPractice}
                    >
                      Practice again
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => setScreen("home")}
                    >
                      Back to home
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  return null;
}

export default App;
