export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // Handle preflight (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ✅ Safely read JSON body
      let bodyText = await request.text();
      let body = bodyText ? JSON.parse(bodyText) : { messages: [] };

      if (!body.messages || body.messages.length === 0) {
        body.messages = [{ role: "user", content: "Hello!" }];
      }

      // ✅ Forward to OpenAI
      const apiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: body.messages,
            max_tokens: 300,
          }),
        }
      );

      const data = await apiResponse.json();

      // ✅ Handle bad responses cleanly
      if (!data || !data.choices) {
        return new Response(
          JSON.stringify({ error: "No response from OpenAI API" }),
          { headers: corsHeaders, status: 502 }
        );
      }

      // ✅ Return what your script expects
      return new Response(JSON.stringify({ choices: data.choices }), {
        headers: corsHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        headers: corsHeaders,
        status: 500,
      });
    }
  },
};
