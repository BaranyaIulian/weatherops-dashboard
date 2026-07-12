FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update && \
    apt-get install -y \
      git \
      curl \
      ca-certificates \
      gnupg \
      docker.io \
      nodejs \
      npm && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    rm kubectl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER jenkins