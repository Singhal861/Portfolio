export const env = {
  authSecret: process.env.AUTH_SECRET || 'development-secret',
  appsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
  appsScriptSecret: process.env.GOOGLE_APPS_SCRIPT_SECRET || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000/Japanese',
  resendApiKey: process.env.RESEND_API_KEY || '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.anon_public_key || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API || '',
};

