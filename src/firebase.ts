import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// Request all required Gmail scopes
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!cachedAccessToken) {
        cachedAccessToken = localStorage.getItem('draftly_google_access_token');
      }

      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      // Check for persisted local only session
      const localSession = localStorage.getItem('draftly_local_only_session');
      if (localSession) {
        try {
          const { user: mockUser, token } = JSON.parse(localSession);
          cachedAccessToken = token;
          onAuthSuccess(mockUser, token);
          return;
        } catch (e) {
          localStorage.removeItem('draftly_local_only_session');
        }
      }

      // Check for persisted mock Apple session to allow page refresh persistence
      const appleSession = localStorage.getItem('draftly_apple_session');
      if (appleSession) {
        try {
          const { user: mockUser, token } = JSON.parse(appleSession);
          cachedAccessToken = token;
          onAuthSuccess(mockUser, token);
          return;
        } catch (e) {
          localStorage.removeItem('draftly_apple_session');
        }
      }
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

// Initiate Google Sign-In with popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google Sign-In.');
    }

    cachedAccessToken = credential.accessToken;
    // Persist Google access token in localStorage for page refresh persistence
    localStorage.setItem('draftly_google_access_token', cachedAccessToken);

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Initiate Apple Sign-In
export const appleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    // Simulate a brief, modern, sleek authentication experience
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Form a realistic, compliant mock User structure containing iCloud info
    const mockUser = {
      uid: 'apple-user-' + Math.random().toString(36).substring(2, 11),
      email: 'shandilyatanishk34@icloud.com',
      displayName: 'Apple Client',
      photoURL: null,
      emailVerified: true,
    } as unknown as User;

    cachedAccessToken = 'apple_mock_session_token_' + Math.random().toString(36).substring(2, 14);

    // Save mock session locally for persistent hydration
    localStorage.setItem('draftly_apple_session', JSON.stringify({ user: mockUser, token: cachedAccessToken }));

    return { user: mockUser, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Apple Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  localStorage.removeItem('draftly_apple_session');
  localStorage.removeItem('draftly_google_access_token');
  cachedAccessToken = null;
};

