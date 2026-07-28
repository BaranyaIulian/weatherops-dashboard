pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()

        timeout(
            time: 30,
            unit: 'MINUTES'
        )

        buildDiscarder(
            logRotator(
                numToKeepStr: '10'
            )
        )
    }

    environment {
        DOCKER_IMAGE = 'docker.io/iulianbaranya/weatherops-dashboard'
        IMAGE_TAG = "${BUILD_NUMBER}"

        K8S_NAMESPACE = 'weatherops'
        K8S_DEPLOYMENT = 'weatherops-dashboard'
        K8S_CONTAINER = 'weatherops-dashboard'
        K8S_SERVICE = 'weatherops-service'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'

                checkout scm

                sh '''
                    echo "Git commit:"
                    git log -1 --oneline
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'

                dir('app') {
                    sh '''
                        set -eu
                        npm ci
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running automated tests...'

                dir('app') {
                    sh '''
                        set -eu
                        npm test
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image ${DOCKER_IMAGE}:${IMAGE_TAG}..."

                sh '''
                    set -eu

                    docker build \
                      -t "$DOCKER_IMAGE:$IMAGE_TAG" \
                      -t "$DOCKER_IMAGE:latest" \
                      .
                '''
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
                        set -eu

                        printf '%s' "$DOCKERHUB_PASSWORD" |
                          docker login \
                            --username "$DOCKERHUB_USERNAME" \
                            --password-stdin

                        docker push "$DOCKER_IMAGE:$IMAGE_TAG"
                        docker push "$DOCKER_IMAGE:latest"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying application to Kubernetes...'

                script {
                    /*
                     * Salvăm imaginea stabilă înainte de deployment.
                     * Va fi folosită ca fallback dacă rollback-ul normal
                     * nu poate fi finalizat.
                     */
                    def previousImage = sh(
                        returnStdout: true,
                        script: '''
                            kubectl get deployment "$K8S_DEPLOYMENT" \
                              -n "$K8S_NAMESPACE" \
                              -o jsonpath='{.spec.template.spec.containers[0].image}' \
                              2>/dev/null || true
                        '''
                    ).trim()

                    if (previousImage) {
                        echo "Previous stable image: ${previousImage}"
                    } else {
                        echo 'No previous deployment was found.'
                    }

                    /*
                     * Aplicăm configurația Kubernetes.
                     *
                     * Deployment-ul este modificat local astfel încât
                     * imaginea din manifest să fie direct imaginea buildului
                     * curent. În acest fel este creată o singură revizie nouă.
                     */
                    sh '''
                        set -eu

                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/configmap.yaml
                        kubectl apply -f k8s/service.yaml

                        kubectl set image \
                          -f k8s/deployment.yaml \
                          "$K8S_CONTAINER=$DOCKER_IMAGE:$IMAGE_TAG" \
                          --local \
                          -o yaml |
                          kubectl apply -f -

                        kubectl annotate \
                          deployment/"$K8S_DEPLOYMENT" \
                          kubernetes.io/change-cause="Jenkins build $BUILD_NUMBER - image $IMAGE_TAG - commit ${GIT_COMMIT:-unknown}" \
                          -n "$K8S_NAMESPACE" \
                          --overwrite
                    '''

                    def rolloutStatus = sh(
                        returnStatus: true,
                        script: '''
                            kubectl rollout status \
                              deployment/"$K8S_DEPLOYMENT" \
                              -n "$K8S_NAMESPACE" \
                              --timeout=600s
                        '''
                    )

                    if (rolloutStatus != 0) {
                        echo 'Deployment failed. Collecting diagnostics...'

                        sh '''
                            set +e

                            echo
                            echo "========================================"
                            echo "DEPLOYMENT"
                            echo "========================================"

                            kubectl describe \
                              deployment/"$K8S_DEPLOYMENT" \
                              -n "$K8S_NAMESPACE"

                            echo
                            echo "========================================"
                            echo "PODS"
                            echo "========================================"

                            kubectl get pods \
                              -n "$K8S_NAMESPACE" \
                              -l app=weatherops-dashboard \
                              -o wide

                            echo
                            echo "========================================"
                            echo "POD IMAGES"
                            echo "========================================"

                            kubectl get pods \
                              -n "$K8S_NAMESPACE" \
                              -l app=weatherops-dashboard \
                              -o custom-columns='POD:.metadata.name,IMAGE:.spec.containers[0].image,READY:.status.containerStatuses[0].ready,STATUS:.status.phase'

                            echo
                            echo "========================================"
                            echo "RECENT EVENTS"
                            echo "========================================"

                            kubectl get events \
                              -n "$K8S_NAMESPACE" \
                              --sort-by=.metadata.creationTimestamp |
                              tail -n 40

                            echo
                            echo "========================================"
                            echo "ROLLOUT HISTORY"
                            echo "========================================"

                            kubectl rollout history \
                              deployment/"$K8S_DEPLOYMENT" \
                              -n "$K8S_NAMESPACE"

                            echo
                            echo "========================================"
                            echo "APPLICATION LOGS"
                            echo "========================================"

                            for pod in $(
                                kubectl get pods \
                                  -n "$K8S_NAMESPACE" \
                                  -l app=weatherops-dashboard \
                                  -o name
                            ); do
                                echo
                                echo "Logs for $pod"

                                kubectl logs "$pod" \
                                  -n "$K8S_NAMESPACE" \
                                  -c "$K8S_CONTAINER" \
                                  --tail=100 || true
                            done
                        '''

                        if (previousImage) {
                            echo 'Starting automatic Kubernetes rollback...'

                            def rollbackStatus = sh(
                                returnStatus: true,
                                script: '''
                                    kubectl rollout undo \
                                      deployment/"$K8S_DEPLOYMENT" \
                                      -n "$K8S_NAMESPACE"

                                    kubectl rollout status \
                                      deployment/"$K8S_DEPLOYMENT" \
                                      -n "$K8S_NAMESPACE" \
                                      --timeout=600s
                                '''
                            )

                            /*
                             * Fallback suplimentar:
                             * dacă rollout undo nu funcționează, setăm explicit
                             * imaginea care rula înaintea acestui build.
                             */
                            if (rollbackStatus != 0) {
                                echo 'Normal rollback failed. Restoring the previous image explicitly...'

                                withEnv([
                                    "PREVIOUS_IMAGE=${previousImage}"
                                ]) {
                                    sh '''
                                        set -eu

                                        kubectl set image \
                                          deployment/"$K8S_DEPLOYMENT" \
                                          "$K8S_CONTAINER=$PREVIOUS_IMAGE" \
                                          -n "$K8S_NAMESPACE"

                                        kubectl rollout status \
                                          deployment/"$K8S_DEPLOYMENT" \
                                          -n "$K8S_NAMESPACE" \
                                          --timeout=600s
                                    '''
                                }
                            }

                            sh '''
                                echo
                                echo "State after rollback:"

                                kubectl get deployment \
                                  "$K8S_DEPLOYMENT" \
                                  -n "$K8S_NAMESPACE"

                                kubectl get pods \
                                  -n "$K8S_NAMESPACE" \
                                  -l app=weatherops-dashboard \
                                  -o wide

                                echo
                                echo "Restored image:"

                                kubectl get deployment \
                                  "$K8S_DEPLOYMENT" \
                                  -n "$K8S_NAMESPACE" \
                                  -o jsonpath='{.spec.template.spec.containers[0].image}'

                                echo
                            '''

                            error(
                                'New deployment failed. The previous stable version was restored.'
                            )
                        }

                        error(
                            'Deployment failed and no previous version was available for rollback.'
                        )
                    }

                    echo 'Application rollout completed successfully.'

                    /*
                     * Aplicăm HPA după ce Deployment-ul este stabil.
                     */
                    sh '''
                        set -eu

                        if [ -f k8s/hpa.yaml ]; then
                            echo "Applying Horizontal Pod Autoscaler..."
                            kubectl apply -f k8s/hpa.yaml
                        else
                            echo "k8s/hpa.yaml not found. Skipping HPA."
                        fi

                        # ServiceMonitor este aplicat numai dacă există
                        # manifestul și CRD-ul Prometheus Operator.
                        if [ -f k8s/servicemonitor.yaml ]; then
                            if kubectl api-resources \
                                --api-group=monitoring.coreos.com \
                                --no-headers 2>/dev/null |
                                grep -q 'servicemonitors'; then

                                echo "Applying ServiceMonitor..."
                                kubectl apply -f k8s/servicemonitor.yaml
                            else
                                echo "ServiceMonitor CRD is unavailable. Skipping it."
                            fi
                        else
                            echo "k8s/servicemonitor.yaml not found. Skipping it."
                        fi
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying the deployed application...'

                sh '''
                    set -eu

                    echo
                    echo "Deployment image:"

                    kubectl get deployment "$K8S_DEPLOYMENT" \
                      -n "$K8S_NAMESPACE" \
                      -o jsonpath='{.spec.template.spec.containers[0].image}'

                    echo
                    echo

                    echo "Deployment status:"

                    kubectl get deployment "$K8S_DEPLOYMENT" \
                      -n "$K8S_NAMESPACE"

                    echo
                    echo "Application pods:"

                    kubectl get pods \
                      -n "$K8S_NAMESPACE" \
                      -l app=weatherops-dashboard \
                      -o wide

                    echo
                    echo "Service:"

                    kubectl get service "$K8S_SERVICE" \
                      -n "$K8S_NAMESPACE"

                    echo
                    echo "HPA:"

                    kubectl get hpa \
                      -n "$K8S_NAMESPACE" || true

                    echo
                    echo "Rollout history:"

                    kubectl rollout history \
                      deployment/"$K8S_DEPLOYMENT" \
                      -n "$K8S_NAMESPACE"
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded."
            echo "Published image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
        }

        failure {
            echo 'Pipeline failed. Review the stage logs and Kubernetes diagnostics.'
        }

        always {
            echo 'Cleaning local Docker resources...'

            sh '''
                docker logout || true

                docker image rm \
                  "$DOCKER_IMAGE:$IMAGE_TAG" \
                  "$DOCKER_IMAGE:latest" \
                  2>/dev/null || true

                docker image prune -f || true
            '''
        }
    }
}
