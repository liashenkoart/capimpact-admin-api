pipeline {
  agent any

  environment {
    BUILD_DIR           = 'dist'
    DOCKER_IMAGE        = ''
    COMMIT_SHA          = ''
    DEVELOP_BRANCH      = 'develop'
    STAGING_BRANCH      = 'staging'
    CREDENTIAL_ID       = 'vavbot-bitbucket-set'

    GIT_COMMIT_AUTHOR   = ""
    GIT_COMMIT_SHA      = ""
    GIT_DESC            = ""

    DATABASE_USERNAME_DEV       = 'agens'
    DATABASE_PASSWORD_DEV       = credentials('capimpact-admin-api-db-password-dev')
    DATABASE_USERNAME_STAGING   = 'postgres'
    DATABASE_PASSWORD_STAGING   = credentials('capimpact-admin-api-db-password-staging')
  }

  stages {
    stage('setting up env') {
      steps {
        bitbucketStatusNotify ( buildState: 'INPROGRESS' )
        sh 'mkdir -p $WORKSPACE/.yarn-cache'
      }
    }

    stage('build using node:12-alpine') {
      agent {
        docker {
          image 'node:12-alpine'
          args '-v $WORKSPACE/.yarn-cache:/root/.yarn-cache -p 4001:4001'
        }
      }

      stages {
        stage('setup application dependencies') {
          steps {
              sh 'yarn config set cache-folder /root/.yarn-cache'
              // sh 'yarn global add @nestjs/cli'
	            sh 'apk add --no-cache git'
              sh 'yarn global add pegjs'
              sh 'yarn --pure-lockfile'
          }
        }

        stage('build application') {
          steps {
            sh 'CI=false yarn build'
          }
        }

        stage('make artifact') {
          steps {
            archiveArtifacts artifacts: "${BUILD_DIR}/**/*", fingerprint: true
          }
        }
      }
    }

    stage('creating capimpact-admin-api docker image and deploy develop') {
      when {
        branch DEVELOP_BRANCH
      }
      stages {
        stage('develop: build docker image') {
          steps {
            copyArtifacts filter: "${BUILD_DIR}/**/*", fingerprintArtifacts: true, projectName: '${JOB_NAME}', selector: specific('${BUILD_NUMBER}')
            script {
              docker.build(
                "visavis/capimpact-admin-api-dev:latest",
                "--build-arg DATABASE_HOST='172.26.0.2' --build-arg DATABASE_PORT='5432' --build-arg DATABASE_NAME='capdata' --build-arg DATABASE_PASSWORD='$DATABASE_PASSWORD_DEV' --build-arg DATABASE_USERNAME='$DATABASE_USERNAME_DEV' ."
              )
            }
          }
        }

        // Since host shared docker.socks with jenkins, doing compose is fine in this case
        stage('develop: docker-compose to remote server') {
          steps {
            sh 'mkdir -p __docker'
            dir('__docker') {
              git(
                url: 'https://vavbot@bitbucket.org/hpnairviz/capadmin-docker.git',
                credentialsId: CREDENTIAL_ID,
                branch: 'develop'
              )
              sh('docker-compose -p capimpact-admin up -d')
            }
          }
        }
      }
    }

    stage('creating capimpact-admin-api docker image and deploy staging') {
      when {
        branch STAGING_BRANCH
      }
      stages {
        stage('staging: build docker image') {
          steps {
            copyArtifacts filter: "${BUILD_DIR}/**/*", fingerprintArtifacts: true, projectName: '${JOB_NAME}', selector: specific('${BUILD_NUMBER}')
            script {
              docker.withServer("ssh://ec2-user@52.90.155.127") {
                docker.build(
                  "visavis/capimpact-admin-api-staging:latest",
                  "--build-arg DATABASE_HOST='35.153.253.163' --build-arg DATABASE_PORT='35432' --build-arg DATABASE_NAME='capdata' --build-arg  DATABASE_PASSWORD='$DATABASE_PASSWORD_STAGING' --build-arg DATABASE_USERNAME='$DATABASE_USERNAME_STAGING' --build-arg VD_TREE_SOCKET_PORT='4001' ."
                )
              }
            }
          }
        }

        stage('staging: docker-compose to remote server') {
          steps {
            withEnv(["DOCKER_HOST=ssh://ec2-user@52.90.155.127"]) {
              sh 'mkdir -p __docker'
              dir('__docker') {
                git(
                  url: 'https://vavbot@bitbucket.org/hpnairviz/capadmin-docker.git',
                  credentialsId: CREDENTIAL_ID,
                  branch: 'staging'
                )
                sh('docker-compose -p capimpact-admin up -d')
              }
            }
          }
        }
      }
    }
  }


  post {
    failure {
      bitbucketStatusNotify ( buildState: 'FAILED' )

      script {
        GIT_COMMIT_SHA = sh(returnStdout: true, script: 'git rev-parse HEAD')
        GIT_COMMIT_AUTHOR = sh(returnStdout: true, script: "git --no-pager show -s --format='%an' $GIT_COMMIT_SHA").trim()
        GIT_DESC = sh(returnStdout: true, script: 'git log --format="commit %H%nauthor %an <%aE>%n%n%B" -1').trim()
      }
      slackSend (color: '#ff0000', channel: "capadmin", message: "*$JOB_NAME #$BUILD_NUMBER deploy FAILURE!*\n\n```$GIT_DESC```\n:point_right: <$BUILD_URL|$JOB_NAME>")
    }
    success {
      bitbucketStatusNotify ( buildState: 'SUCCESSFUL' )

      script {
        GIT_COMMIT_SHA = sh(returnStdout: true, script: 'git rev-parse HEAD')
        GIT_COMMIT_AUTHOR = sh(returnStdout: true, script: "git --no-pager show -s --format='%an' $GIT_COMMIT_SHA").trim()
        GIT_DESC = sh(returnStdout: true, script: 'git log --format="commit %H%nauthor %an <%aE>%n%n%B" -1').trim()
      }
      slackSend (color: '#BDFFC3', channel: "capadmin", message: "*$JOB_NAME #$BUILD_NUMBER deploy done!*\n\n```$GIT_DESC```\n:point_right: <$BUILD_URL|$JOB_NAME>")
    }
  }
}
