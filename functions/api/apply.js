export async function onRequestPost({ request, env }) {
  try {
    // Accept both JSON and regular form posts
    const ct = request.headers.get("content-type") || "";
    let data = {};

    if (ct.includes("application/json")) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }

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
    } = data;

    if (!fullName || !discord || !email || !position || !experience || !why || !availability || !timezone) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
    const applicationId = "HSMP-" + Date.now();

    const adminText =
`New Hamlet SMP Application (${applicationId})
Submitted: ${timestamp}

Full Name: ${fullName}
Discord: ${discord}
Email: ${email}
Position: ${position}
Availability: ${availability} hours/week
Timezone: ${timezone}

Experience:
${experience}

Why Hamlet SMP:
${why}

Portfolio:
${portfolio || "Not provided"}
`;

    // Send email to admin (you)
    const sendAdmin = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: env.ADMIN_EMAIL }],
          subject: `New Application: ${fullName} - ${position}`
        }],
        from: { email: env.FROM_EMAIL, name: "Hamlet SMP Application Bot" },
        reply_to: { email },
        content: [{ type: "text/plain", value: adminText }]
      })
    });

    const adminErr = await sendAdmin.text();
    if (!sendAdmin.ok) {
      return new Response(JSON.stringify({ success: false, error: "SendGrid admin email failed", details: adminErr }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }

    // Confirmation email to applicant
    const sendConfirm = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: "Your Hamlet SMP Application Has Been Received"
        }],
        from: { email: env.FROM_EMAIL, name: "Hamlet SMP Team" },
        content: [{
          type: "text/plain",
          value:
`Hi ${fullName},

We received your application for: ${position}
Application ID: ${applicationId}
Submitted: ${timestamp}

We’ll review it within 3–5 business days and contact you on Discord: ${discord}

Thanks,
Hamlet SMP Team`
        }]
      })
    });

    const confirmErr = await sendConfirm.text();
    if (!sendConfirm.ok) {
      // Admin already got it; still return success but warn
      return new Response(JSON.stringify({
        success: true,
        message: "Application submitted (confirmation email failed)",
        applicationId,
        timestamp,
        warning: confirmErr
      }), { status: 200, headers: { "content-type": "application/json" }});
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Application submitted successfully",
      applicationId,
      timestamp
    }), { status: 200, headers: { "content-type": "application/json" }});

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: "Server error", details: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

