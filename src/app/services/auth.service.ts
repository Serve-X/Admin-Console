import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthTokens, AuthUser, TokenResponse } from '../models/auth.models';
import { environment } from '../../environments/environment';

const PKCE_VERIFIER_KEY = 'servex.pkce.verifier';
const OAUTH_STATE_KEY = 'servex.oauth.state';
const TOKENS_KEY = 'servex.oauth.tokens';
const REDIRECT_KEY = 'servex.oauth.redirect';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokens$ = new BehaviorSubject<AuthTokens | null>(null);
  readonly user$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private readonly http: HttpClient) {
    this.restoreTokens();
  }

  get isAuthenticated(): boolean {
    return !!this.tokens$.value;
  }

  async login(redirectPath: string = '/'): Promise<void> {
    let verifier: string | undefined;
    if (environment.auth.usePkce) {
      verifier = this.generateCodeVerifier();
      localStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    } else {
      localStorage.removeItem(PKCE_VERIFIER_KEY);
    }

    const state = crypto.randomUUID();
    localStorage.setItem(OAUTH_STATE_KEY, state);
    localStorage.setItem(REDIRECT_KEY, redirectPath);

    const url = new URL(environment.auth.authorizationEndpoint);
    url.searchParams.set('client_id', environment.auth.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', environment.auth.scope);
    url.searchParams.set('redirect_uri', environment.auth.redirectUri);
    if (environment.auth.usePkce && verifier) {
      const challenge = await this.generateCodeChallenge(verifier);
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', environment.auth.codeChallengeMethod ?? 'S256');
    }
    url.searchParams.set('state', state);

    window.location.assign(url.toString());
  }

  async handleAuthCallback(code: string, returnedState: string): Promise<void> {
    const storedState = localStorage.getItem(OAUTH_STATE_KEY);
    const verifier = environment.auth.usePkce ? localStorage.getItem(PKCE_VERIFIER_KEY) : undefined;
    if (!storedState || storedState !== returnedState) {
      throw new Error('Invalid authorization response');
    }
    if (environment.auth.usePkce && !verifier) {
      throw new Error('Missing PKCE verifier');
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', environment.auth.redirectUri);
    body.set('client_id', environment.auth.clientId);
    if (environment.auth.usePkce && verifier) {
      body.set('code_verifier', verifier);
    }
    const tokenResponse = await firstValueFrom(
      this.http.post<TokenResponse>(environment.auth.tokenEndpoint, body.toString(), {
        headers: this.buildTokenHeaders()
      })
    );

    this.persistTokens(tokenResponse);
    if (environment.auth.usePkce) {
      localStorage.removeItem(PKCE_VERIFIER_KEY);
    }
    localStorage.removeItem(OAUTH_STATE_KEY);
  }

  async getValidAccessToken(): Promise<string | null> {
    const tokens = this.tokens$.value;
    if (!tokens) {
      return null;
    }
    if (Date.now() < tokens.expiresAt - 5000) {
      return tokens.accessToken;
    }
    if (tokens.refreshToken) {
      await this.refresh(tokens.refreshToken);
      return this.tokens$.value?.accessToken ?? null;
    }
    this.logout();
    return null;
  }

  async refresh(refreshToken: string): Promise<void> {
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);
    body.set('client_id', environment.auth.clientId);
    const tokenResponse = await firstValueFrom(
      this.http.post<TokenResponse>(environment.auth.tokenEndpoint, body.toString(), {
        headers: this.buildTokenHeaders()
      })
    );
    this.persistTokens(tokenResponse);
  }

  logout(): void {
    const logoutUrl = new URL(environment.auth.logoutEndpoint);
    logoutUrl.searchParams.set('client_id', environment.auth.clientId);
    logoutUrl.searchParams.set('post_logout_redirect_uri', window.location.origin);
    localStorage.removeItem(TOKENS_KEY);
    this.tokens$.next(null);
    this.user$.next(null);
    window.location.assign(logoutUrl.toString());
  }

  consumeRedirectPath(): string {
    const path = localStorage.getItem(REDIRECT_KEY) || '/';
    localStorage.removeItem(REDIRECT_KEY);
    return path;
  }

  private persistTokens(response: TokenResponse): void {
    const expiresAt = Date.now() + response.expires_in * 1000;
    const refreshExpiresAt = response.refresh_expires_in ? Date.now() + response.refresh_expires_in * 1000 : undefined;
    const tokens: AuthTokens = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      idToken: response.id_token,
      expiresAt,
      refreshExpiresAt
    };
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    this.tokens$.next(tokens);
    this.user$.next(this.decodeUser(tokens));
  }

  private restoreTokens(): void {
    const stored = localStorage.getItem(TOKENS_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as AuthTokens;
      if (parsed.refreshExpiresAt && parsed.refreshExpiresAt < Date.now()) {
        localStorage.removeItem(TOKENS_KEY);
        return;
      }
      if (parsed.expiresAt > Date.now()) {
        this.tokens$.next(parsed);
        this.user$.next(this.decodeUser(parsed));
      } else {
        localStorage.removeItem(TOKENS_KEY);
      }
    } catch {
      localStorage.removeItem(TOKENS_KEY);
    }
  }

  private decodeUser(tokens: AuthTokens): AuthUser {
    const token = tokens.idToken ?? tokens.accessToken;
    const payload = this.decodeJwt(token);
    return {
      name: payload?.['name'],
      email: payload?.['email'],
      preferredUsername: payload?.['preferred_username']
    };
  }

  private buildTokenHeaders(): HttpHeaders {
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    if (environment.auth.clientSecret) {
      const credentials = btoa(`${environment.auth.clientId}:${environment.auth.clientSecret}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }
    return new HttpHeaders(headers);
  }

  private decodeJwt(token: string): Record<string, any> | null {
    try {
      const [, payload] = token.split('.');
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const jsonPayload = decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => ('0' + byte.toString(16)).slice(-2)).join('');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    let base64 = '';
    bytes.forEach((b) => (base64 += String.fromCharCode(b)));
    return btoa(base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
