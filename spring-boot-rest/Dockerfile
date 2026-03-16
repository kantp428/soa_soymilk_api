FROM maven:3.8-openjdk-17 AS build
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY src src

RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
