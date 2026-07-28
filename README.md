# WeatherOps Dashboard

WeatherOps Dashboard este proiectul meu de DevOps. Aplicația afișează date meteo reale pentru un oraș și folosește mai multe tehnologii studiate: Docker, Kubernetes, Jenkins, Prometheus, Grafana, Elasticsearch și Kibana.

Datele meteo sunt preluate din API-ul public Open-Meteo.

## Funcționalități

- căutare meteo după numele orașului;
- temperatură actuală și temperatură resimțită;
- umiditate, presiune și precipitații;
- viteza și direcția vântului;
- descrierea condițiilor meteo;
- istoric al căutărilor;
- mod mock pentru teste;
- health check și readiness check;
- metrici Prometheus;
- loguri structurate;
- autoscaling Kubernetes;
- deployment și rollback prin Jenkins.

## Arhitectură

```text
Utilizator
    |
    v
Frontend HTML / CSS / JavaScript
    |
    v
Node.js + Express
    |
    +----> Open-Meteo API
    |
    +----> Prometheus ----> Grafana
    |
    +----> Fluent Bit ----> Elasticsearch ----> Kibana

GitHub
    |
    v
Jenkins
    |
    +----> Teste
    +----> Docker Build
    +----> Docker Hub
    +----> Kubernetes
    +----> Rollback
```

## Tehnologii folosite

- Node.js și Express;
- HTML, CSS și JavaScript;
- Axios și Open-Meteo;
- Jest și Supertest;
- Docker și Docker Compose;
- Docker Hub;
- Jenkins;
- Kubernetes și Minikube;
- Helm;
- Prometheus și Grafana;
- Fluent Bit, Elasticsearch și Kibana.

## Structura proiectului

```text
weatherops-dashboard/
├── app/                  # codul aplicației și testele
├── k8s/                  # manifestele Kubernetes
├── logging/              # Elasticsearch, Kibana și Fluent Bit
├── jenkins/              # imaginea Jenkins
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

# Rulare locală

## Instalarea dependențelor

```bash
cd app
npm install
```

## Configurare

```bash
cp .env.example .env
```

Pentru date reale:

```env
MOCK_MODE=false
OPEN_METEO_GEOCODING_URL=https://geocoding-api.open-meteo.com/v1/search
OPEN_METEO_FORECAST_URL=https://api.open-meteo.com/v1/forecast
OPEN_METEO_LANGUAGE=ro
```

Pentru date simulate:

```env
MOCK_MODE=true
```

Open-Meteo nu necesită cheie API pentru modul folosit în proiect.

## Pornirea aplicației

```bash
npm start
```

Aplicația este disponibilă la:

```text
http://localhost:3000
```

# Teste automate

```bash
cd app
npm test
```

Rezultatul așteptat:

```text
Test Suites: 6 passed
Tests:       14 passed
```

Testele rulează în mod mock pentru a nu depinde de internet.

# Docker

## Construirea imaginii

```bash
docker build -t weatherops-dashboard:local .
```

## Pornirea containerului

```bash
docker run --rm \
  -p 3000:3000 \
  -e MOCK_MODE=false \
  weatherops-dashboard:local
```

## Docker Compose

```bash
docker compose up --build -d
```

Verificare:

```bash
docker compose ps
docker compose logs -f
```

Oprire:

```bash
docker compose down
```

## Docker Hub

Imaginea este publicată la:

```text
docker.io/iulianbaranya/weatherops-dashboard
```

Descărcare:

```bash
docker pull iulianbaranya/weatherops-dashboard:latest
```

Jenkins publică și taguri bazate pe numărul buildului, de exemplu:

```text
iulianbaranya/weatherops-dashboard:10
```

# Kubernetes

## Pornirea Minikube

```bash
minikube start \
  --driver=docker \
  --cpus=4 \
  --memory=8192
```

Verificare:

```bash
minikube status
kubectl get nodes
```

## Aplicarea manifestelor

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

Verificare:

```bash
kubectl get pods -n weatherops
kubectl get service -n weatherops
kubectl get hpa -n weatherops
```

## Accesarea aplicației

```bash
kubectl port-forward \
  svc/weatherops-service \
  8081:80 \
  -n weatherops
```

Aplicația este disponibilă la:

```text
http://localhost:8081
```

# Endpoint-uri

| Endpoint | Rol |
|---|---|
| `/health` | verifică dacă aplicația rulează |
| `/ready` | verifică dacă aplicația poate primi trafic |
| `/version` | afișează versiunea aplicației |
| `/weather?city=Bucharest` | afișează vremea |
| `/history` | afișează istoricul |
| `/metrics` | expune metricile Prometheus |

Exemple:

```bash
curl http://localhost:8081/health
curl http://localhost:8081/ready
curl "http://localhost:8081/weather?city=Bucharest"
curl http://localhost:8081/history
curl http://localhost:8081/metrics
```

În răspunsul meteo trebuie să apară:

```json
"source": "open-meteo"
```

# Jenkins CI/CD

Pipeline-ul este definit în `Jenkinsfile`.

Etapele principale sunt:

1. checkout din GitHub;
2. instalarea dependențelor;
3. rularea testelor;
4. construirea imaginii Docker;
5. push în Docker Hub;
6. deployment în Kubernetes;
7. verificarea rollout-ului;
8. aplicarea HPA și ServiceMonitor;
9. rollback automat în caz de eroare.

Credentialul necesar în Jenkins:

```text
dockerhub-credentials
```

Pornirea Jenkins:

```bash
docker start jenkins-weatherops
```

Acces:

```text
http://localhost:9090
```

Pornirea unui build:

```text
Dashboard
→ weatherops-dashboard
→ Build Now
→ Console Output
```

Rezultatul dorit:

```text
Finished: SUCCESS
```

# Monitoring

Aplicația expune metricile la:

```text
/metrics
```

## Instalare Prometheus și Grafana

```bash
helm repo add prometheus-community \
  https://prometheus-community.github.io/helm-charts

helm repo update
```

```bash
helm install prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

Aplicarea ServiceMonitor:

```bash
kubectl apply -f k8s/servicemonitor.yaml
```

## Prometheus

```bash
kubectl port-forward \
  svc/prometheus-stack-kube-prom-prometheus \
  9090:9090 \
  -n monitoring
```

Acces:

```text
http://localhost:9090
```

Exemple de metrici:

```promql
weatherops_http_requests_total
weatherops_weather_requests_total
```

## Grafana

```bash
kubectl port-forward \
  svc/prometheus-stack-grafana \
  3001:80 \
  -n monitoring
```

Acces:

```text
http://localhost:3001
```

# Logging

Pentru centralizarea logurilor sunt folosite:

```text
WeatherOps
    |
    v
Fluent Bit
    |
    v
Elasticsearch
    |
    v
Kibana
```

Aplicarea componentelor:

```bash
kubectl apply -f logging/namespace.yaml
kubectl apply -f logging/elasticsearch.yaml
kubectl apply -f logging/kibana.yaml
kubectl apply -f logging/fluent-bit-rbac.yaml
kubectl apply -f logging/fluent-bit-configmap.yaml
kubectl apply -f logging/fluent-bit-daemonset.yaml
```

Verificare:

```bash
kubectl get pods -n logging
```

## Elasticsearch

```bash
kubectl port-forward \
  svc/elasticsearch \
  9200:9200 \
  -n logging
```

Verificarea indexurilor:

```bash
curl "http://localhost:9200/_cat/indices?v"
```

Indexul aplicației este:

```text
weatherops-*
```

## Kibana

```bash
kubectl port-forward \
  svc/kibana \
  5601:5601 \
  -n logging
```

Acces:

```text
http://localhost:5601
```

Data View:

```text
weatherops-*
```

Exemple de căutări:

```text
event: "weather_search"
source: "open-meteo"
status_code: 404
```

# Autoscaling

Aplicația folosește Horizontal Pod Autoscaler.

Configurația:

```text
Minimum: 2 poduri
Maximum: 6 poduri
Metrică: CPU
```

Activarea Metrics Server:

```bash
minikube addons enable metrics-server
```

Verificare:

```bash
kubectl top pods -n weatherops
kubectl get hpa -n weatherops
```

În timpul unui test de încărcare, Kubernetes creează automat poduri noi. După oprirea traficului, aplicația revine la două poduri.

# Rollback

Pentru testarea rollback-ului am folosit intenționat o imagine Docker inexistentă.

Podurile noi au intrat în:

```text
ImagePullBackOff
```

Revenirea la versiunea anterioară:

```bash
kubectl rollout undo \
  deployment/weatherops-dashboard \
  -n weatherops
```

Verificare:

```bash
kubectl rollout status \
  deployment/weatherops-dashboard \
  -n weatherops \
  --timeout=600s
```

Istoric:

```bash
kubectl rollout history \
  deployment/weatherops-dashboard \
  -n weatherops
```

Jenkinsfile conține și rollback automat.

