import type { Env } from './env';

export async function cleanupAuthArtifacts(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM auth_login_attempts WHERE created_at < datetime('now', '-1 day')"),
    env.DB.prepare("DELETE FROM auth_password_resets WHERE created_at < datetime('now', '-2 days') OR (used_at IS NOT NULL AND used_at < datetime('now', '-1 day'))"),
    env.DB.prepare("DELETE FROM auth_oauth_states WHERE created_at < datetime('now', '-1 day') OR (used_at IS NOT NULL AND used_at < datetime('now', '-1 hour'))")
  ]);
}
