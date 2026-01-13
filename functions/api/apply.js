// apply.js - Express API for Hamlet SMP Application Form
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Hamlet SMP Application API',
        endpoints: ['POST /api/apply']
    });
});

// Application submission endpoint
app.post('/api/apply', async (req, res) => {
    try {
        const {
            fullName,
            discord,
            email,
            position,
            experience,
            why,
            availability,
            timezone,
            portfolio
        } = req.body;

        // Validate required fields
        if (!fullName || !discord || !email || !position || !experience || !why || !availability || !timezone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const timestamp = new Date().toLocaleString();
        const applicationId = 'HSMP-' + Date.now();

        // Email to admin
        const adminHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #9b59b6 0%, #e84393 100%); padding: 20px; color: white; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0;">📄 New Hamlet SMP Application</h1>
                    <p style="margin: 5px 0 0 0;">Application ID: ${applicationId}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                            <strong>👤 Applicant:</strong><br>${fullName}
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                            <strong>💼 Position:</strong><br>${position}
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                            <strong>📱 Discord:</strong><br>${discord}
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                            <strong>📧 Email:</strong><br>${email}
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                            <strong>⏰ Availability:</strong><br>${availability} hours/week
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                            <strong>🌐 Timezone:</strong><br>${timezone}
                        </div>
                    </div>

                    <h3 style="color: #9b59b6; border-bottom: 2px solid #fd79a8; padding-bottom: 5px;">🎯 Relevant Experience</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; white-space: pre-line;">
                        ${experience}
                    </div>

                    <h3 style="color: #9b59b6; border-bottom: 2px solid #fd79a8; padding-bottom: 5px;">🤔 Why Hamlet SMP?</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; white-space: pre-line;">
                        ${why}
                    </div>

                    <h3 style="color: #9b59b6; border-bottom: 2px solid #fd79a8; padding-bottom: 5px;">🔗 Portfolio Links</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; white-space: pre-line;">
                        ${portfolio || 'Not provided'}
                    </div>

                    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                        <p><strong>Submitted:</strong> ${timestamp}</p>
                        <p><strong>Application ID:</strong> ${applicationId}</p>
                        <p><em>This application was submitted via the Hamlet SMP website form.</em></p>
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://discord.gg/kmKnDs6WUF" style="display: inline-block; background: #7289da; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Contact on Discord
                        </a>
                    </div>
                </div>
            </div>
        `;

        const adminMsg = {
            to: process.env.ADMIN_EMAIL,
            from: {
                email: process.env.FROM_EMAIL,
                name: 'Hamlet SMP Application Bot'
            },
            subject: `New Application: ${fullName} - ${position}`,
            html: adminHtml,
            replyTo: email
        };

        // Confirmation email to applicant
        const confirmationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #9b59b6 0%, #e84393 100%); padding: 30px; color: white; text-align: center; border-radius: 10px;">
                    <h1 style="margin: 0; font-size: 28px;">🎮 Application Received!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Hamlet SMP Development Team</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 15px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; line-height: 1.6;">Dear <strong>${fullName}</strong>,</p>
                    
                    <p style="font-size: 16px; line-height: 1.6;">Thank you for submitting your application to join the <strong>Hamlet SMP</strong> development team!</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9b59b6;">
                        <h3 style="color: #9b59b6; margin-top: 0;">📋 Application Summary</h3>
                        <p><strong>Position:</strong> ${position}</p>
                        <p><strong>Application ID:</strong> ${applicationId}</p>
                        <p><strong>Submitted:</strong> ${timestamp}</p>
                    </div>
                    
                    <h3 style="color: #9b59b6;">📝 What Happens Next?</h3>
                    <ol style="font-size: 16px; line-height: 1.6;">
                        <li>Your application will be reviewed within <strong>3-5 business days</strong></li>
                        <li>If selected for the next stage, we'll contact you via Discord</li>
                        <li>Ensure your Discord DMs are open: <strong>${discord}</strong></li>
                    </ol>
                    
                    <div style="background: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffd54f;">
                        <h4 style="color: #ff9800; margin-top: 0;">💡 Pro Tip</h4>
                        <p style="margin: 0;">Join our Discord server to learn more about the project and connect with our team:</p>
                        <a href="https://discord.gg/kmKnDs6WUF" style="display: inline-block; background: #7289da; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                            Join Hamlet SMP Discord
                        </a>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="font-size: 14px; color: #666;">Best regards,<br><strong>The Hamlet SMP Development Team</strong></p>
                        <p style="font-size: 12px; color: #999; margin-top: 20px;">
                            <em>This is an automated message. Please do not reply to this email.<br>
                            For questions, contact us on Discord or reply to this email thread.</em>
                        </p>
                    </div>
                </div>
            </div>
        `;

        const confirmationMsg = {
            to: email,
            from: {
                email: process.env.FROM_EMAIL,
                name: 'Hamlet SMP Team'
            },
            subject: 'Your Hamlet SMP Application Has Been Received',
            html: confirmationHtml
        };

        // Send both emails
        await sgMail.send(adminMsg);
        await sgMail.send(confirmationMsg);

        // Log the application (for debugging)
        console.log(`Application received: ${applicationId} - ${fullName} - ${position}`);

        // Return success response
        res.json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: applicationId,
            timestamp: timestamp,
            nextSteps: 'You will receive a confirmation email shortly. We will contact you via Discord within 3-5 business days.'
        });

    } catch (error) {
        console.error('Application error:', error);
        
        // Check if it's a SendGrid error
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to submit application',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'hamlet-smp-apply-api'
    });
});

// Start server
app.listen(port, () => {
    console.log(`Hamlet SMP Application API running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Admin email: ${process.env.ADMIN_EMAIL}`);
});
