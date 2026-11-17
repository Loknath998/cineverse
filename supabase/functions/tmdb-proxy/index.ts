import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TMDB_BASE = "https://api.themoviedb.org/3";
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TMDB_API_KEY");
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const query = url.searchParams.get("query") ?? "";

    if (!path) {
      return new Response(JSON.stringify({ error: "Missing path parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "TMDB API key not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const target = new URL(`${TMDB_BASE}${path}`);
    target.searchParams.set("api_key", apiKey);
    if (query) {
      const pairs = query.split("&");
      for (const pair of pairs) {
        const [k, v] = pair.split("=");
        if (k && v) target.searchParams.set(k, decodeURIComponent(v));
      }
    }

    const resp = await fetch(target.toString(), {
      headers: { Accept: "application/json" },
    });

    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: { ...corsHeaders, "Content-Type": resp.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
