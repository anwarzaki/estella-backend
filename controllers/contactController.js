// backend/controllers/contactController.js
import { sendEmail } from '../utils/sendEmail.js';

export const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;
  
  try {
    const emailSubject = 'New Contact Form Submission';
    const emailText = `
                      Name: ${name}
                      Email: ${email}
                      Message: ${message}
                    `;
    
    await sendEmail(process.env.EMAIL, emailSubject, emailText);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};