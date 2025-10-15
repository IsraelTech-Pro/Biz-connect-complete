import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertSupportRequestSchema, insertVendorSupportRequestSchema, insertPaymentSchema, insertDiscussionSchema, insertCommentSchema, insertLikeSchema, insertQuickSaleSchema, insertQuickSaleProductSchema, insertQuickSaleBidSchema, insertMentorSchema, insertProgramSchema, insertResourceSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import "./types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

// Paystack integrations removed

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Use memory storage for Supabase uploads, disk storage for local fallback
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for resource file uploads (supports more file types)
const resourceUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for resource files
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Please upload PDF, Word, Excel, PowerPoint, text or image files.'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    try {
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
      if (!user.is_approved) {
        return res.status(403).json({
          message: 'Your account is not approved by the admin. Please contact the administrator for account activation.',
          code: 'ACCOUNT_NOT_APPROVED',
        });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ message: 'Authentication error' });
    }
  });
};

// OTP registration via Google Apps Script email (helpers)
const otpStore: Map<string, { code: string; expiresAt: number; full_name: string }> = new Map();
// Separate store for password resets to avoid clobbering registration OTPs
const resetOtpStore: Map<string, { code: string; expiresAt: number; verified?: boolean }> = new Map();

const sendEmailViaGAS = async (to: string, subject: string, htmlBody: string) => {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL is not configured');
  }
  const resp = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, htmlBody }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Email send failed: ${resp.status} ${text}`);
  }
  return resp.json().catch(() => ({}));
};

const buildOtpEmail = (fullName: string, otp: string) => {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0f172a;padding:24px;color:#e2e8f0">
      <div style="max-width:560px;margin:0 auto;background:#0b1220;border:1px solid #1e293b;border-radius:12px;overflow:hidden">
        <div style="padding:20px 24px;background:#f97316;color:#ffffff;font-weight:700;font-size:18px">BizConnect</div>
        <div style="padding:28px 24px">
          <h1 style="margin:0 0 12px;font-size:20px;color:#f8fafc">Verify your email</h1>
          <p style="margin:0 0 16px;color:#94a3b8">Hi ${fullName}, use the OTP below to complete your registration. The code expires in 10 minutes.</p>
          <div style="display:inline-block;margin:12px 0;padding:12px 20px;border-radius:10px;background:#111827;border:1px solid #374151;color:#f8fafc;font-size:24px;letter-spacing:4px;font-weight:700">${otp}</div>
          <p style="margin:16px 0 0;color:#64748b;font-size:12px">If you didn’t request this, you can safely ignore this email.</p>
        </div>
        <div style="padding:16px 24px;background:#0f172a;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} BizConnect</div>
      </div>
    </div>`;
};

const buildWelcomeEmail = (fullName: string) => {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0f172a;padding:24px;color:#e2e8f0">
      <div style="max-width:560px;margin:0 auto;background:#0b1220;border:1px solid #1e293b;border-radius:12px;overflow:hidden">
        <div style="padding:20px 24px;background:linear-gradient(90deg,#22c55e,#86efac);color:#052e16;font-weight:700;font-size:18px">Welcome to BizConnect</div>
        <div style="padding:28px 24px">
          <h1 style="margin:0 0 12px;font-size:20px;color:#f8fafc">Registration successful 🎉</h1>
          <p style="margin:0 0 10px;color:#94a3b8">Hi ${fullName}, your account has been created successfully.</p>
          <p style="margin:0 0 10px;color:#94a3b8">If admin approval is required, you’ll be notified once your account is activated.</p>
          <p style="margin:12px 0 0;color:#64748b;font-size:12px">Thanks for joining BizConnect!</p>
        </div>
        <div style="padding:16px 24px;background:#0f172a;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} BizConnect</div>
      </div>
    </div>`;
};

// Generic broadcast template (same style as OTP), used for admin messages to registrants
const buildBroadcastEmail = (subject: string, content: string) => {
  const body = String(content ?? '').replace(/\n/g, '<br/>');
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0f172a;padding:24px;color:#e2e8f0">
      <div style="max-width:560px;margin:0 auto;background:#0b1220;border:1px solid #1e293b;border-radius:12px;overflow:hidden">
        <div style="padding:20px 24px;background:#f97316;color:#ffffff;font-weight:700;font-size:18px">BizConnect</div>
        <div style="padding:28px 24px">
          <h1 style="margin:0 0 12px;font-size:20px;color:#f8fafc">${subject || 'BizConnect Update'}</h1>
          <div style="margin:0 0 16px;color:#94a3b8;line-height:1.6">${body}</div>
        </div>
        <div style="padding:16px 24px;background:#0f172a;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} BizConnect</div>
      </div>
    </div>`;
};

// Middleware to check if user is vendor
const requireVendor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Vendor access required' });
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to verify admin token
const authenticateAdminToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Admin access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid admin token' });
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    try {
      const adminUser = await storage.getAdminUserById(decoded.id);
      if (!adminUser || !adminUser.is_active) {
        return res.status(403).json({ message: 'Admin user not found or inactive' });
      }
      req.adminUser = adminUser;
      next();
    } catch (error) {
      console.error('Admin authentication error:', error);
      return res.status(500).json({ message: 'Admin authentication error' });
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Admin authentication
  app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const admin = await storage.getAdminUserByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      let valid = false;
      try {
        valid = await bcrypt.compare(password, (admin as any).password_hash || '');
      } catch {
        valid = false;
      }
      if (!valid && (admin as any).password === password) {
        valid = true;
      }

      if (!valid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: admin.id, type: 'admin', username: admin.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { id: admin.id, username: admin.username, full_name: (admin as any).full_name || admin.username }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Admin login error:', error);
      return res.status(500).json({ message: 'Failed to login', error: message });
    }
  });

  // Image upload endpoint
  app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Check if Supabase is configured
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        // Fall back to local storage - save file to disk
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'image-' + uniqueSuffix + path.extname(req.file.originalname);
        const filePath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filePath, req.file.buffer);
        const fileUrl = `/uploads/${filename}`;
        res.json({ url: fileUrl });
        return;
      }
      
      // Upload to Supabase Storage
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true // Allow overwriting files
        });
      
      if (error) {
        console.error('Supabase upload error:', error);
        // Fall back to local storage - save file to disk
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'image-' + uniqueSuffix + path.extname(req.file.originalname);
        const filePath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filePath, req.file.buffer);
        const fileUrl = `/uploads/${filename}`;
        res.json({ url: fileUrl });
        return;
      }
      
      // Get public URL
      const { data: publicData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      res.json({ url: publicData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // Program applications endpoints
  app.post('/api/programs/:programId/applications', async (req, res) => {
    try {
      const { programId } = req.params;
      const { full_name, email, message, phone } = req.body || {};
      if (!programId) {
        return res.status(400).json({ message: 'programId is required' });
      }
      if (!full_name || !email) {
        return res.status(400).json({ message: 'full_name and email are required' });
      }
      // Enforce KTU email for program applications
      const ktuEmailRegex = /^[^\s@]+@ktu\.edu\.gh$/i;
      if (!ktuEmailRegex.test(String(email))) {
        return res.status(400).json({ message: 'Only KTU students can apply. Please use your official KTU email ending with @ktu.edu.gh' });
      }
      const row = await storage.createProgramApplication({
        program_id: programId,
        full_name,
        email,
        message: message || null,
        phone: phone || null,
      });
      if (!row) {
        return res.status(500).json({ message: 'Failed to save application' });
      }
      return res.status(201).json(row);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating program application:', error);
      return res.status(500).json({ message: 'Failed to create application', error: message });
    }
  });

  app.get('/api/admin/programs/:programId/applications', authenticateAdminToken, async (req, res) => {
    try {
      const { programId } = req.params;
      if (!programId) {
        return res.status(400).json({ message: 'programId is required' });
      }
      const rows = await storage.getProgramApplicationsByProgramId(programId);
      return res.json(Array.isArray(rows) ? rows : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching program applications:', error);
      return res.status(500).json({ message: 'Failed to fetch applications', error: message });
    }
  });

  // Email selected registrants for a program
  app.post('/api/admin/programs/:programId/applications/email', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const { programId } = req.params;
      const { subject, message, emails } = req.body || {};
      if (!programId) return res.status(400).json({ message: 'programId is required' });
      if (!subject || !message) return res.status(400).json({ message: 'subject and message are required' });
      if (!Array.isArray(emails) || emails.length === 0) return res.status(400).json({ message: 'emails must be a non-empty array' });

      // Optionally, verify that provided emails belong to this program's registrants
      const registrants = await storage.getProgramApplicationsByProgramId(programId);
      const registrantEmails = new Set(registrants.map(r => (r.email || '').toLowerCase()));
      const filtered = emails.filter((e: string) => registrantEmails.has(String(e).toLowerCase()));
      const targets = filtered.length > 0 ? filtered : emails; // fallback to provided list if none matched

      for (const to of targets) {
        try {
          // Try to personalize greeting if registrant record is available
          const rec = registrants.find(r => String(r.email || '').toLowerCase() === String(to).toLowerCase());
          const name = rec?.full_name ? String(rec.full_name) : '';
          const personalized = name ? `Hi ${name},\n\n${message}` : String(message);
          const html = buildBroadcastEmail(subject, personalized);
          await sendEmailViaGAS(to, subject, html);
        } catch (err) {
          console.error('Failed sending to', to, err);
        }
      }
      return res.json({ message: 'Emails dispatched', count: targets.length });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error emailing registrants:', error);
      return res.status(500).json({ message: 'Failed to email registrants', error: msg });
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Validate KTU student email format
      const ktuEmailRegex = /^[^\s@]+@ktu\.edu\.gh$/;
      if (!ktuEmailRegex.test(userData.email)) {
        return res.status(400).json({ message: 'Only KTU students can register. Please use your official KTU email ending with @ktu.edu.gh' });
      }
      // Require verified OTP before creating the account
      const otpRecord = otpStore.get(userData.email.toLowerCase());
      if (!otpRecord || !('verified' in otpRecord) || !(otpRecord as any).verified || Date.now() > otpRecord.expiresAt) {
        return res.status(400).json({ message: 'Please verify your email with the OTP before completing signup.' });
      }
      
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Since new users need admin approval, don't create a token or log them in immediately
      // Clear OTP record after successful registration
      otpStore.delete(user.email.toLowerCase());
      res.json({ 
        user: { ...user, password: undefined }, 
        message: 'Account created successfully! Your account is pending admin approval. You will be able to log in once an administrator activates your account.',
        requiresApproval: true
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid user data', error: message });
    }
  });

  // OTP Registration endpoints
  app.post('/api/auth/register-otp/request', async (req: Request, res: Response) => {
    try {
      const { full_name, email } = req.body || {};
      if (!full_name || !email) {
        return res.status(400).json({ message: 'full_name and email are required' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      otpStore.set(email.toLowerCase(), { code, expiresAt, full_name });
      try {
        await sendEmailViaGAS(email, 'Your BizConnect OTP Code', buildOtpEmail(full_name, code));
        return res.json({ ok: true, message: 'OTP sent to email' });
      } catch (sendErr) {
        console.error('Email send failed, falling back. Error:', sendErr);
        if (process.env.NODE_ENV !== 'production') {
          // For development, expose OTP to allow testing without email delivery
          return res.json({ ok: true, message: 'OTP generated (dev mode). Email send failed.', debugOtp: code });
        }
        return res.status(502).json({ message: 'Failed to send OTP email. Please try again later.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('OTP request error:', error);
      res.status(500).json({ message: 'Failed to send OTP', error: message });
    }
  });

  app.post('/api/auth/register-otp/verify', async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body || {};
      if (!email || !otp) {
        return res.status(400).json({ message: 'email and otp are required' });
      }
      const record = otpStore.get(email.toLowerCase());
      if (!record || record.code !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (Date.now() > record.expiresAt) {
        otpStore.delete(email.toLowerCase());
        return res.status(400).json({ message: 'OTP expired' });
      }
      // Mark OTP as verified (extend validity window for completing registration)
      (record as any).verified = true;
      record.expiresAt = Date.now() + 10 * 60 * 1000; // give 10 more minutes to finish signup
      otpStore.set(email.toLowerCase(), record);
      res.json({ ok: true, message: 'OTP verified. You can now complete your registration.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('OTP verify error:', error);
      res.status(500).json({ message: 'Failed to verify OTP', error: message });
    }
  });

  // Password Reset via OTP
  app.post('/api/auth/password-reset/request', async (req: Request, res: Response) => {
    try {
      const { email } = req.body || {};
      if (!email) {
        return res.status(400).json({ message: 'email is required' });
      }
      const emailStr = String(email).toLowerCase();
      const user = await storage.getUserByEmail(emailStr);
      if (!user) {
        return res.status(404).json({ message: 'No account found for this email' });
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      resetOtpStore.set(emailStr, { code, expiresAt });
      try {
        const html = buildOtpEmail(user.full_name || 'User', code);
        await sendEmailViaGAS(user.email, 'Your BizConnect Password Reset Code', html);
        return res.json({ ok: true, message: 'Password reset code sent. Check your email (and Junk/Spam folder).' });
      } catch (sendErr) {
        console.error('Password reset email failed:', sendErr);
        if (process.env.NODE_ENV !== 'production') {
          return res.json({ ok: true, message: 'Dev mode: email failed, returning code.', debugOtp: code });
        }
        return res.status(502).json({ message: 'Failed to send reset code. Please try again later.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Failed to start password reset', error: message });
    }
  });

  app.post('/api/auth/password-reset/verify', async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body || {};
      if (!email || !otp) {
        return res.status(400).json({ message: 'email and otp are required' });
      }
      const emailStr = String(email).toLowerCase();
      const record = resetOtpStore.get(emailStr);
      if (!record || record.code !== String(otp)) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (Date.now() > record.expiresAt) {
        resetOtpStore.delete(emailStr);
        return res.status(400).json({ message: 'OTP expired' });
      }
      record.verified = true;
      record.expiresAt = Date.now() + 10 * 60 * 1000;
      resetOtpStore.set(emailStr, record);
      res.json({ ok: true, message: 'OTP verified. You can now reset your password.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Password reset verify error:', error);
      res.status(500).json({ message: 'Failed to verify OTP', error: message });
    }
  });

  app.post('/api/auth/password-reset/complete', async (req: Request, res: Response) => {
    try {
      const { email, new_password } = req.body || {};
      if (!email || !new_password) {
        return res.status(400).json({ message: 'email and new_password are required' });
      }
      const emailStr = String(email).toLowerCase();
      const record = resetOtpStore.get(emailStr);
      if (!record || !record.verified || Date.now() > record.expiresAt) {
        return res.status(400).json({ message: 'OTP not verified or expired' });
      }
      const user = await storage.getUserByEmail(emailStr);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const hashed = await bcrypt.hash(String(new_password), 10);
      await storage.updateUser(user.id, { password: hashed });
      resetOtpStore.delete(emailStr);
      res.json({ ok: true, message: 'Password has been reset successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Password reset complete error:', error);
      res.status(500).json({ message: 'Failed to reset password', error: message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format. Please use a valid email address (e.g., user@example.com)' });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      if (!user.is_approved) {
        return res.status(403).json({
          message: 'Your account is not approved by the admin. Please contact the administrator for account activation.',
          code: 'ACCOUNT_NOT_APPROVED',
        });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: message });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to get user', error: message });
    }
  });

  // User update route
  app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
      console.log('User update request received:', req.body);
      console.log('User ID:', req.params.id);
      console.log('Auth user:', req.user);
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Check if user is updating their own profile or is admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized to update this user' });
      }
      
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Process the update data
      const updateData = {
        ...req.body,
        updated_at: new Date(),
        // Remove password field if it exists
        password: undefined,
        // Ensure JSONB fields are properly formatted
        profile_picture: req.body.profile_picture || null,
        banner_url: req.body.banner_url || null,
      };
      
      console.log('Processed update data:', updateData);
      
      const updatedUser = await storage.updateUser(req.params.id, updateData);
      console.log('User updated successfully:', updatedUser);
      
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('User update error:', error);
      res.status(500).json({ message: 'Failed to update user', error: message });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, vendor } = req.query;
      let products;
      
      console.log('Products request query:', req.query);
      
      if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else if (vendor) {
        console.log('Filtering products by vendor:', vendor);
        products = await storage.getProductsByVendor(vendor as string);
        console.log('Vendor products found:', products.length);
      } else {
        products = await storage.getProducts();
      }
      
      // Ensure we always return an array
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to get products', error: message });
    }
  });

  // Enhanced filter endpoints
  app.get('/api/products/filter/flash-sale', async (req, res) => {
    try {
      const products = await storage.getFlashSaleProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching flash sale products:', error);
      res.status(500).json({ message: 'Failed to get flash sale products', error: message });
    }
  });

  app.get('/api/products/filter/clearance', async (req, res) => {
    try {
      const products = await storage.getClearanceProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching clearance products:', error);
      res.status(500).json({ message: 'Failed to get clearance products', error: message });
    }
  });

  app.get('/api/products/filter/trending', async (req, res) => {
    try {
      const products = await storage.getTrendingProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching trending products:', error);
      res.status(500).json({ message: 'Failed to get trending products', error: message });
    }
  });

  app.get('/api/products/filter/new-this-week', async (req, res) => {
    try {
      const products = await storage.getNewThisWeekProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching new this week products:', error);
      res.status(500).json({ message: 'Failed to get new this week products', error: message });
    }
  });

  app.get('/api/products/filter/top-selling', async (req, res) => {
    try {
      const products = await storage.getTopSellingProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching top selling products:', error);
      res.status(500).json({ message: 'Failed to get top selling products', error: message });
    }
  });

  app.get('/api/products/filter/featured', async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching featured products:', error);
      res.status(500).json({ message: 'Failed to get featured products', error: message });
    }
  });

  app.get('/api/products/filter/hot-deals', async (req, res) => {
    try {
      const products = await storage.getHotDealsProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching hot deals products:', error);
      res.status(500).json({ message: 'Failed to get hot deals products', error: message });
    }
  });

  app.get('/api/products/filter/dont-miss', async (req, res) => {
    try {
      const products = await storage.getDontMissProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching dont miss products:', error);
      res.status(500).json({ message: 'Failed to get dont miss products', error: message });
    }
  });

  // Advanced filter endpoint
  app.post('/api/products/filter', async (req, res) => {
    try {
      const filters = req.body;
      const products = await storage.getProductsByFilter(filters);
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error filtering products:', error);
      res.status(500).json({ message: 'Failed to filter products', error: message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Failed to get product', error: message });
    }
  });

  app.post('/api/products', authenticateToken, requireVendor, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      console.log('Received product data:', req.body);
      console.log('Product images received:', req.body.product_images);
      
      // Process the data before validation
      const processedData = {
        ...req.body,
        vendor_id: req.user.id,
        // Convert date string to Date object if present
        flash_sale_end_date: null, // Vendors cannot set flash sale dates
        // Ensure numbers are properly parsed
        stock_quantity: parseInt(req.body.stock_quantity) || 0,
        discount_percentage: parseInt(req.body.discount_percentage) || 0,
        low_stock_threshold: parseInt(req.body.low_stock_threshold) || 10,
        // Convert decimal fields to strings if they exist
        original_price: req.body.original_price ? req.body.original_price.toString() : null,
        weight: req.body.weight ? req.body.weight.toString() : null,
        // Promotional flags are admin-only, set to false for vendors
        is_flash_sale: false,
        is_clearance: false,
        is_trending: false,
        is_new_this_week: false,
        is_top_selling: false,
        is_featured: false,
        is_hot_deal: false,
        is_dont_miss: false,
        is_featured_vendor: false,
        // Handle nullable fields properly
        brand: req.body.brand || null,
        sku: req.body.sku || null,
        dimensions: req.body.dimensions || null,
        // SEO fields are admin-only, set to null for vendors
        meta_title: null,
        meta_description: null,
        search_keywords: [], // Empty array for vendors
        // Ensure arrays are properly handled
        tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : []),
        product_images: Array.isArray(req.body.product_images) ? req.body.product_images : [],
        // Remove any old images field that might be present
        images: undefined
      };
      
      console.log('Processed product data:', processedData);
      
      const productData = insertProductSchema.parse(processedData);
      
      console.log('Parsed product data:', productData);
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Product creation error:', error);
      res.status(400).json({ message: 'Invalid product data', error: message });
    }
  });

  app.put('/api/products/:id', authenticateToken, requireVendor, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const product = await storage.getProduct(req.params.id);
      if (!product || product.vendor_id !== req.user.id) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      console.log('Updating product with data:', req.body);
      console.log('Product images for update:', req.body.product_images);
      
      // Validate and process the request body - vendors cannot modify promotional/SEO fields
      const productData = {
        ...req.body,
        price: req.body.price.toString(), // Ensure price is string
        stock_quantity: parseInt(req.body.stock_quantity) || 0, // Ensure stock_quantity is number
        weight: req.body.weight?.toString() || null, // Ensure weight is string or null
        // Ensure numbers are properly parsed
        discount_percentage: parseInt(req.body.discount_percentage) || 0,
        low_stock_threshold: parseInt(req.body.low_stock_threshold) || 10,
        // Convert decimal fields to strings if they exist
        original_price: req.body.original_price ? req.body.original_price.toString() : null,
        // Handle nullable fields properly
        brand: req.body.brand || null,
        sku: req.body.sku || null,
        dimensions: req.body.dimensions || null,
        // Ensure arrays are properly handled
        tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? req.body.tags.split(',').map((t: string) => t.trim()) : []),
        product_images: Array.isArray(req.body.product_images) ? req.body.product_images : [],
        updated_at: new Date(),
        // Remove promotional, SEO, and flash sale fields - vendors cannot modify these
        flash_sale_end_date: undefined,
        is_flash_sale: undefined,
        is_clearance: undefined,
        is_trending: undefined,
        is_new_this_week: undefined,
        is_top_selling: undefined,
        is_featured: undefined,
        is_hot_deal: undefined,
        is_dont_miss: undefined,
        is_featured_vendor: undefined,
        meta_title: undefined,
        meta_description: undefined,
        search_keywords: undefined,
        // Remove any old images field that might be present
        images: undefined
      };
      
      const updatedProduct = await storage.updateProduct(req.params.id, productData);
      res.json(updatedProduct);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Product update error:', error);
      res.status(400).json({ message: 'Failed to update product', error: message });
    }
  });

  app.delete('/api/products/:id', authenticateToken, requireVendor, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const product = await storage.getProduct(req.params.id);
      if (!product || product.vendor_id !== req.user.id) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      await storage.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product', error: message });
    }
  });

  // Order routes
  app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { vendor } = req.query;
      let orders;
      
      if (vendor && req.user.role === 'vendor' && req.user.id === vendor) {
        // Vendor requesting their own orders
        orders = await storage.getOrdersByVendor(vendor as string);
      } else if (req.user.role === 'admin') {
        orders = await storage.getOrders();
      } else if (req.user.role === 'vendor') {
        orders = await storage.getOrdersByVendor(req.user.id);
      } else {
        orders = await storage.getOrdersByBuyer(req.user.id);
      }
      
      // Add buyer information for vendor orders
      if (req.user.role === 'vendor' || vendor) {
        const ordersWithBuyers = await Promise.all(
          orders.map(async (order) => {
            if (order.buyer_id) {
              const buyer = await storage.getUser(order.buyer_id);
              return {
                ...order,
                buyer_name: buyer?.full_name || 'N/A',
                buyer_email: buyer?.email || 'N/A',
                buyer_phone: buyer?.phone || 'N/A'
              };
            }
            return order;
          })
        );
        res.json(ordersWithBuyers);
      } else {
        res.json(orders);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error in orders API:', error);
      res.status(500).json({ message: 'Failed to get orders', error: message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Order creation error:', error);
      res.status(400).json({ message: 'Invalid order data', error: message });
    }
  });

  // Vendor payout function removed (Paystack integration removed)

  app.put('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Only vendor can update their orders or admin can update any order
      if (!req.user || (req.user.role !== 'admin' && order.vendor_id !== req.user.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedOrder = await storage.updateOrder(req.params.id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update order' });
    }
  });

  // Vendor routes
  app.get('/api/vendors', async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors.map(v => ({ ...v, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to get vendors' });
    }
  });

  // Vendor payments endpoint
  app.get('/api/vendors/:id/payments', authenticateToken, async (req, res) => {
    try {
      // Only vendor can see their own payments or admin can see any vendor payments
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.params.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const payments = await storage.getPaymentsByVendor(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      res.status(500).json({ message: 'Failed to get vendor payments' });
    }
  });

  // Vendor payouts endpoint
  app.get('/api/vendors/:id/payouts', authenticateToken, async (req, res) => {
    try {
      // Only vendor can see their own payouts or admin can see any vendor payouts
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.params.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const payouts = await storage.getPayoutsByVendor(req.params.id);
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching vendor payouts:', error);
      res.status(500).json({ message: 'Failed to get vendor payouts' });
    }
  });

  app.get('/api/vendors/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const vendors = await storage.getPendingVendors();
      res.json(vendors.map(v => ({ ...v, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to get pending vendors' });
    }
  });

  app.post('/api/vendors/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const vendor = await storage.approveVendor(req.params.id);
      res.json({ ...vendor, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve vendor' });
    }
  });

  app.get('/api/vendors/:id/stats', authenticateToken, async (req, res) => {
    try {
      // Only vendor can see their own stats or admin can see any vendor stats
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.params.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const stats = await storage.getVendorStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get vendor stats' });
    }
  });

  // Search endpoint for real-time search
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 3) {
        return res.json({ products: [], vendors: [] });
      }

      // Search products and vendors
      const [products, vendors] = await Promise.all([
        storage.searchProducts(query),
        storage.searchVendors(query)
      ]);

      res.json({
        products: products || [],
        vendors: vendors?.map(v => ({ ...v, password: undefined })) || []
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Search failed' });
    }
  });

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Don't return password
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Admin routes - moved to dedicated admin endpoints below

  // Admin settings moved to dedicated admin endpoints below

  // Paystack public key endpoint removed

  // Direct SQL database update endpoint
  app.post('/api/database/alter-tables', async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const dbUrl = process.env.DATABASE_URL;
      const supabaseUrl = process.env.SUPABASE_URL || (dbUrl ? `https://${dbUrl.split('@')[1].split('/')[0]}` : undefined);
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ status: false, message: 'Supabase configuration is missing' });
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log('Adding product_id columns to payments and payouts tables...');
      
      // Add product_id column to payments table
      const { error: paymentsError } = await supabase.rpc('sql', {
        query: `
          ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS product_id uuid;
          ALTER TABLE public.payouts ADD COLUMN IF NOT EXISTS product_id uuid;
        `
      });

      if (paymentsError) {
        console.error('Database alter error:', paymentsError);
        return res.status(500).json({ 
          status: false, 
          message: 'Failed to alter database tables',
          error: paymentsError.message 
        });
      }

      // Update existing payment with product_id
      const { error: updateError } = await supabase
        .from('payments')
        .update({ product_id: '1838f031-2cf6-42ae-a57a-a3bba6aeb04b' })
        .eq('reference', 'VH_1752117543289_sfa6ows83');

      if (updateError) {
        console.error('Payment update error:', updateError);
      }

      res.json({ 
        status: true, 
        message: 'Database tables updated successfully with product_id columns',
        data: { paymentsUpdated: true, payoutsUpdated: true, existingPaymentUpdated: !updateError }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Database alter error:', error);
      res.status(500).json({ 
        status: false, 
        message: 'Failed to alter database tables',
        error: message
      });
    }
  });

  // Test endpoint to create payment directly (bypassing order creation)
  app.post('/api/payments/test-create', authenticateToken, async (req, res) => {
    try {
      const { reference, amount, currency, payment_method, vendor_id, buyer_id, status } = req.body;
      
      if (!reference || !amount || !vendor_id || !buyer_id) {
        return res.status(400).json({ 
          status: false, 
          message: 'Missing required fields: reference, amount, vendor_id, buyer_id' 
        });
      }

      // Create test order for payment testing
      const orderData = {
        buyer_id,
        vendor_id,
        product_id: '1838f031-2cf6-42ae-a57a-a3bba6aeb04b',
        quantity: 1,
        total_amount: amount.toString(),
        status: 'pending',
        shipping_address: 'Test Address',
        phone: '233551035300',
        notes: 'Test payment order'
      };
      
      const order = await storage.createOrder(orderData);
      
      // Create payment record
      const paymentData = {
        reference,
        order_id: order.id,
        vendor_id,
        buyer_id,
        amount: amount.toString(),
        currency: currency || 'GHS',
        payment_method: payment_method || 'card',
        status: status || 'pending'
      };

      const payment = await storage.createPayment(paymentData);
      res.json({ 
        status: true, 
        message: 'Payment created successfully', 
        data: payment 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Test payment creation error:', error);
      res.status(500).json({ 
        status: false, 
        message: 'Failed to create test payment',
        error: message 
      });
    }
  });

  // Create payment endpoint
  app.post('/api/payments', authenticateToken, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ message: 'Failed to create payment' });
    }
  });

  // Test endpoint to create a payment record for testing callback
  app.post('/api/payments/create-test', async (req, res) => {
    try {
      const { reference, amount, order_id } = req.body;
      
      const testPayment = {
        reference: reference || `TEST_REF_${Date.now()}`,
        amount: amount || '10.00',
        payment_method: 'mobile_money',
        vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
        buyer_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
        order_id: order_id || '6fac5f0f-9522-49c2-a131-60bf330545d5'
      };
      
      const payment = await storage.createPayment(testPayment);
      res.json({ status: true, payment });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating test payment:', error);
      res.status(500).json({ status: false, message: 'Failed to create test payment', error: message });
    }
  });

  // Vendor stats route
  app.get('/api/vendor/stats/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Only allow vendors to view their own stats or admins to view any stats
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const stats = await storage.getVendorStats(req.params.id);
      res.json(stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching vendor stats:', error);
      res.status(500).json({ message: 'Failed to get vendor stats', error: message });
    }
  });

  // Payout routes
  app.get('/api/payouts', authenticateToken, async (req, res) => {
    try {
      let payouts;
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      if (req.user.role === 'admin') {
        payouts = await storage.getPayouts();
      } else if (req.user.role === 'vendor') {
        payouts = await storage.getPayoutsByVendor(req.user.id);
      } else {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(payouts);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Failed to get payouts', error: message });
    }
  });

  // Payout transfer endpoint removed (Paystack integration removed)

  // Support request routes
  app.post('/api/support-requests', async (req, res) => {
    try {
      const supportRequest = insertSupportRequestSchema.parse(req.body);
      const newSupportRequest = await storage.createSupportRequest(supportRequest);
      res.json(newSupportRequest);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  });

  app.post('/api/vendor-support-requests', async (req, res) => {
    try {
      const vendorSupportRequest = insertVendorSupportRequestSchema.parse(req.body);
      const newVendorSupportRequest = await storage.createVendorSupportRequest(vendorSupportRequest);
      res.json(newVendorSupportRequest);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  });

  // Add comprehensive products endpoint
  app.post('/api/add-comprehensive-products', async (req, res) => {
    try {
      const { addComprehensiveProducts } = await import('./add-comprehensive-products');
      const result = await addComprehensiveProducts();
      res.json({ 
        message: `Added ${result.success} products successfully, ${result.failed} failed`,
        result 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error adding comprehensive products:', error);
      res.status(500).json({ message: 'Failed to add comprehensive products', error: message });
    }
  });

  // Vendor stats endpoint
  app.get('/api/vendor/stats/:vendorId', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const stats = await storage.getVendorStats(vendorId);
      res.json(stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching vendor stats:', error);
      res.status(500).json({ message: 'Failed to fetch vendor stats', error: message });
    }
  });

  // Vendor orders endpoint
  app.get('/api/orders/vendor/:vendorId', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const orders = await storage.getOrdersByVendor(vendorId);
      
      // Fetch buyer information for each order
      const ordersWithBuyers = await Promise.all(
        orders.map(async (order) => {
          if (order.buyer_id) {
            const buyer = await storage.getUser(order.buyer_id);
            return {
              ...order,
              buyer_name: buyer?.full_name || 'N/A',
              buyer_email: buyer?.email || 'N/A',
              buyer_phone: buyer?.phone || 'N/A'
            };
          }
          return order;
        })
      );
      
      res.json(ordersWithBuyers);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      res.status(500).json({ message: 'Failed to fetch vendor orders' });
    }
  });

  // Dashboard API routes
  
  // Sync data
  app.post('/api/sync/all', requireAdmin, async (req, res) => {
    try {
      const { databaseSync } = await import('./database-sync');
      await databaseSync.syncAll();
      res.json({ success: true, message: 'All data synced successfully' });
    } catch (error) {
      console.error('Full sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to sync all data',
        error: (error instanceof Error ? error.message : String(error)) 
      });
    }
  });

  // Manual sync route for testing without admin requirement
  app.post('/api/sync/manual', authenticateToken, async (req, res) => {
    try {
      console.log('Starting manual sync...');
      
      res.json({ 
        success: true, 
        message: 'Manual sync completed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Manual sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Manual sync failed',
        error: (error instanceof Error ? error.message : String(error)) 
      });
    }
  });

  // Vendor Dashboard API - Using existing payments table
  app.get('/api/dashboard/vendor/transactions', authenticateToken, requireVendor, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const user = req.user as any;
      const db = storage as any;
      let transactions = [];
      
      // Query the payments table directly with JOIN to get buyer and order info
      if (db.query) {
        try {
          const result = await db.query(`
            SELECT 
              p.id,
              p.reference,
              p.amount,
              p.currency,
              p.payment_method as channel,
              p.status,
              p.paid_at,
              p.created_at,
              p.paystack_reference,
              p.gateway_response,
              p.mobile_number,
              p.network_provider,
              u.full_name as buyer_name,
              u.email as buyer_email,
              u.phone as buyer_phone,
              u.whatsapp as buyer_whatsapp,
              o.id as order_id,
              pr.title as item
            FROM payments p
            LEFT JOIN users u ON p.buyer_id = u.id
            LEFT JOIN orders o ON p.order_id = o.id
            LEFT JOIN products pr ON o.product_id = pr.id
            WHERE p.vendor_id = $1
            ORDER BY p.paid_at DESC, p.created_at DESC
            LIMIT 100
          `, [user.id]);
          
          transactions = result.rows || [];
          console.log(`Found ${transactions.length} payments for vendor ${user.id}`);
        } catch (queryError) {
          const qMessage = queryError instanceof Error ? queryError.message : String(queryError);
          console.log('Database query failed, falling back to storage methods:', qMessage);
        }
      }
      
      // If direct query failed, fall back to storage methods
      if (transactions.length === 0) {
        console.log('Using storage methods for vendor transactions');
        const payments = await storage.getPaymentsByVendor(user.id);
        
        transactions = await Promise.all(payments.map(async (payment) => {
          const buyer = await storage.getUser(payment.buyer_id);
          const order = await storage.getOrder(payment.order_id);
          const product = order ? await storage.getProduct(order.product_id) : null;
          
          return {
            id: payment.id,
            reference: payment.reference,
            amount: payment.amount,
            currency: payment.currency,
            item: product?.title || 'Product Purchase',
            status: payment.status,
            paid_at: payment.paid_at,
            buyer_name: buyer?.full_name,
            buyer_email: buyer?.email,
            buyer_phone: buyer?.phone,
            buyer_whatsapp: buyer?.whatsapp,
            channel: payment.payment_method,
            created_at: payment.created_at,
            paystack_reference: payment.paystack_reference,
            gateway_response: payment.gateway_response,
            mobile_number: payment.mobile_number,
            network_provider: payment.network_provider
          };
        }));
      }

      res.json(transactions);
    } catch (error) {
      console.error('Error fetching vendor transactions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch transactions' 
      });
    }
  });

  app.get('/api/dashboard/vendor/payouts', authenticateToken, requireVendor, async (req, res) => {
    try {
      const user = req.user as any;
      const db = storage as any;
      let payouts = [];
      
      // Query the payouts table directly
      if (db.query) {
        try {
          const result = await db.query(`
            SELECT 
              p.id,
              p.amount,
              p.status,
              p.momo_number,
              p.transaction_id,
              p.created_at,
              p.updated_at,
              'GHS' as currency,
              p.transaction_id as reference
            FROM payouts p
            WHERE p.vendor_id = $1
            ORDER BY p.created_at DESC
            LIMIT 100
          `, [user.id]);
          
          payouts = result.rows || [];
          console.log(`Found ${payouts.length} payouts for vendor ${user.id}`);
        } catch (queryError) {
          const qMessage = queryError instanceof Error ? queryError.message : String(queryError);
          console.log('Database query failed, falling back to storage methods:', qMessage);
        }
      }
      
      // If direct query failed, fall back to storage methods
      if (payouts.length === 0) {
        console.log('Using storage methods for vendor payouts');
        payouts = await storage.getPayoutsByVendor(user.id);
      }
      
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching vendor payouts:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch payouts' 
      });
    }
  });

  app.get('/api/dashboard/vendor/stats', authenticateToken, requireVendor, async (req, res) => {
    try {
      const user = req.user as any;
      const db = storage as any;
      let stats: any = {};
      
      // Try to get enhanced stats from database
      if (db.query) {
        try {
          const result = await db.query(`
            SELECT 
              -- Payment stats from payments table
              COUNT(CASE WHEN p.status = 'success' THEN 1 END) as successful_transactions,
              COALESCE(SUM(CASE WHEN p.status = 'success' THEN p.amount END), 0) as total_sales,
              COUNT(p.id) as total_transactions,
              COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_transactions,
              
              -- Recent activity
              COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as transactions_last_30_days,
              COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as transactions_last_7_days,
              COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as transactions_today
              
            FROM payments p
            WHERE p.vendor_id = $1
          `, [user.id]);
          
          const payoutResult = await db.query(`
            SELECT 
              COUNT(*) as total_payouts,
              COALESCE(SUM(CASE WHEN po.status = 'success' THEN po.amount END), 0) as total_paid,
              COALESCE(SUM(CASE WHEN po.status = 'pending' THEN po.amount END), 0) as pending_amount,
              COUNT(CASE WHEN po.status = 'success' THEN 1 END) as successful_payouts,
              COUNT(CASE WHEN po.status = 'pending' THEN 1 END) as pending_payouts
            FROM payouts po
            WHERE po.vendor_id = $1
          `, [user.id]);
          
          const orderResult = await db.query(`
            SELECT 
              COUNT(*) as total_orders,
              COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
              COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders
            FROM orders o
            WHERE o.vendor_id = $1
          `, [user.id]);
          
          const transactionStats = result.rows[0] || {};
          const payoutStats = payoutResult.rows[0] || {};
          const orderStats = orderResult.rows[0] || {};
          
          stats = {
            total_orders: parseInt(orderStats.total_orders || 0),
            total_sales: parseFloat(transactionStats.total_sales || 0),
            successful_orders: parseInt(transactionStats.successful_transactions || 0),
            pending_orders: parseInt(transactionStats.pending_transactions || 0),
            completed_orders: parseInt(orderStats.completed_orders || 0),
            total_payouts: parseInt(payoutStats.total_payouts || 0),
            total_paid: parseFloat(payoutStats.total_paid || 0),
            pending_amount: parseFloat(payoutStats.pending_amount || 0),
            successful_payouts: parseInt(payoutStats.successful_payouts || 0),
            pending_payouts: parseInt(payoutStats.pending_payouts || 0),
            current_balance: parseFloat(transactionStats.total_sales || 0) - parseFloat(payoutStats.total_paid || 0),
            currency: 'GHS',
            transactions_last_30_days: parseInt(transactionStats.transactions_last_30_days || 0),
            transactions_last_7_days: parseInt(transactionStats.transactions_last_7_days || 0),
            transactions_today: parseInt(transactionStats.transactions_today || 0)
          };
          
          console.log(`Enhanced stats for vendor ${user.id}:`, stats);
        } catch (queryError) {
          console.log('Database query failed, falling back to regular stats');
        }
      }
      
      // If no enhanced stats found, fall back to regular stats
      if (Object.keys(stats).length === 0) {
        console.log('Falling back to regular stats calculation');
        const payments = await storage.getPaymentsByVendor(user.id);
        const orders = await storage.getOrdersByVendor(user.id);
        const payouts = await storage.getPayoutsByVendor(user.id);
        
        stats = {
          total_orders: orders.length,
          total_sales: payments
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0),
          successful_orders: payments.filter(p => p.status === 'success').length,
          pending_orders: payments.filter(p => p.status === 'pending').length,
          total_payouts: payouts.length,
          total_paid: payouts
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0),
          pending_amount: payouts
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0),
          current_balance: 0,
          currency: 'GHS'
        };
      }
      
      // Add product count (always available)
      const products = await storage.getProductsByVendor(user.id);
      stats.total_products = products.length;

      res.json(stats);
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch vendor stats' 
      });
    }
  });

  // Vendor payments endpoint
  app.get('/api/vendors/:vendorId/payments', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const user = req.user;
      
      // Check if user can access this vendor's payments
      if (user.role !== 'admin' && user.id !== vendorId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const payments = await storage.getPaymentsByVendor(vendorId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch vendor payments' 
      });
    }
  });

  // Vendor payouts endpoint
  app.get('/api/vendors/:vendorId/payouts', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const user = req.user;
      
      // Check if user can access this vendor's payouts
      if (user.role !== 'admin' && user.id !== vendorId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const payouts = await storage.getPayoutsByVendor(vendorId);
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching vendor payouts:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch vendor payouts' 
      });
    }
  });

  // Public vendors/businesses endpoint with real product counts
  app.get('/api/vendors', async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const allProducts = await storage.getProducts();
      
      // Filter for approved vendors only
      const vendors = allUsers.filter(u => u.role === 'vendor' && u.is_approved);
      
      // Add real product counts to each vendor
      const vendorsWithCounts = vendors.map(vendor => {
        const vendorProducts = allProducts.filter(p => p.vendor_id === vendor.id);
        return {
          ...vendor,
          products_count: vendorProducts.length,
          recent_products: vendorProducts.slice(0, 3), // Latest 3 products for preview
          // Remove sensitive data
          password: undefined,
          paystack_subaccount: undefined,
          momo_number: undefined
        };
      });
      
      res.json(vendorsWithCounts);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ message: 'Failed to get vendors' });
    }
  });

  // Mentors endpoint - public
  app.get('/api/mentors', async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      res.status(500).json({ message: 'Failed to get mentors' });
    }
  });

  // Programs endpoint - public
  app.get('/api/programs', async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({ message: 'Failed to get programs' });
    }
  });

  // Platform statistics endpoint - public
  app.get('/api/platform/stats', async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const allProducts = await storage.getProducts();
      const allOrders = await storage.getOrders();
      // Get real counts from database - handle empty tables gracefully
      let allMentors: any[] = [];
      let allPrograms: any[] = [];
      
      try {
        allMentors = await storage.getMentors();
        allPrograms = await storage.getPrograms();
      } catch (error) {
        console.log('Mentors/Programs tables empty or not accessible');
      }
      
      const vendors = allUsers.filter(u => u.role === 'vendor');
      const activeBusinesses = vendors.filter(v => v.is_approved);
      const completedOrders = allOrders.filter(o => o.status === 'completed');
      
      // Get category breakdown with real counts from database
      const categoryStats = activeBusinesses.reduce((acc: any, vendor: any) => {
        const category = vendor.business_category || 'services';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        activeBusinesses: activeBusinesses.length,
        studentEntrepreneurs: vendors.length,
        totalProducts: allProducts.length,
        completedOrders: completedOrders.length,
        activeMentors: Array.isArray(allMentors) ? allMentors.filter(m => m.status === 'active').length : 0,
        successStories: completedOrders.length,
        categoryBreakdown: categoryStats,
        pendingApprovals: vendors.filter(v => !v.is_approved).length
      };

      res.json(stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Platform stats error:', error);
      res.status(500).json({ message: 'Failed to fetch platform statistics', error: message });
    }
  });

  // Admin API endpoints with real data
  app.get('/api/admin/stats', authenticateAdminToken, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const allProducts = await storage.getProducts();
      const allOrders = await storage.getOrders();
      const allMentors = await storage.getMentors();
      const allPrograms = await storage.getPrograms();
      const allResources = await storage.getResources();
      
      const vendors = allUsers.filter(u => u.role === 'vendor');
      const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);
      
      const pendingApprovals = vendors.filter(v => !v.is_approved).length;
      const activePrograms = allPrograms.filter(p => p.status === 'active').length;
      const activeMentors = allMentors.filter(m => m.status === 'active').length;
      
      const stats = {
        totalUsers: allUsers.length,
        totalVendors: vendors.length,
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalRevenue: totalRevenue,
        pendingApprovals: pendingApprovals,
        activePrograms: activePrograms,
        totalMentors: activeMentors,
        totalResources: allResources.length,
        publishedResources: allResources.filter(r => r.status === 'published').length
      };
      
      res.json(stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats', error: message });
    }
  });

  app.get('/api/admin/businesses', authenticateAdminToken, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const vendors = allUsers.filter(u => u.role === 'vendor');
      
      const businessesData = await Promise.all(
        vendors.map(async (vendor) => {
          const products = await storage.getProductsByVendor(vendor.id);
          const orders = await storage.getOrdersByVendor(vendor.id);
          const totalSales = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);
          
          return {
            id: vendor.id,
            business_name: vendor.business_name || vendor.full_name,
            full_name: vendor.full_name,
            email: vendor.email,
            is_approved: vendor.is_approved || false,
            created_at: vendor.created_at,
            total_products: products.length,
            total_sales: totalSales
          };
        })
      );
      
      res.json(businessesData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching businesses:', error);
      res.status(500).json({ message: 'Failed to fetch businesses', error: message });
    }
  });

  // Admin: Pending vendors (businesses not yet approved)
  app.get('/api/admin/vendors/pending', authenticateAdminToken, async (_req: Request, res: Response) => {
    try {
      const allUsers = await storage.getUsers();
      const pending = allUsers.filter(u => u.role === 'vendor' && !u.is_approved);
      res.json(pending.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
      res.status(500).json({ message: 'Failed to fetch pending vendors' });
    }
  });

  // Admin: Approve/Reject a business (toggle is_approved)
  app.patch('/api/admin/businesses/:id/status', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const { approved } = req.body as { approved: boolean };
      const updated = await storage.updateUser(req.params.id, { is_approved: !!approved });
      res.json({ ...updated, password: undefined });
    } catch (error) {
      console.error('Error updating business status:', error);
      res.status(500).json({ message: 'Failed to update business status' });
    }
  });

  // Admin: Approve convenience endpoint
  app.post('/api/admin/businesses/:id/approve', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateUser(req.params.id, { is_approved: true });
      res.json({ ...updated, password: undefined });
    } catch (error) {
      console.error('Error approving business:', error);
      res.status(500).json({ message: 'Failed to approve business' });
    }
  });

  // Admin: Delete business (delete vendor user)
  app.delete('/api/admin/businesses/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ message: 'Business deleted successfully' });
    } catch (error) {
      console.error('Error deleting business:', error);
      res.status(500).json({ message: 'Failed to delete business' });
    }
  });

  app.get('/api/admin/users', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const allUsers = await storage.getUsers();
      const usersData = allUsers.map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved || false,
        created_at: user.created_at
      }));
      res.json(usersData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users', error: message });
    }
  });

  // Admin: Update user (e.g., approve/deactivate, role change)
  app.patch('/api/admin/users/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const updates = req.body || {};
      const updated = await storage.updateUser(req.params.id, updates);
      const sanitized = { ...updated, password: undefined } as any;
      res.json(sanitized);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user', error: message });
    }
  });

  // Admin: Delete user
  app.delete('/api/admin/users/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user', error: message });
    }
  });

  // Admin: Manage admin accounts
  app.get('/api/admin/admin-users', authenticateAdminToken, async (_req: Request, res: Response) => {
    try {
      const list = await storage.getAdminUsers();
      res.json(list.map(a => ({ ...a, password: undefined })));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching admin users:', error);
      res.status(500).json({ message: 'Failed to fetch admin users', error: message });
    }
  });

  app.post('/api/admin/admin-users', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const { username, password, full_name, email, is_active = true } = req.body || {};
      if (!username || !password || !full_name || !email) {
        return res.status(400).json({ message: 'username, password, full_name and email are required' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email))) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      const existing = await storage.getAdminUserByUsername(String(username));
      if (existing) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      const created = await storage.createAdminUser({ username, password, full_name, email, is_active });
      res.status(201).json({ ...created, password: undefined });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating admin user:', error);
      res.status(500).json({ message: 'Failed to create admin user', error: message });
    }
  });

  app.patch('/api/admin/admin-users/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates: any = {};
      if (typeof req.body?.password === 'string' && req.body.password.length > 0) updates.password = req.body.password;
      if (typeof req.body?.is_active === 'boolean') updates.is_active = req.body.is_active;
      if (typeof req.body?.full_name === 'string' && req.body.full_name.trim() !== '') updates.full_name = req.body.full_name.trim();
      if (typeof req.body?.email === 'string' && req.body.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) return res.status(400).json({ message: 'Invalid email format' });
        updates.email = req.body.email.trim();
      }
      if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid fields to update' });
      const updated = await storage.updateAdminUser(id, updates);
      if (!updated) return res.status(404).json({ message: 'Admin user not found' });
      res.json({ ...updated, password: undefined });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error updating admin user:', error);
      res.status(500).json({ message: 'Failed to update admin user', error: message });
    }
  });

  app.delete('/api/admin/admin-users/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (req.adminUser && req.adminUser.id === id) {
        return res.status(400).json({ message: 'You cannot delete the admin account you are currently using.' });
      }
      const updated = await storage.updateAdminUser(id, { is_active: false });
      if (!updated) return res.status(404).json({ message: 'Admin user not found' });
      res.json({ message: 'Admin user deactivated' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error deleting admin user:', error);
      res.status(500).json({ message: 'Failed to delete admin user', error: message });
    }
  });

  // Admin: Mentors CRUD
  app.get('/api/admin/mentors', authenticateAdminToken, async (_req: Request, res: Response) => {
    try {
      const list = await storage.getMentors();
      res.json(list);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching mentors:', error);
      res.status(500).json({ message: 'Failed to fetch mentors', error: message });
    }
  });

  app.post('/api/admin/mentors', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };
      if (typeof body.years_experience === 'string') {
        body.years_experience = parseInt(body.years_experience);
      }
      const data = insertMentorSchema.parse(body);
      const created = await storage.createMentor(data);
      res.json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating mentor:', error);
      res.status(400).json({ message: 'Failed to create mentor', error: message });
    }
  });

  app.put('/api/admin/mentors/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };
      if (typeof body.years_experience === 'string') {
        body.years_experience = parseInt(body.years_experience);
      }
      const updated = await storage.updateMentor(req.params.id, body);
      res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error updating mentor:', error);
      res.status(400).json({ message: 'Failed to update mentor', error: message });
    }
  });

  app.delete('/api/admin/mentors/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      await storage.deleteMentor(req.params.id);
      res.json({ message: 'Mentor deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error deleting mentor:', error);
      res.status(400).json({ message: 'Failed to delete mentor', error: message });
    }
  });

  // Admin: Programs CRUD
  app.get('/api/admin/programs', authenticateAdminToken, async (_req: Request, res: Response) => {
    try {
      const list = await storage.getPrograms();
      res.json(list);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching programs:', error);
      res.status(500).json({ message: 'Failed to fetch programs', error: message });
    }
  });

  app.post('/api/admin/programs', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };
      if (typeof body.max_participants === 'string') body.max_participants = parseInt(body.max_participants);
      if (typeof body.start_date === 'string') body.start_date = new Date(body.start_date);
      if (typeof body.end_date === 'string') body.end_date = new Date(body.end_date);
      if (body.mentor_id === '') body.mentor_id = null;
      const data = insertProgramSchema.parse(body);
      const created = await storage.createProgram(data);
      res.json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating program:', error);
      res.status(400).json({ message: 'Failed to create program', error: message });
    }
  });

  app.put('/api/admin/programs/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };
      if (typeof body.max_participants === 'string') body.max_participants = parseInt(body.max_participants);
      if (typeof body.start_date === 'string') body.start_date = new Date(body.start_date);
      if (typeof body.end_date === 'string') body.end_date = new Date(body.end_date);
      if (body.mentor_id === '') body.mentor_id = null;
      const updated = await storage.updateProgram(req.params.id, body);
      res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error updating program:', error);
      res.status(400).json({ message: 'Failed to update program', error: message });
    }
  });

  app.delete('/api/admin/programs/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      await storage.deleteProgram(req.params.id);
      res.json({ message: 'Program deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error deleting program:', error);
      res.status(400).json({ message: 'Failed to delete program', error: message });
    }
  });

  // Admin: Quick Sales CRUD
  app.get('/api/admin/quick-sales', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const sales = await storage.getQuickSales(status as any);
      const enriched = await Promise.all(sales.map(async (sale: any) => {
        const products = await storage.getQuickSaleProducts(sale.id);
        const bids = await storage.getQuickSaleBids(sale.id);
        const highest = await storage.getHighestBid(sale.id);
        return { ...sale, products_count: products.length, bids_count: bids.length, highest_bid: highest?.bid_amount ?? null };
      }));
      res.json(enriched);
    } catch (error) {
      console.error('Error fetching admin quick sales:', error);
      res.status(500).json({ message: 'Failed to fetch quick sales' });
    }
  });

  app.get('/api/admin/quick-sales/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const sale = await storage.getQuickSale(req.params.id);
      if (!sale) return res.status(404).json({ message: 'Quick sale not found' });
      const products = await storage.getQuickSaleProducts(req.params.id);
      const bids = await storage.getQuickSaleBids(req.params.id);
      const highest_bid = await storage.getHighestBid(req.params.id);
      res.json({ ...sale, products, bids, highest_bid });
    } catch (error) {
      console.error('Error fetching admin quick sale:', error);
      res.status(500).json({ message: 'Failed to fetch quick sale' });
    }
  });

  app.post('/api/admin/quick-sales', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const { products = [], ...saleBody } = req.body || {};
      // Coerce dates and numbers for schema validation
      if (typeof saleBody.reserve_price === 'string' && saleBody.reserve_price !== '') {
        saleBody.reserve_price = saleBody.reserve_price;
      }
      if (typeof saleBody.ends_at === 'string') saleBody.ends_at = saleBody.ends_at;
      if (typeof saleBody.starts_at === 'string') saleBody.starts_at = saleBody.starts_at;
      const saleData = insertQuickSaleSchema.parse(saleBody);
      const productRows = Array.isArray(products) ? products.map((p: any) => {
        const row = insertQuickSaleProductSchema.partial({ images: true }).parse({
          title: p.title,
          description: p.description,
          condition: p.condition || 'new',
          images: p.images || [],
        } as any);
        return row;
      }) : [];
      const created = await storage.createQuickSale(saleData as any, productRows as any);
      res.status(201).json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating admin quick sale:', error);
      res.status(400).json({ message: 'Failed to create quick sale', error: message });
    }
  });

  app.put('/api/admin/quick-sales/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };
      if (typeof body.reserve_price === 'string' && body.reserve_price !== '') {
        body.reserve_price = body.reserve_price;
      }
      if (typeof body.ends_at === 'string') body.ends_at = body.ends_at;
      if (typeof body.starts_at === 'string') body.starts_at = body.starts_at;
      // Validate status; only allow specific statuses
      if (typeof body.status !== 'undefined') {
        const allowed = new Set(['active', 'ended', 'cancelled']);
        if (!body.status || !allowed.has(String(body.status))) {
          delete (body as any).status;
        }
      }
      const updated = await storage.updateQuickSale(req.params.id, body);
      res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error updating admin quick sale:', error);
      res.status(400).json({ message: 'Failed to update quick sale', error: message });
    }
  });

  app.delete('/api/admin/quick-sales/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      await storage.deleteQuickSale(req.params.id);
      res.json({ message: 'Quick sale deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin quick sale:', error);
      res.status(400).json({ message: 'Failed to delete quick sale' });
    }
  });

  app.post('/api/admin/quick-sales/:id/finalize', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const sale = await storage.getQuickSale(req.params.id);
      if (!sale) return res.status(404).json({ message: 'Quick sale not found' });
      const finalized = await storage.finalizeQuickSale(req.params.id);
      res.json(finalized);
    } catch (error) {
      console.error('Error finalizing admin quick sale:', error);
      res.status(500).json({ message: 'Failed to finalize quick sale' });
    }
  });

  // Admin: Resources upload (files)
  app.post('/api/admin/resources/upload', authenticateAdminToken, resourceUpload.any(), async (req: Request, res: Response) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      const uploaded: Array<{ name: string; url: string; size: number; type: string }> = [];

      for (const file of files) {
        let fileUrl = '';
        if (supabaseUrl && supabaseKey) {
          try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const filename = `resources/${Date.now()}-${file.originalname}`;
            const { data, error } = await supabase.storage
              .from('resource-files')
              .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });
            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage.from('resource-files').getPublicUrl(data.path);
              fileUrl = publicUrl;
            }
          } catch (err) {
            console.warn('Supabase upload failed for resource, using local storage fallback', err);
          }
        }
        if (!fileUrl) {
          const filename = `${Date.now()}-${file.originalname}`;
          const filepath = path.join(uploadDir, filename);
          fs.writeFileSync(filepath, file.buffer);
          fileUrl = `/uploads/${filename}`;
        }
        uploaded.push({ name: file.originalname, url: fileUrl, size: file.size, type: file.mimetype });
      }

      res.json({ files: uploaded });
    } catch (error) {
      console.error('Error uploading resource files:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  });

  // Admin: Resources CRUD
  app.get('/api/admin/resources', authenticateAdminToken, async (_req: Request, res: Response) => {
    try {
      const all = await storage.getResources();
      res.json(all);
    } catch (error) {
      console.error('Error fetching admin resources:', error);
      res.status(500).json({ message: 'Failed to fetch resources' });
    }
  });

  app.get('/api/admin/resources/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const item = await storage.getResource(req.params.id);
      if (!item) return res.status(404).json({ message: 'Resource not found' });
      res.json(item);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ message: 'Failed to fetch resource' });
    }
  });

  app.post('/api/admin/resources', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const data = insertResourceSchema.parse(req.body);
      const created = await storage.createResource(data as any);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating resource:', error);
      res.status(400).json({ message: 'Failed to create resource', error: error.message || String(error) });
    }
  });

  app.put('/api/admin/resources/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateResource(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(400).json({ message: 'Failed to update resource' });
    }
  });

  app.delete('/api/admin/resources/:id', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      await storage.deleteResource(req.params.id);
      res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(400).json({ message: 'Failed to delete resource' });
    }
  });

  // Public: Resources
  app.get('/api/resources', async (_req: Request, res: Response) => {
    try {
      const all = await storage.getResources();
      const published = all.filter((r: any) => r.status === 'published');
      res.json(published);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ message: 'Failed to fetch resources' });
    }
  });

  app.get('/api/resources/:id', async (req: Request, res: Response) => {
    try {
      const item = await storage.getResource(req.params.id);
      if (!item || item.status !== 'published') return res.status(404).json({ message: 'Resource not found' });
      res.json(item);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ message: 'Failed to fetch resource' });
    }
  });

  app.post('/api/resources/:id/view', async (req: Request, res: Response) => {
    try {
      await storage.incrementResourceViews(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error incrementing views:', error);
      res.status(500).json({ message: 'Failed to track view' });
    }
  });

  app.post('/api/resources/:id/download', async (req: Request, res: Response) => {
    try {
      await storage.incrementResourceDownloads(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error incrementing downloads:', error);
      res.status(500).json({ message: 'Failed to track download' });
    }
  });

  // Community Discussions (Public)
  app.get('/api/discussions', async (req: Request, res: Response) => {
    try {
      const { category, search } = req.query as { category?: string; search?: string };
      const list = category && category !== 'all'
        ? await storage.getDiscussionsByCategory(String(category))
        : await storage.getDiscussions();
      // Simple search filtering on title/content
      const filtered = search
        ? list.filter((d: any) =>
            (d.title || '').toLowerCase().includes(String(search).toLowerCase()) ||
            (d.content || '').toLowerCase().includes(String(search).toLowerCase())
          )
        : list;
      res.json(filtered);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      res.status(500).json({ message: 'Failed to fetch discussions' });
    }
  });

  app.get('/api/discussions/:id', async (req: Request, res: Response) => {
    try {
      const d = await storage.getDiscussion(req.params.id);
      if (!d || d.status !== 'published') return res.status(404).json({ message: 'Discussion not found' });
      res.json(d);
    } catch (error) {
      console.error('Error fetching discussion:', error);
      res.status(500).json({ message: 'Failed to fetch discussion' });
    }
  });

  app.post('/api/discussions', async (req: Request, res: Response) => {
    try {
      // Resolve author: prefer a valid user token; otherwise fallback to an anonymous user
      let authorId: string | null = null;
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          const user = await storage.getUser(decoded.id);
          if (user && user.is_approved) {
            authorId = user.id;
          }
        } catch {}
      }
      if (!authorId) {
        const anonEmail = 'anonymous@bizconnect.local';
        let anon = await storage.getUserByEmail(anonEmail);
        if (!anon) {
          const hash = await bcrypt.hash('anonymous', 10);
          anon = await storage.createUser({
            email: anonEmail,
            password: hash,
            full_name: 'Anonymous',
            role: 'user',
            is_approved: true,
          } as any);
        }
        authorId = anon!.id;
      }
      const payload = insertDiscussionSchema.parse({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        tags: Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        author_id: authorId,
        status: 'published',
      } as any);
      const created = await storage.createDiscussion(payload as any);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      res.status(400).json({ message: 'Failed to create discussion', error: error.message || String(error) });
    }
  });

  app.put('/api/discussions/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const existing = await storage.getDiscussion(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Discussion not found' });
      if (user.role !== 'admin' && existing.author_id !== user.id) return res.status(403).json({ message: 'Not authorized' });
      const updated = await storage.updateDiscussion(req.params.id, {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        tags: Array.isArray(req.body.tags) ? req.body.tags : undefined,
        status: req.body.status,
      });
      res.json(updated);
    } catch (error) {
      console.error('Error updating discussion:', error);
      res.status(400).json({ message: 'Failed to update discussion' });
    }
  });

  app.delete('/api/discussions/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const existing = await storage.getDiscussion(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Discussion not found' });
      if (user.role !== 'admin' && existing.author_id !== user.id) return res.status(403).json({ message: 'Not authorized' });
      await storage.deleteDiscussion(req.params.id);
      res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
      console.error('Error deleting discussion:', error);
      res.status(400).json({ message: 'Failed to delete discussion' });
    }
  });

  app.post('/api/discussions/:id/view', async (req: Request, res: Response) => {
    try {
      await storage.incrementDiscussionViews(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error tracking discussion view:', error);
      res.status(500).json({ message: 'Failed to track view' });
    }
  });

  // Comments
  app.get('/api/discussions/:id/comments', async (req: Request, res: Response) => {
    try {
      const comments = await storage.getCommentsByDiscussion(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  });

  app.post('/api/discussions/:id/comments', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const payload = insertCommentSchema.parse({
        discussion_id: req.params.id,
        parent_comment_id: req.body.parent_comment_id || null,
        content: req.body.content,
        author_id: user.id,
        status: 'published',
      } as any);
      const created = await storage.createComment(payload as any);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      res.status(400).json({ message: 'Failed to create comment', error: error.message || String(error) });
    }
  });

  app.put('/api/comments/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const existing = await storage.getComment(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Comment not found' });
      if (user.role !== 'admin' && existing.author_id !== user.id) return res.status(403).json({ message: 'Not authorized' });
      const updated = await storage.updateComment(req.params.id, { content: req.body.content, status: req.body.status });
      res.json(updated);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(400).json({ message: 'Failed to update comment' });
    }
  });

  app.delete('/api/comments/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const existing = await storage.getComment(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Comment not found' });
      if (user.role !== 'admin' && existing.author_id !== user.id) return res.status(403).json({ message: 'Not authorized' });
      await storage.deleteComment(req.params.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(400).json({ message: 'Failed to delete comment' });
    }
  });

  // Likes toggle
  app.post('/api/likes/toggle', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { targetId, type } = req.body as { targetId: string; type: 'discussion' | 'comment' };
      if (!targetId || (type !== 'discussion' && type !== 'comment')) return res.status(400).json({ message: 'Invalid parameters' });
      const result = await storage.toggleLike(user.id, targetId, type);
      res.json(result);
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(400).json({ message: 'Failed to toggle like' });
    }
  });

  // Community stats
  app.get('/api/community/stats', async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching community stats:', error);
      res.status(500).json({ message: 'Failed to fetch community stats' });
    }
  });

  // Admin: Discussions list/create
  app.get('/api/admin/discussions', authenticateAdminToken, async (_req: Request, res: Response) => {
    try {
      // For admin we can show all; reuse getDiscussions() which returns published, or a new method. Here we return published for now.
      const list = await storage.getDiscussions();
      res.json(list);
    } catch (error) {
      console.error('Error fetching admin discussions:', error);
      res.status(500).json({ message: 'Failed to fetch discussions' });
    }
  });

  app.post('/api/admin/discussions', authenticateAdminToken, async (req: Request, res: Response) => {
    try {
      // Admin can create discussions; author_id remains the admin user's id if present in storage
      const tokenUser = (req as any).user;
      const payload = insertDiscussionSchema.parse({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        tags: Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        author_id: tokenUser?.id,
        status: 'published',
      } as any);
      const created = await storage.createDiscussion(payload as any);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating admin discussion:', error);
      res.status(400).json({ message: 'Failed to create discussion', error: error.message || String(error) });
    }
  });

  // Admin: Update any discussion
  app.put('/api/admin/discussions/:id', authenticateAdminToken, async (req, res) => {
    try {
      const updatedDiscussion = await storage.updateDiscussion(req.params.id, req.body);
      res.json(updatedDiscussion);
    } catch (error) {
      console.error('Error updating admin discussion:', error);
      res.status(500).json({ message: 'Failed to update discussion' });
    }
  });

  // Admin: Delete any discussion
  app.delete('/api/admin/discussions/:id', authenticateAdminToken, async (req, res) => {
    try {
      await storage.deleteDiscussion(req.params.id);
      res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin discussion:', error);
      res.status(500).json({ message: 'Failed to delete discussion' });
    }
  });

  // Admin: Get all comments
  app.get('/api/admin/comments', authenticateAdminToken, async (req, res) => {
    try {
      const { discussion_id } = req.query;
      let comments;
      
      if (discussion_id) {
        comments = await storage.getCommentsByDiscussion(discussion_id as string);
      } else {
        // Get all comments - we'll need to implement this method
        comments = [];
      }
      
      res.json(comments);
    } catch (error) {
      console.error('Error fetching admin comments:', error);
      res.status(500).json({ message: 'Failed to get comments' });
    }
  });

  // Admin: Update any comment
  app.put('/api/admin/comments/:id', authenticateAdminToken, async (req, res) => {
    try {
      const updatedComment = await storage.updateComment(req.params.id, req.body);
      res.json(updatedComment);
    } catch (error) {
      console.error('Error updating admin comment:', error);
      res.status(500).json({ message: 'Failed to update comment' });
    }
  });

  // Admin: Delete any comment
  app.delete('/api/admin/comments/:id', authenticateAdminToken, async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin comment:', error);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  });

  // Business Rating API Routes
  app.get('/api/businesses/:businessId/ratings', async (req, res) => {
    try {
      const { businessId } = req.params;
      const ratings = await storage.getBusinessRatings(businessId);
      res.json(ratings);
    } catch (error) {
      console.error('Error fetching business ratings:', error);
      res.status(500).json({ message: 'Failed to fetch business ratings' });
    }
  });

  app.get('/api/businesses/:businessId/rating-stats', async (req, res) => {
    try {
      const { businessId } = req.params;
      const stats = await storage.getBusinessRatingStats(businessId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching business rating stats:', error);
      res.status(500).json({ message: 'Failed to fetch business rating stats' });
    }
  });

  app.get('/api/businesses/:businessId/user-rating', authenticateToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      const user = req.user as any;
      const rating = await storage.getBusinessRating(user.id, businessId);
      res.json(rating || null);
    } catch (error) {
      console.error('Error fetching user business rating:', error);
      res.status(500).json({ message: 'Failed to fetch user business rating' });
    }
  });

  app.post('/api/businesses/:businessId/rate', authenticateToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      const { rating } = req.body;
      const user = req.user as any;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Check if user already has a rating for this business
      const existingRating = await storage.getBusinessRating(user.id, businessId);
      
      if (existingRating) {
        // Update existing rating
        const updatedRating = await storage.updateBusinessRating(existingRating.id, { rating });
        res.json(updatedRating);
      } else {
        // Create new rating
        const newRating = await storage.createBusinessRating({
          user_id: user.id,
          business_id: businessId,
          rating
        });
        res.json(newRating);
      }
    } catch (error) {
      console.error('Error rating business:', error);
      res.status(500).json({ message: 'Failed to rate business' });
    }
  });

  app.delete('/api/businesses/:businessId/rating', authenticateToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      const user = req.user as any;

      const existingRating = await storage.getBusinessRating(user.id, businessId);
      
      if (!existingRating) {
        return res.status(404).json({ message: 'Rating not found' });
      }

      await storage.deleteBusinessRating(existingRating.id);
      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Error deleting business rating:', error);
      res.status(500).json({ message: 'Failed to delete business rating' });
    }
  });

  // Product Rating API Routes
  app.get('/api/products/:productId/ratings', async (req, res) => {
    try {
      const { productId } = req.params;
      const ratings = await storage.getProductRatings(productId);
      res.json(ratings);
    } catch (error) {
      console.error('Error fetching product ratings:', error);
      res.status(500).json({ message: 'Failed to fetch product ratings' });
    }
  });

  app.get('/api/products/:productId/rating-stats', async (req, res) => {
    try {
      const { productId } = req.params;
      const stats = await storage.getProductRatingStats(productId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching product rating stats:', error);
      res.status(500).json({ message: 'Failed to fetch product rating stats' });
    }
  });

  app.get('/api/products/:productId/user-rating', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const user = req.user as any;
      const rating = await storage.getProductRating(user.id, productId);
      res.json(rating || null);
    } catch (error) {
      console.error('Error fetching user product rating:', error);
      res.status(500).json({ message: 'Failed to fetch user product rating' });
    }
  });

  app.post('/api/products/:productId/rate', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating } = req.body;
      const user = req.user as any;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Check if user already has a rating for this product
      const existingRating = await storage.getProductRating(user.id, productId);
      
      if (existingRating) {
        // Update existing rating
        const updatedRating = await storage.updateProductRating(existingRating.id, { rating });
        res.json(updatedRating);
      } else {
        // Create new rating
        const newRating = await storage.createProductRating({
          user_id: user.id,
          product_id: productId,
          rating
        });
        res.json(newRating);
      }
    } catch (error) {
      console.error('Error rating product:', error);
      res.status(500).json({ message: 'Failed to rate product' });
    }
  });

  app.delete('/api/products/:productId/rating', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const user = req.user as any;

      const existingRating = await storage.getProductRating(user.id, productId);
      
      if (!existingRating) {
        return res.status(404).json({ message: 'Rating not found' });
      }

      await storage.deleteProductRating(existingRating.id);
      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Error deleting product rating:', error);
      res.status(500).json({ message: 'Failed to delete product rating' });
    }
  });

  // Quick Sale / Auction routes
  app.get('/api/quick-sales', async (req, res) => {
    try {
      const { status } = req.query;
      const sales = await storage.getQuickSales(status as any);
      
      const salesWithDetails = await Promise.all(
        sales.map(async (sale) => {
          const products = await storage.getQuickSaleProducts(sale.id);
          const bids = await storage.getQuickSaleBids(sale.id);
          const highestBid = bids[0];
          
          return {
            ...sale,
            productsCount: products.length,
            bidsCount: bids.length,
            highestBid: highestBid ? Number(highestBid.bid_amount) : null
          };
        })
      );
      
      res.json(salesWithDetails);
    } catch (error) {
      console.error('Error getting quick sales:', error);
      res.status(500).json({ message: 'Failed to get quick sales' });
    }
  });

  app.get('/api/quick-sales/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await storage.getQuickSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: 'Quick sale not found' });
      }
      
      const products = await storage.getQuickSaleProducts(id);
      const bids = await storage.getQuickSaleBids(id);
      
      res.json({
        ...sale,
        products,
        bids
      });
    } catch (error) {
      console.error('Error getting quick sale:', error);
      res.status(500).json({ message: 'Failed to get quick sale' });
    }
  });

  app.post('/api/quick-sales', upload.any(), async (req, res) => {
    try {
      const { title, description, seller_name, seller_contact, seller_email, ends_at, products: productsJson, reserve_price } = req.body;
      
      const products = JSON.parse(productsJson || '[]');
      
      if (products.length === 0) {
        return res.status(400).json({ message: 'At least one product is required' });
      }
      
      if (products.length > 20) {
        return res.status(400).json({ message: 'Maximum 20 products allowed per quick sale' });
      }
      
      // Process uploaded images
      const files = req.files as Express.Multer.File[] || [];
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      // Group images by product index
      const productImages: { [key: number]: string[] } = {};
      
      for (const file of files) {
        const match = file.fieldname.match(/product_(\d+)_images/);
        if (match) {
          const productIndex = parseInt(match[1]);
          
          let imageUrl = '';
          
          // Try Supabase upload first
          if (supabaseUrl && supabaseKey) {
            try {
              const supabase = createClient(supabaseUrl, supabaseKey);
              const filename = `quick-sale/${Date.now()}-${file.originalname}`;
              
              const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filename, file.buffer, {
                  contentType: file.mimetype,
                  upsert: false
                });
              
              if (!error && data) {
                const { data: { publicUrl } } = supabase.storage
                  .from('product-images')
                  .getPublicUrl(data.path);
                imageUrl = publicUrl;
              }
            } catch (err) {
              console.warn('Supabase upload failed, using local storage', err);
            }
          }
          
          // Fallback to local storage if Supabase fails
          if (!imageUrl) {
            const filename = `${Date.now()}-${file.originalname}`;
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, file.buffer);
            imageUrl = `/uploads/${filename}`;
          }
          
          if (!productImages[productIndex]) {
            productImages[productIndex] = [];
          }
          productImages[productIndex].push(imageUrl);
        }
      }
      
      // Add images to products
      const productsWithImages = products.map((product: any, index: number) => ({
        ...product,
        images: productImages[index] || []
      }));
      
      const quickSaleData = {
        title,
        description,
        seller_name,
        seller_contact,
        seller_email: seller_email || null,
        starts_at: new Date(),
        ends_at: new Date(ends_at),
        status: 'active' as const,
        reserve_price: reserve_price || null
      };
      
      const validatedQuickSale = insertQuickSaleSchema.parse(quickSaleData);
      
      const sale = await storage.createQuickSale(validatedQuickSale, productsWithImages);
      
      res.status(201).json(sale);
    } catch (error: any) {
      console.error('Error creating quick sale:', error);
      res.status(400).json({ message: error.message || 'Failed to create quick sale' });
    }
  });

  app.post('/api/quick-sales/:id/bids', async (req, res) => {
    try {
      const { id } = req.params;
      const { bidder_name, bid_amount, contact_number } = req.body;
      
      const sale = await storage.getQuickSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: 'Quick sale not found' });
      }
      
      if (sale.status !== 'active') {
        return res.status(400).json({ message: 'This quick sale is not active' });
      }
      
      if (new Date(sale.ends_at) < new Date()) {
        return res.status(400).json({ message: 'This quick sale has ended' });
      }
      
      const highestBid = await storage.getHighestBid(id);
      const bidAmountNum = Number(bid_amount);
      
      if (highestBid && bidAmountNum <= Number(highestBid.bid_amount)) {
        return res.status(400).json({ 
          message: `Bid must be higher than current highest bid of GH₵${highestBid.bid_amount}` 
        });
      }
      
      const bidData = {
        quick_sale_id: id,
        bidder_name,
        bid_amount: bid_amount.toString(),
        contact_number
      };
      
      const validatedBid = insertQuickSaleBidSchema.parse(bidData);
      const bid = await storage.createQuickSaleBid(validatedBid);
      
      res.status(201).json(bid);
    } catch (error: any) {
      console.error('Error placing bid:', error);
      res.status(400).json({ message: error.message || 'Failed to place bid' });
    }
  });

  app.post('/api/quick-sales/:id/finalize', async (req, res) => {
    try {
      const { id } = req.params;
      
      const sale = await storage.getQuickSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: 'Quick sale not found' });
      }
      
      if (sale.status === 'ended') {
        return res.status(400).json({ message: 'Quick sale already finalized' });
      }
      
      const finalizedSale = await storage.finalizeQuickSale(id);
      res.json(finalizedSale);
    } catch (error) {
      console.error('Error finalizing quick sale:', error);
      res.status(500).json({ message: 'Failed to finalize quick sale' });
    }
  });

  return httpServer;
}
