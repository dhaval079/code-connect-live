import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CodeConnect",
  description: "Terms for using CodeConnect’s collaborative coding rooms and AI assistant.",
  alternates: { canonical: "https://www.codeconnectai.tech/terms" },
};

export default function TermsPage() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="text-muted">Effective date: October 12, 2026</p>
      <p>These terms govern your use of CodeConnect at codeconnectai.tech and app.codeconnectai.tech, operated by Dhaval Rupapara. By using the service, you agree to these terms. If you do not agree, do not use the service. Questions can be sent to <a href="mailto:dhaval@codeconnectai.tech">dhaval@codeconnectai.tech</a>.</p>

      <h2>The service and your account</h2>
      <p>CodeConnect provides browser-based coding rooms, collaboration tools, and AI assistance. Features and availability may change. You must be legally able to agree to these terms or use the service with the permission of a parent or guardian where required.</p>
      <p>Provide accurate account information, keep your sign-in credentials secure, and tell us if you suspect unauthorized access. You are responsible for your activity and for deciding who receives your room links or identifiers.</p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Use the service only for lawful purposes and content you are authorized to access and share.</li>
        <li>Do not upload malware, steal credentials, harass others, infringe intellectual property rights, or share another person’s private information without permission.</li>
        <li>Do not attempt unauthorized access, disrupt other rooms, exploit the service, or evade security or usage restrictions.</li>
        <li>Do not submit passwords, API keys, or confidential personal or business information to rooms or the AI assistant.</li>
      </ul>

      <h2>Your content and collaboration</h2>
      <p>You retain your rights in the content you submit. You give CodeConnect permission to host, process, transmit, and display that content as needed to provide the features you use, including sharing room content with participants and sending AI requests to the AI provider.</p>
      <p>You are responsible for obtaining any permissions needed for that processing. Other room participants may view, modify, or copy shared content. Keep independent backups; CodeConnect is not a guaranteed archival or backup service.</p>

      <h2>AI and third-party services</h2>
      <p>AI output can be inaccurate, insecure, incomplete, or unsuitable for your purpose. Review and test generated code before using it, and check any licensing or third-party rights that apply. You remain responsible for decisions and deployments based on AI output.</p>
      <p>Authentication, hosting, and AI features depend on third-party services, including Clerk and Google Gemini. Their applicable terms also govern your use of those services. Their interruptions or changes may affect CodeConnect.</p>

      <h2>Privacy</h2>
      <p>Our <a href="/privacy">Privacy Policy</a> explains the processing of account information, shared content, and AI requests. Read it before sharing information with the service.</p>

      <h2>Availability and responsibility</h2>
      <p>To the extent permitted by applicable law, the service is provided as available without a guarantee of uninterrupted operation, error-free results, or fitness for a particular purpose. We do not guarantee that content will always be saved or recoverable.</p>
      <p>To the extent permitted by applicable law, CodeConnect and its operator are not responsible for indirect or consequential losses, including lost profits or lost data, arising from use of the service. These terms do not exclude liability or consumer rights that cannot legally be excluded.</p>

      <h2>Suspension and ending use</h2>
      <p>We may restrict or suspend access to address abuse, security issues, violations of these terms, or legal requirements. You may stop using the service at any time. For account closure or deletion requests, email <a href="mailto:dhaval@codeconnectai.tech">dhaval@codeconnectai.tech</a>; stopping use does not automatically delete stored information.</p>

      <h2>Changes and contact</h2>
      <p>We may update these terms by publishing a revised version with its effective date. Review the current terms before continuing to use the service after a change. For questions or concerns, contact <a href="mailto:dhaval@codeconnectai.tech">dhaval@codeconnectai.tech</a>.</p>
    </article>
  );
}
