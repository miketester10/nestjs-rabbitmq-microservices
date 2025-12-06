export const deleteAccountTemplate = (name: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Eliminato</title>
    </head>
    <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
      <div style="padding: 20px;">
        <p>Ciao, ${name}!</p>
        <p>Ti confermiamo che il tuo account è stato eliminato con successo.</p>
        <p>Ci dispiace vederti andare via. I tuoi dati sono stati rimossi dai nostri sistemi.</p>
        <p>Speriamo di rivederti in futuro! Se vorrai tornare, sarai sempre il benvenuto.</p>
        <p>
          Se non hai richiesto tu l'eliminazione dell'account, 
          <a href="mailto:inforabbitmqapp@gmail.com?subject=Assistenza: Eliminazione Account Non Richiesta" 
            style="color: #007bff; text-decoration: underline;">
            contatta immediatamente il supporto clienti
          </a>.
        </p>
      </div>
    </body>
    </html>
  `;
};
