# Etapa de Compilación
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Copiar el wrapper de maven y dependencias de compilación
COPY .mvn/ .mvn/
COPY mvnw mvnw
COPY pom.xml pom.xml

# Dar permisos de ejecución y descargar dependencias básicas (go-offline)
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src/ src/
RUN ./mvnw clean package -DskipTests

# Etapa de Ejecución
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
