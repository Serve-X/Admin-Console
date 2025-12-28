export const environment = {
  apiBaseUrl: 'http://localhost:8080',
  auth: {
    authorizationEndpoint: 'http://127.0.0.1:8180/realms/ServeX/protocol/openid-connect/auth',
    tokenEndpoint: 'http://127.0.0.1:8180/realms/ServeX/protocol/openid-connect/token',
    logoutEndpoint: 'http://127.0.0.1:8180/realms/ServeX/protocol/openid-connect/logout',
    clientId: 'servexclient',
    clientSecret: 'uQwtP84rrCZq27O3Oyu73GyNzWdCH2a7',
    scope: 'openid profile email',
    usePkce: true,
    codeChallengeMethod: 'S256',
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:4200/auth/callback'
  }
};
