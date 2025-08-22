export const verificationEmailTemplate = (
  name: string,
  verificationLink: string,
): string => {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifica Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
      <div style="padding: 20px;">
        <p>Ciao, ${name}!</p>
        <p>Per completare il processo di registrazione, clicca sul link qui sotto per verificare la tua email:</p>
        <p>
          <a href="${verificationLink}" 
            style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
            Verifica Adesso
          </a>
        </p>
        <p>Il link è valido per 5 minuti.</p>
        <p>Se non ti sei registrato, ignora questa email.</p>
      </div>
    </body>
    </html>
  `;
};
