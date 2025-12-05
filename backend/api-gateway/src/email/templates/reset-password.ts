export const resetPasswordTemplate = (
  name: string,
  verificationLink: string,
): string => {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
      <div style="padding: 20px;">
        <p>Ciao, ${name}!</p>
        <p>Per resettare la tua password, clicca sul link qui sotto:</p>
        <p>
          <a href="${verificationLink}" 
            style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Il link è valido per 5 minuti.</p>
        <p>Se non hai richiesto il reset della password, ignora questa email.</p>
      </div>
    </body>
    </html>
  `;
};
