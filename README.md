# WeatherOps Dashboard

WeatherOps Dashboard este o aplicație web DevOps-ready care afișează date meteo, expune metrici Prometheus, trimite loguri structurate și este livrată automat prin Jenkins, Docker și Kubernetes.

## Rulare cu Docker Compose

Pentru pornirea aplicației local în container:


docker compose up --build

## Docker Hub image

Imaginea aplicației este publicată în Docker Hub:

```text
docker.io/iulianbarnaya/weatherops-dashboard:1.0.0

## Jenkins CI/CD

Pipeline-ul Jenkins este definit în `Jenkinsfile`.

Etape principale:

- checkout cod sursă;
- instalare dependențe Node.js;
- rulare teste automate;
- build imagine Docker;
- push imagine în Docker Hub;
- deploy în Kubernetes;
- verificare rollout.

Credential necesar în Jenkins:

```text
dockerhub-credentials