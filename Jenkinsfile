pipeline {
    agent any

    environment {
        IMAGE_NAME = 'weatherops-dashboard'
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_NAMESPACE = 'weatherops'
        K8S_DEPLOYMENT = 'weatherops-dashboard'
        K8S_CONTAINER = 'weatherops-dashboard'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                dir('app') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running automated tests...'
                dir('app') {
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )
                ]) {
                    sh '''
                        docker build \
                          -t docker.io/$DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG \
                          -t docker.io/$DOCKERHUB_USERNAME/$IMAGE_NAME:latest \
                          .
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

                        docker push docker.io/$DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG
                        docker push docker.io/$DOCKERHUB_USERNAME/$IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying application to Kubernetes...'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_PASSWORD'
                    )
                ]) {
                    sh '''
                        kubectl set image deployment/$K8S_DEPLOYMENT \
                          $K8S_CONTAINER=docker.io/$DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG \
                          -n $K8S_NAMESPACE

                        kubectl rollout status deployment/$K8S_DEPLOYMENT \
                          -n $K8S_NAMESPACE \
                          --timeout=180s
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the logs above.'
        }

        always {
            echo 'Cleaning local Docker images if possible...'
            sh '''
                docker image prune -f || true
            '''
        }
    }
}