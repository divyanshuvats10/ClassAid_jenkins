pipeline {
    agent any

    environment {
        IMAGE_NAME_FRONTEND = "classaid-frontend"
        IMAGE_NAME_BACKEND = "classaid-backend"
    }

    stages {
        stage('Clone repository') {
            steps {
                git 'https://github.com/divyanshuvats10/ClassAid_jenkins.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t $IMAGE_NAME_FRONTEND -f Dockerfile .'
                    sh 'docker build -t $IMAGE_NAME_BACKEND -f backend/Dockerfile ./backend'
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                script {
                    sh 'docker-compose down'
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
