###RUN GUIDE

docker run --rm -v "${PWD}:/app" -w /app -p 8082:8082 maven:3.8-openjdk-17 mvn spring-boot:run

docker run --rm `          
-v "${PWD}:/app" `
-v "${HOME}\.m2:/root/.m2" `
-w /app `
-p 8082:8082 `
maven:3.8-openjdk-17 `
mvn spring-boot:run