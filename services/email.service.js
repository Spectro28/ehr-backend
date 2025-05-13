const nodemailer = require('nodemailer');
const config = require('../config/email.config');

const transporter = nodemailer.createTransport(config.email);

exports.sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `http://localhost/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: config.email.auth.user,
    to: to,
    subject: 'Recuperación de Contraseña - EHR System',
    html: `
      <h1>Recuperación de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✉️ Correo de recuperación enviado a:', to);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error;
  }
};