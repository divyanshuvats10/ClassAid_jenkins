pipeline {
    agent any

    environment {
        IMAGE_NAME_FRONTEND = "classaid-frontend"
        IMAGE_NAME_BACKEND = "classaid-backend"
    }

    stages {
        stage('Clone repository') {
            steps {
                // Clone the repository from the correct branch (main)
                git branch: 'main', url: 'https://github.com/divyanshuvats10/ClassAid_jenkins.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build the Docker images for frontend and backend
                    sh 'set -e' // Exit immediately if a command exits with a non-zero status
                    sh 'docker build -t $IMAGE_NAME_FRONTEND -f Dockerfile .'
                    sh 'docker build -t $IMAGE_NAME_BACKEND -f backend/Dockerfile ./backend'
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                script {
                    // Clean up existing containers and start with fresh build
                    sh 'docker-compose down || true'  // In case no containers are running
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        success {
            echo '✅ ClassAid Deployed Successfully!'
        }
        failure {
            echo '❌ Something went wrong during deployment.'
        }
    }
}
