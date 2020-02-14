#!/bin/bash
echo "Preparing deploy to: /home/ec2-user/capadmin-docker/api"

cd dist
cp ../{yarn.lock,package.json} .
tar -zcvf ../capadmin-api.dist.tar.gz .
cd -
echo "Package uploaded to /home/ec2-user/capadmin-docker/tmp"
scp capadmin-api.dist.tar.gz ec2-user@3.89.79.145:/home/ec2-user/capadmin-docker/tmp
echo "Copiying to /home/ec2-user/capadmin-docker/api"
ssh ec2-user@3.89.79.145 tar -xvzf /home/ec2-user/capadmin-docker/tmp/capadmin-api.dist.tar.gz -C /home/ec2-user/capadmin-docker/api
echo "Restarting container!"
ssh ec2-user@3.89.79.145 "cd /home/ec2-user/capadmin-docker && docker-compose up --detach --build --force-recreate"
echo "Done"
