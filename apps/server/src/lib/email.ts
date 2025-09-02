// apps/server/src/lib/email.ts
import {
	SendSmtpEmail,
	TransactionalEmailsApi,
	TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";

// --- FIX 1: Improved environment variable handling ---
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;

const requiredEnvVars = ["BREVO_API_KEY", "FROM_EMAIL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
	console.error(
		`Missing required environment variables for email: ${missingEnvVars.join(", ")}`,
	);
	// Optionally throw or disable email feature
	// throw new Error(`Missing required environment variables for email`);
}

// Create Brevo transactional email API client
const emailApi = new TransactionalEmailsApi();

// --- FIX 2: Check if BREVO_API_KEY exists before setting ---
if (BREVO_API_KEY) {
	emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
} else {
	console.warn(
		"BREVO_API_KEY not found, email API might not function correctly.",
	);
	// Depending on your setup, you might want to throw an error here if email is critical
}

// --- Type definition for the error object (optional but good practice) ---
interface BrevoErrorBody {
	message?: string;
	// Add other potential fields from Brevo's error response if needed
	// code?: number;
	// etc.?
}
interface BrevoApiError extends Error {
	body?: BrevoErrorBody;
	// Add other potential fields from the error object if needed
	// response?: { status?: number; ... };
}

interface SendOTPEmailParams {
	to: string;
	otp: string;
	type: "sign-in" | "email-verification" | "forget-password";
}

export async function sendOTPEmail({
	to,
	otp,
	type,
}: SendOTPEmailParams): Promise<void> {
	// --- FIX 3: Check both variables exist before proceeding ---
	if (!BREVO_API_KEY || !FROM_EMAIL) {
		console.warn(
			`📧 Email not configured. Skipping sending OTP email to ${to} for ${type}.`,
		);
		return;
	}

	const emailTemplates = {
		"sign-in": {
			subject: "Your Sign-In Code - DataCv",
			html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">DataCv</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Data Professional Resume Builder</p>
                    </div>
                    
                    <div style="padding: 30px 20px; background-color: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Sign In to Your Account</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Use the verification code below to sign in to your DataCv account:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background-color: #667eea; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; font-family: monospace;">
                                ${otp}
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
                        </p>
                        
                        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999;">
                            <p>This is an automated email from DataCv. Please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            `,
		},
		"email-verification": {
			subject: "Verify Your Email - DataCv",
			html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">DataCv</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Data Professional Resume Builder</p>
                    </div>
                    
                    <div style="padding: 30px 20px; background-color: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Welcome to DataCv! Please use the verification code below to verify your email address:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; font-family: monospace;">
                                ${otp}
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            This code will expire in 5 minutes. Once verified, you'll have full access to create AI-powered resumes tailored for data professionals.
                        </p>
                        
                        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999;">
                            <p>This is an automated email from DataCv. Please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            `,
		},
		"forget-password": {
			subject: "Reset Your Password - DataCv",
			html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">DataCv</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Data Professional Resume Builder</p>
                    </div>
                    
                    <div style="padding: 30px 20px; background-color: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            You requested to reset your password. Use the verification code below to proceed:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background-color: #dc3545; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; font-family: monospace;">
                                ${otp}
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            This code will expire in 5 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                        </p>
                        
                        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999;">
                            <p>This is an automated email from DataCv. Please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            `,
		},
	};

	const template = emailTemplates[type];
	if (!template) throw new Error(`Unsupported email type: ${type}`);

	const message = new SendSmtpEmail();
	message.subject = template.subject;
	message.htmlContent = template.html;
	// --- FIX 4: Use the checked FROM_EMAIL variable ---
	message.sender = {
		email: FROM_EMAIL, // No more '!'
		name: "DataCv",
	};
	message.to = [{ email: to }];

	try {
		const result = await emailApi.sendTransacEmail(message);
		console.log(
			`📧 OTP email sent to ${to} (Message ID: ${result.body?.messageId})`,
		);
	} catch (error: unknown) {
		// --- FIX 5: Use 'unknown' instead of 'any' ---
		// --- FIX 6: Type checking before accessing properties ---
		let errorMessage = "Unknown error occurred";
		let errorDetails = "";

		if (error instanceof Error) {
			errorMessage = error.message;
			// Check if it's specifically a Brevo API error structure
			const brevoError = error as BrevoApiError; // Type assertion for checking
			if (brevoError.body?.message) {
				errorDetails = `: ${brevoError.body.message}`;
			} else if (brevoError.body) {
				// If body exists but no message, log the body
				errorDetails = `: ${JSON.stringify(brevoError.body)}`;
			}
		} else {
			// Handle cases where error is not an Error instance (less common)
			errorDetails = `: ${String(error)}`;
		}

		console.error(`❌ Failed to send OTP email to ${to}${errorDetails}`, error); // Log the original error too
		throw new Error(`Failed to send OTP email: ${errorMessage}`);
	}
}
