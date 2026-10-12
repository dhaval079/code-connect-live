import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CodeConnect",
  description: "How CodeConnect handles account information, shared code, conversations, and AI requests.",
  alternates: { canonical: "https://www.codeconnectai.tech/privacy" },
};

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="text-muted">Effective date: October 12, 2026</p>
      <p>CodeConnect is operated by Dhaval Rupapara. This policy covers our website at codeconnectai.tech and our collaborative coding application at app.codeconnectai.tech. For privacy questions, contact <a href="mailto:dhaval@codeconnectai.tech">dhaval@codeconnectai.tech</a>.</p>

      <h2>Information processed by the service</h2>
      <ul>
        <li><strong>Account information:</strong> account identifiers, name, email address, and profile image supplied through Clerk and your chosen sign-in provider, such as Google or LinkedIn.</li>
        <li><strong>Content you provide:</strong> code, room identifiers, display names, room messages, AI prompts, generated responses, and conversation titles and history.</li>
        <li><strong>Technical information:</strong> connection details, IP addresses, browser information, timestamps, and service or error logs processed by our hosting and authentication providers. Application logs can also include room activity and code content.</li>
        <li><strong>Correspondence:</strong> information you include when you email us for support or a privacy request.</li>
      </ul>

      <h2>How information is used</h2>
      <p>We process this information to sign you in, operate coding rooms, synchronize content between participants, provide AI assistance, save and retrieve conversation history, troubleshoot problems, respond to requests, and protect the service from misuse.</p>
      <p>Google sign-in is used for account authentication and basic profile information. This sign-in integration does not request access to your Gmail messages, Google Drive files, or calendars.</p>

      <h2>Rooms and shared content</h2>
      <p>Code and messages shared in a room are transmitted through our realtime server and can be seen by other people who join that room. Treat a room link or identifier as information that allows others to join; do not use rooms to share secrets, credentials, or sensitive personal information. Other participants may copy content you share.</p>

      <h2>AI assistance and service providers</h2>
      <p>The current AI assistant uses Google Gemini. When you use it, your prompts and any content you include are sent to Google to generate a response. Conversation-title generation also sends message content to Google. AI conversation history is stored in the application database.</p>
      <p>Clerk processes authentication and account information; Vercel hosts the website and application; Railway hosts the realtime server; and our database infrastructure stores account and conversation records. These providers process information needed to deliver their services and may process it in countries other than yours.</p>
      <p>Provider handling, retention, and any use of AI inputs are governed by the applicable provider terms and account configuration. Review <a href="https://policies.google.com/privacy">Google’s Privacy Policy</a>, the <a href="https://ai.google.dev/gemini-api/terms">Gemini API terms</a>, and <a href="https://clerk.com/legal/privacy">Clerk’s Privacy Policy</a>. Do not submit confidential information to the AI assistant.</p>
      <p>Information may also be disclosed when required by applicable law or necessary to investigate abuse or protect the rights and safety of the service and its users.</p>

      <h2>Cookies and local storage</h2>
      <p>Authentication providers use cookies and related browser storage to maintain sign-in sessions. Blocking or clearing them may prevent sign-in or end your session. You can manage cookies through your browser settings.</p>

      <h2>Storage and deletion</h2>
      <p>Account records and AI conversations can remain stored after you close your browser or leave a room. Closing a room is not a request to delete database records or logs. The service does not currently offer a published fixed automatic deletion schedule.</p>
      <p>You can use the conversation deletion control where available. To request access, correction, or deletion of your account information or other stored content, email <a href="mailto:dhaval@codeconnectai.tech">dhaval@codeconnectai.tech</a> from your account email. We may need to verify your identity before acting. Provider logs, backups, and legally required records may have separate retention periods, and deleting content from CodeConnect cannot remove copies held by other participants.</p>

      <h2>Your choices and security</h2>
      <p>You can choose whether to use social sign-in, share content in rooms, or submit AI requests. You can revoke a provider connection through that provider’s account settings. Depending on where you live, applicable law may give you additional rights concerning your personal information; contact us to make a request.</p>
      <p>No internet service can guarantee absolute security. Only share content you are authorized to share, and avoid uploading passwords, API keys, or other confidential information.</p>

      <h2>Policy updates</h2>
      <p>We will publish changes on this page with an updated effective date. Please review it when deciding what information to share with CodeConnect.</p>
    </article>
  );
}
