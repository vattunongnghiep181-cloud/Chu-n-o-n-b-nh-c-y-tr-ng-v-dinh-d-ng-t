import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive Read-only access
provider.addScope("https://www.googleapis.com/auth/drive.readonly");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // In a real app, since we use popups, the accessToken may need to be re-obtained or cached.
      // We read from sessionStorage or local state. Since the rules say DO NOT store in localStorage,
      // we'll keep it in-memory but if page reloads, user will click Sign In again, or we can restore if active.
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Try to read from sessionStorage just as an in-session backup so refreshes don't lose it immediately, 
        // but to strictly adhere to "in-memory caching for the access token, do NOT store in localStorage/sessionStorage",
        // we will NOT use sessionStorage and respect the prompt rule: "MUST implement in-memory caching for the access token. Do NOT store the access token in localStorage or sessionStorage."
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Không nhận được mã xác thực (access token) từ Google.");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Lỗi đăng nhập Google:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- Google Drive API Handlers ---

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
}

/**
 * Tìm kiếm thư mục có tên "BVTV" trên Google Drive
 */
export const searchBVTVFolder = async (accessToken: string): Promise<string | null> => {
  try {
    const query = encodeURIComponent("name = 'BVTV' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=1`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (e) {
    console.error("Lỗi tìm thư mục BVTV:", e);
    throw e;
  }
};

/**
 * Liệt kê tất cả tệp tin trong thư mục BVTV
 */
export const listFilesFromFolder = async (accessToken: string, folderId: string): Promise<DriveFile[]> => {
  try {
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,iconLink)&pageSize=100`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (e) {
    console.error("Lỗi liệt kê file từ thư mục:", e);
    throw e;
  }
};

/**
 * Đọc nội dung văn bản của một file (nếu là Google Doc hoặc Text) để làm ngữ cảnh chẩn đoán bệnh
 */
export const fetchFileTextContent = async (accessToken: string, file: DriveFile): Promise<string | null> => {
  try {
    let url = "";
    if (file.mimeType === "application/vnd.google-apps.document") {
      // Google Doc - Export as plain text
      url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
    } else if (file.mimeType === "text/plain") {
      // Plain text file
      url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
    } else {
      // PDF or other - not easily parsable as raw text via client side direct fetch without complex parsing
      return null;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    // Limit to 5000 chars to avoid model context overflow and slow processing
    return text.length > 5000 ? text.substring(0, 5000) + "..." : text;
  } catch (e) {
    console.error(`Lỗi đọc nội dung file ${file.name}:`, e);
    return null;
  }
};
