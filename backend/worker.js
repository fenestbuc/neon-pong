/**
 * Cloudflare Worker — Ping Pong Leaderboard API
 */

const API_VERSION = '1.0.0';
const CLIENT_VERSION_MIN = '1.0.0';
const RATE_LIMIT = 15; // requests per minute
const RATE_WINDOW = 60; // seconds
const MAX_SCORE = 999;
const LB_LIMIT = 100;

function json(data, status = 200, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function error(message, status = 400, corsHeaders) {
  return json({ error: message }, status, corsHeaders);
}

function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  if (name.length < 1 || name.length > 24) return false;
  return /^[a-zA-Z0-9 _\-]+$/.test(name);
}

function validateScore(score) {
  if (!Number.isInteger(score)) return false;
  if (score < 0 || score > MAX_SCORE) return false;
  return true;
}

async function checkRateLimit(env, ip) {
  const key = `rate:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  let data = await env.PINGPONG_KV.get(key);
  
  if (data) {
    data = JSON.parse(data);
    if (now > data.resetAt) {
      data = { count: 1, resetAt: now + RATE_WINDOW };
    } else {
      data.count++;
    }
  } else {
    data = { count: 1, resetAt: now + RATE_WINDOW };
  }
  
  await env.PINGPONG_KV.put(key, JSON.stringify(data), { expirationTtl: RATE_WINDOW + 1 });
  return data.count <= RATE_LIMIT;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Client-Version',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (path === '/api/v1/leaderboard' && request.method === 'GET') {
        const period = url.searchParams.get('period') || 'all';
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
        
        let key = 'lb:all';
        if (period === 'daily') {
          const date = new Date().toISOString().split('T')[0];
          key = `lb:daily:${date}`;
        }
        
        const data = await env.PINGPONG_KV.get(key);
        const scores = data ? JSON.parse(data) : [];
        
        // Add rank to each score
        const ranked = scores.slice(0, limit).map((s, i) => ({ ...s, rank: i + 1 }));
        
        return json({ period, scores: ranked }, 200, corsHeaders);
      }

      if (path === '/api/v1/scores' && request.method === 'POST') {
        // Rate limiting
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const allowed = await checkRateLimit(env, clientIP);
        if (!allowed) {
          return error('Rate limit exceeded. Try again later.', 429, corsHeaders);
        }
        
        // Check client version
        const clientVersion = request.headers.get('X-Client-Version');
        if (!clientVersion) {
          return error('Missing X-Client-Version header', 400, corsHeaders);
        }
        
        const body = await request.json();
        const { player_name, score } = body;
        
        if (!validateName(player_name)) {
          return error('Invalid player name. Must be 1-24 characters, alphanumeric/space/hyphen/underscore.', 400, corsHeaders);
        }
        
        if (!validateScore(score)) {
          return error(`Invalid score. Must be an integer between 0 and ${MAX_SCORE}.`, 400, corsHeaders);
        }
        
        const entry = {
          player_name,
          score,
          created_at: new Date().toISOString(),
        };
        
        // Update all leaderboards
        const periods = ['lb:all', `lb:daily:${new Date().toISOString().split('T')[0]}`];
        
        for (const key of periods) {
          let existing = await env.PINGPONG_KV.get(key);
          let scores = existing ? JSON.parse(existing) : [];
          scores.push(entry);
          scores.sort((a, b) => b.score - a.score);
          scores = scores.slice(0, LB_LIMIT);
          await env.PINGPONG_KV.put(key, JSON.stringify(scores));
        }
        
        // Update player record
        const playerKey = `player:${player_name}`;
        let playerData = await env.PINGPONG_KV.get(playerKey);
        playerData = playerData ? JSON.parse(playerData) : { player_name, best_score: 0, games_played: 0, created_at: entry.created_at };
        playerData.best_score = Math.max(playerData.best_score, score);
        playerData.games_played++;
        playerData.last_played = entry.created_at;
        await env.PINGPONG_KV.put(playerKey, JSON.stringify(playerData));
        
        return json({ success: true, rank: 0 }, 200, corsHeaders);
      }

      if (path.startsWith('/api/v1/player/') && request.method === 'GET') {
        const name = decodeURIComponent(path.split('/api/v1/player/')[1]);
        if (!validateName(name)) {
          return error('Invalid player name', 400, corsHeaders);
        }
        
        const data = await env.PINGPONG_KV.get(`player:${name}`);
        if (!data) {
          return error('Player not found', 404, corsHeaders);
        }
        
        const player = JSON.parse(data);
        
        // Calculate rank
        const lb = await env.PINGPONG_KV.get('lb:all');
        const scores = lb ? JSON.parse(lb) : [];
        const rank = scores.findIndex(s => s.player_name === name) + 1;
        player.rank = rank || null;
        
        return json(player, 200, corsHeaders);
      }

      if (path === '/api/v1/health' && request.method === 'GET') {
        return json({ status: 'ok', version: API_VERSION }, 200, corsHeaders);
      }

      return error('Not Found', 404, corsHeaders);
    } catch (err) {
      return error(err.message, 500, corsHeaders);
    }
  },
};
