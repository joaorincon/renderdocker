# --- Etapa 1: Construcción (Build Stage) ---
# Usamos una imagen de Node.js para construir nuestro proyecto
FROM node:18-alpine AS builder

# Establecemos el entorno a 'development' para asegurar que se instalen las devDependencies
# Aunque es el valor por defecto, hacerlo explícito ayuda a evitar errores.
ENV NODE_ENV=development

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos las dependencias del proyecto
RUN npm ci

# Copiamos el resto del código fuente de la aplicación
COPY . .

# Ejecutamos el script de construcción de Vite
RUN npm run build

# --- Etapa 2: Producción (Production Stage) ---
# Usamos una imagen de servidor web Nginx, que es muy ligera y eficiente
FROM nginx:1.25-alpine

# Copiamos los archivos estáticos construidos desde la etapa 'builder'
# La construcción de Vite se encuentra en la carpeta /app/dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración personalizada de Nginx (la crearemos en el siguiente paso)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80, que es el puerto por defecto de Nginx
EXPOSE 80

# El comando por defecto de la imagen de Nginx ya se encarga de iniciar el servidor
CMD ["nginx", "-g", "daemon off;"]