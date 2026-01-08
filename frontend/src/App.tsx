import { useEffect, useRef, useState } from "react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollDown, setShowScrollDown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  const showError = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  const handleChat = () => {
    localStorage.removeItem("sessionId");
    setMessages([]);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;

    const nearBottom = scrollHeight - scrollTop - clientHeight < 70;

    setShowScrollDown(!nearBottom);
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      showError("Message cannot be empty.");
      return;
    }

    if (input.length > 100) {
      showError("Message is too long. Please keep it under 100 characters.");
      return;
    }

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const sessionId = localStorage.getItem("sessionId");
      const res = await fetch(
        "https://ai-agent-gmr1.onrender.com/chat/message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage.text, sessionId }),
        }
      );

      const data = await res.json();

      if (res.status !== 200) {
        showError(data?.message);
        setLoading(false);
        return;
      }

      const aiMessage: Message = { sender: "ai", text: data.message };
      setMessages((prev) => [...prev, aiMessage]);

      if (!sessionId && data.sessionId) {
        localStorage.setItem("sessionId", data.sessionId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      const sessionId = localStorage.getItem("sessionId");

      if (!sessionId) return;

      try {
        const res = await fetch(
          `https://ai-agent-gmr1.onrender.com/chat/${sessionId}`
        );
        const data = await res.json();

        if (res.status !== 200) {
          showError(data?.message);
          return;
        }

        setMessages(data.messages);
      } catch (error) {
        console.error(error);
      }
    };

    loadMessages();
  }, [localStorage.getItem("sessionId")]);

  return (
    <div className="flex">
      <div
        onClick={handleChat}
        className="rounded-lg bg-yellow-400 text-white p-3 mt-6 ml-8 h-fit cursor-pointer"
      >
        New Chat
      </div>
      <div className=" text-black h-screen p-10 flex flex-col items-center max-w-200 m-auto">
        <div>
          <h1 className=" text-3xl text-yellow-500 text-center">
            Live Chat Agent
          </h1>
          <p className="text-base text-gray-600">
            This is a customer support agent. It answers all your queries
            regarding the product.
          </p>
        </div>

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative w-150 mt-14 pr-[8.3rem] h-100 overflow-y-auto"
        >
          {messages.map((m, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div
                className={`flex rounded-lg ${
                  m.sender === "user"
                    ? "justify-end bg-gray-200 max-w-[70%] ml-auto"
                    : "justify-start bg-white"
                }  p-3 mb-5 text-black`}
              >
                <p className="text-sm ">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && <div>Agent is typing...</div>}
        </div>

        {showScrollDown && (
          <button
            className="rounded-full text-white bg-gray-700 p-2 arrow-down-button cursor-pointer transition absolute m-2 mr-30"
            onClick={scrollBottom}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-arrow-down-icon lucide-arrow-down"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        )}

        {errorMessage !== "" && (
          <div className="mr-auto rounded-lg bg-red-400 text-white p-2">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-6 mt-4 mb-8">
          <input
            type="text"
            id="input"
            className="border-4 bg-white border-gray-400 px-4 py-2 rounded-md hover:border-gray-500 focus:outline-none"
            size={50}
            value={input}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask anything"
          ></input>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-yellow-400 px-6 py-1 rounded-md text-white text-lg cursor-pointer"
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
