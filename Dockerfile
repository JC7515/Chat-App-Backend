#El FROM sirve para indicar la imagen base de nuestro Dockerfile
FROM node:18-alpine

#El WORKDIR sera el directiorio en donde pondremos todo nuestro proyecto o servidor 
WORKDIR /app

#El COPY nos servira para poder copiar los archivos package.json y packege-lock.json a nuestro directorio de trabajo
# o WORKDIR, el proceso para pasar un archivo a nuestro directiorio de trabajo es el siguiente: primero indicamos el
# nombre del archivo que queremos pasar al directorio de trabajo y luego de eso ponemos ./ que indica a docker que 
# copie el archivo indicado en el directorio de trabajo.
#COPY package.json ./
#COPY package-lock.json ./

# El codigo de abajo es una forma mas optima de hacer lo mismo que se arriba con los archivos package.json, ya que aqui
# solo es nesesario poner un * despues de package, para indicar que todo archivo que comienze en package y termine en
# .json sera copiado y enviando al directorio de trabajo 
COPY package*.json ./

# Despues de haber copiado los archivos package.json en el directorio de trabajo, podemos proceder a instalar las 
# dependencia que se encuentra indicadas en el archivo package.json, de esta forma podremos obtener todas la tecnologias
# que necesita nuestro proyecto para funcionar
RUN npm install
#RUN apt-get update && apt-get install -y bash

# Con este codigo copiamos todos los archivos y la logica que se encuentra dentro de nuestro directorio src al 
# directorio de trabajo de docker
#COPY /src ./

#El Codigo de abajo es una forma mas optima de hacer los mismo que en el codigo de arriba con el src, ya que lo que 
#indicamos con el primer punto es dicerle a docker que copie toda la informacion del proyecto dentro del container
# y luego el siguiente punto sirve para decirle a docker que toda esa informacion vaya al directorio de trabajo.
COPY . .


#RUN echo "172.17.0.2 tododataBase" >> /etc/hosts


# EXPOSE 4500

#EL comando CMD nos servira para poder ejecutar comandos dentro del contenedor de docker, y en este caso iniciar nuestro
#servidor, tenindo que poner dentro de una lista como se ve abajo primero el comando a ejecutar y luego sus parametros.

# CMD ["npm", "start"]
# CMD sh -c 'echo "172.26.0.2 dbapp" >> /etc/hosts && npm start'
