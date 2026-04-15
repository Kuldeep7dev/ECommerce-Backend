const contactTemplate = ({ name, email, message, time }) => {
    return `
  <div style="font-family: system-ui, sans-serif, Arial; background-color: #f8fafc; padding: 40px 20px; margin: 0;">

    <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #111827, #1f2937); padding: 30px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 28px;">
          BRAVIMA
        </h1>
        <p style="margin-top: 8px; color: #d1d5db; font-size: 14px;">
          New Customer Inquiry Received
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 35px;">

        <p style="font-size: 15px; color: #4b5563;">
          A new message has been submitted through your website contact form.
        </p>

        <div style="margin-top: 25px; padding: 22px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f9fafb;">

          <div style="font-size: 18px; color: #111827; font-weight: 700;">
            ${name}
          </div>

          <div style="font-size: 13px; color: #9ca3af; margin-top: 4px;">
            ${time}
          </div>

          <div style="margin-top: 15px;">
            <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          </div>

          <div style="margin-top: 22px; padding: 18px; background: white; border-radius: 12px; border-left: 4px solid #111827;">
            <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7;">
              ${message}
            </p>
          </div>

        </div>

      </div>

      <!-- Footer -->
      <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f1f5f9;">
        © 2026 Bravima. Premium Footwear Brand.
      </div>

    </div>

  </div>
  `;
};

module.exports = contactTemplate;