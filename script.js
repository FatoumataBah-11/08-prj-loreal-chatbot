const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Your Cloudflare Worker endpoint
const API_URL = "https://wanderbot-worker.fatoumata6871.workers.dev/";

// Initial greeting
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

// Helper to display messages
function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", sender);
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msgDiv;
}

// Handle chat form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  appendMessage("user", message);
  userInput.value = "";

  // Show typing indicator
  const typingMsg = appendMessage("ai", "💬 Typing...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    // Remove typing message
    typingMsg.remove();

    // Show AI response
    const reply =
      data?.choices?.[0]?.message?.content ??
      "⚠️ No response received from the AI.";
    appendMessage("ai", reply);
  } catch (error) {
    console.error(error);
    typingMsg.remove();
    appendMessage("ai", "⚠️ There was an error connecting to the server.");
  }
});
