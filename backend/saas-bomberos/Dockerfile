# Build multi-stage: compila con Maven+JDK y corre solo con un JRE
# liviano, para que la imagen final sea chica (importante en el plan
# free de Render, que limita recursos).

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Cachear dependencias: copiar solo el pom primero para que Docker no
# vuelva a descargar todo cuando cambia el código fuente.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render inyecta PORT; application.properties lo lee vía ${PORT:8080}.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
