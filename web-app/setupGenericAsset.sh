#!/bin/bash

IAM=$USER
#echo $IAM

repository="https://github.com/bmos299/Blockchain-for-maintaining-Digital-Assets.git"
#localFolder="/Users/parzy/src/DemoApp/Blockchain-for-maintaining-Digital-Assets/web-app/"

#git clone "$repository" "$localFolder"
git clone "$repository"

#echo "Open another terminal window and make sure the client side images and/or server configuration files are loaded.  Are you ready?"
#select yn in "Yes" "No"; do
#    case $yn in
#        Yes ) break;;
#        No ) exit;;
#    esac
#done

cd Blockchain-for-maintaining-Digital-Assets/web-app/
echo "changing directories"

echo "What is the customer name? Use this as your folder name as well in the next step."
read customer

echo "Opening Browser window. Put your images in with the following folder structure customer/images. ex $customer/images"
echo "Rename them to favicon.ico & logo.png. Enter 1 to continue, 2 to exit. Proceed?"

#open the sales box folder
open https://ibm.ent.box.com/folder/74931560016

select yn in "Yes" "No"; do
    case $yn in
        Yes ) break;;
        No ) exit;;
    esac
done


#Go to blockchainsa account, switch to Barry’s via drop down, and namespace Blockapps. 
#Note: This assumes you put logo.png and favicon.ico in the directory below. 

#Set the namespace that we are working in..
kubectl config set-context --current --namespace=genericasset


#echo "Open another terminal window and make sure the client side images and/or server configuration files are loaded"
#select yn in "Yes" "No"; do
#    case $yn in
#        Yes ) break;;
#        No ) exit;;
#    esac
#done


# changing server side connection profile and configuration file
# Note: This isn't as common so uncomment if this is desired and make sure you create the files properly

#kubectl delete configmap configuration
#kubectl create configmap configuration --from-file=./config.json --from-file=./connection_profile.json

# changing client side images
#
#Get rid of the old mappings
kubectl delete configmap images
kubectl delete configmap assets

#uncomment if you want to get images from local
#kubectl create configmap assets --from-file=./client/src/assets/logo.png
#kubectl create configmap images --from-file=./client/public/images/favicon.ico

#open https://ibm.ent.box.com/folder/74931560016/$customer/images/logo.png

#uncomment if you want to get images from box
kubectl create configmap assets --from-file=/Users/$IAM/Box/Sales/$customer/images/
kubectl create configmap images --from-file=/Users/$IAM/Box/Sales/$customer/images/

#Delete all the running pods
kubectl delete -f Kubernetes-deployment.yaml

#need to wait a minute to let the pods come down or it will give an error.
echo "need to wait to tear down pods"
sleep 2m
kubectl apply -f kubernetes-deployment.yaml


#while true; do
#    kubectl apply -f kubernetes-deployment.yaml
##    EC=$?
#    if [ $EC -eq 0 ]; then
#        echo "deployment successful"
#        break
#    fi
#    echo "...waiting for the service to come up"
#    sleep 10
#done

echo "Applications modifications successful"

open http://52.117.161.89:30005/#/

