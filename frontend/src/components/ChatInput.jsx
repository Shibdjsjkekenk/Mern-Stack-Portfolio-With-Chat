import React, { useRef, useEffect, memo } from "react";

const ChatInput = memo(({ input, setInput, onSend }) => {
  const inputRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t p-2 flex items-center gap-2 bg-white">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border rounded-lg outline-none text-sm"
      />
      <button
        onClick={onSend}
        className="bg-[#0060AF] text-white px-3 py-2 rounded-lg text-sm"
      >
        Send
      </button>
    </div>
  );
});

export default ChatInput;
