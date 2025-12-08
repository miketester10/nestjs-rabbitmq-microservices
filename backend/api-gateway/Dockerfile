# Usa l'immagine ufficiale di Node.js
FROM node:20

# Imposta la directory di lavoro
WORKDIR /app

# Copia il package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il codice dell'applicazione
COPY . .

# Costruisci il progetto NestJS
RUN npx nest build

# Esponi la porta 3000
EXPOSE 3000

# Avvia l'app NestJS
CMD ["npm", "run", "start:prod"]