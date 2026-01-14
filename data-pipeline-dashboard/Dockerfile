# Usa uma imagem leve do Node.js
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta que o Vite usa
EXPOSE 5173

# Comando para rodar o app garantindo que ele aceite conexões externas
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
