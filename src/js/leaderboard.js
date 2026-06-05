/**
 * Leaderboard API client with offline queue.
 */

import { API_BASE } from './constants.js';

export class LeaderboardClient {
  constructor() {
    this.base = API_BASE;
    this.offlineQueue = [];
  }

  async fetchLeaderboard(period = 'all', limit = 20) {
    // TODO: fetch from Worker API
  }

  async submitScore(playerName, score) {
    // TODO: POST to Worker, handle offline
  }

  async flushQueue() {
    // TODO: retry queued submissions
  }
}
