[![Build Status](https://travis-ci.org/IBM/Blockchain-for-maintaining-Digital-Assets.svg?branch=master)](https://travis-ci.org/IBM/Blockchain-for-maintaining-Digital-Assets)

# Blockchain for maintaining Digital Assets

In this code pattern, we will be building a digital asset management application by creating and deploying a smart contract on a Hyperledger Fabric Network created on IBM Blockchain Platform. We will then interact with this application via a user interface created using VueJS.

Digital Asset Management Systems ensure that operations are only performed on a digital asset by individuals (or organizations) that have the right access rights and permissions for the asset. The digital asset is defined as the content (an image, a music file, a document, a video file, etc.) and its metadata. The metadata could be as simple as the name of the asset, the name of the owner of the asset and the date of creation of the asset, or it could be something more complex, such as extracted speech from a video (subtitles). In any Digital Asset Management system, there can be any number of users and these users can have the ability to perform various actions on the asset in the system based on the permissions they have. Examples of such actions that are being covered in this developer pattern are:

1. User registration and user login.
2. Viewing all existing assets in the system.
3. Viewing assets owned by the user that is currently logged in.
4. Uploading a new asset.
5. Deleting an existing asset.
6. Suggesting edits to an existing asset.
7. Viewing suggested edits for an asset that is owned by the user that is currently logged in.
8. Approving or denying suggeested edits for an asset that is owned by the user that is currently logged in.
9. Allowing other users the permission to update an asset owned by the user that is currently logged in.
10. Assigning another user as the owner of an asset that is owned by the user that is currently logged in.
11. Downloading assets.

The large number of users (participants) in this use case, as well as the different kinds of actions (transactions) that can be executed indicate that this is a good use case for Blockchain. Blockchain will also allow for the history of the transactions to be maintained in the ledger, thereby ensuring that there is always a chain of record for any changes that have been made to any asset.

We will start by packaging the Node.js smart contract using the IBM Blockchain Platform Extension for VS Code. Next, we will create a Hyperledger Fabric Network on IBM Blockchain Platform where we will install and instantiate the smart contract. We will also set up an IBM Cloud Object Storage instance, where we can retain the digital assets uploaded to the Digital Asset Management application, and a fake SMTP testing server using Mailtrap.io to test the email notifications sent by the application. Finally, the VueJS web application, which makes use of the Hyperledger Fabric SDK, can be used to interact with the network.

When you have completed this code pattern, you will understand how to:

* Package a blockchain smart contract using the IBM Blockchain Platform Extension for VS Code.
* Set up a Hyperledger Fabric network on IBM Blockchain Platform.
* Install and instantiate a smart contract package through IBM Blockchain Platform.
* Set up an instance of the IBM Cloud Object Storage service and connect it with the Node.js application.
* Test the blockchain network by executing a Node.js application with the Hyperledger Fabric SDK to interact with the deployed network by issuing transactions. 


# Architecture flow

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/72009715-7288c980-3224-11ea-9a85-30a4aac1f5eb.png">
</p>

1. The Blockchain Operator sets up the IBM Blockchain Platform service.
2. The IBM Blockchain Platform service creates a Hyperledger Fabric network on an IBM Cloud Kubernetes Service, and the Blockchain Operator installs and instantiates the smart contract on the network.
3. The Node.js application server uses the Fabric SDK to interact with the deployed network on IBM Blockchain Platform, IBM Cloud Object Storage instance and the Mailtrap Server (fake SMTP testing server) and creates APIs for a web client.
4. The Vue.js client uses the Node.js application API to interact with the network.
5. The User interacts with the Vue.js web interface to interact with the digital asset management application.


# Included components

*   [IBM Blockchain Platform](https://www.ibm.com/cloud/blockchain-platform) gives you total control of your blockchain network with a user interface that can simplify and accelerate your journey to deploy and manage blockchain components on the IBM Cloud Kubernetes Service.
*   [IBM Cloud Kubernetes Service](https://www.ibm.com/cloud/container-service) creates a cluster of compute hosts and deploys highly available containers. A Kubernetes cluster lets you securely manage the resources that you need to quickly deploy, update, and scale applications.
*   [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) is designed to assist users in developing, testing, and deploying smart contracts - including connecting to Hyperledger Fabric environments.
*   [IBM Cloud Object Storage](https://www.ibm.com/cloud/object-storage) is a highly scalable cloud storage service, designed for high durability, resiliency and security.
*   [Mailtrap.io](https://mailtrap.io) is a test mail server solution that allows testing email notifications without sending them to the real users of your application.


## Featured technologies

*   [Hyperledger Fabric v1.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4/) is a platform for distributed ledger solutions, underpinned by a modular architecture that delivers high degrees of confidentiality, resiliency, flexibility, and scalability.
*   [Node.js](https://nodejs.org/en/) is an open source, cross-platform JavaScript run-time environment that executes server-side JavaScript code.
*   [Vue.js 2.6.10](https://vuejs.org) is an open-source JavaScript framework for building user interfaces and single-page applications.


## Prerequisites

* [IBM Cloud account](https://cloud.ibm.com/registration/?target=%2Fdashboard%2Fapps)
* [Node v8.x or v10.x and npm v6.x or greater](https://nodejs.org/en/download/)
* [VSCode version 1.38.0 or greater](https://code.visualstudio.com)
* [IBM Blockchain Platform Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform)


# Watch the video - Introduction and Demo

**Note: Click on the image below to view the video on YouTube. For Google Chrome, press the Ctrl key + the left mouse button and say `Open link`.**

[![](https://user-images.githubusercontent.com/8854447/72086129-6eb48000-32d4-11ea-8869-d6362dd7556a.png)](https://youtu.be/tfnRfDFWHUc)


# Running the application

Follow these steps to set up and run this code pattern. The steps are described in detail below.

## Steps

1. [Clone the repo](#1-clone-the-repo)
2. [Package the smart contract](#2-package-the-smart-contract)
3. [Create the Mailtrap server](#3-create-the-mailtrap-server)
4. [Create IBM Cloud services](#4-create-ibm-cloud-services)
5. [Build a network](#5-build-a-network)
6. [Deploy Blockchain for maintaining Digital Assets Smart Contract on the network](#6-deploy-blockchain-for-maintaining-digital-assets-smart-contract-on-the-network)
7. [Connect application to the network](#7-connect-application-to-the-network)
8. [Run the application](#8-run-the-application)


### 1. Clone the repo

Clone this repository in a folder your choice:

```
git clone https://github.com/IBM/Blockchain-for-maintaining-Digital-Assets.git
```


### 2. Package the smart contract

We will use the IBM Blockchain Platform extension on VS Code to package the smart contract.

* Open Visual Studio code and open the `contract` folder from `Blockchain-for-maintaining-Digital-Assets` repository that was cloned earlier. 
   **It is important that you are opening the `contract` folder and not the entire `Blockchain-for-maintaining-Digital-Assets` directory; otherwise you will see an error that states that it doesn't understand what programming language you are using.**

* Press the `F1` key to see the different VS code options. Choose `IBM Blockchain Platform: Package Open Project`.

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71910509-05036d00-3140-11ea-8b15-7c8aeb403974.png">
</p>

* Click the `IBM Blockchain Platform` extension button on the left. This will show the packaged contracts on top and the blockchain connections on the bottom.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/85961325-ae9d1b80-b977-11ea-89d9-4c9b2e627c59.png">
</p>

* Next, right click on the packaged contract (in this case, select blockchain-for-maintaining-digital-assets@0.0.1) to export it and choose `Export Package`.

* Choose a location on your machine and save the `.cds` file. We will use this packaged smart contract later to deploy on the IBM Blockchain Platform service.

Now, we will start setting up the different services required for configuring our Hyperledger Fabric network on the IBM Cloud and for running our application using this network.


### 3. Create the Mailtrap server

* Create the [Mailtrap server](https://mailtrap.io). You can sign up using your Google or Github account or using your email address. Once the account has been created and you have logged in, create a new inbox by typing in an inbox name and clicking on `Create Inbox`.

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/71910507-046ad680-3140-11ea-9317-aa9219ae1383.gif">
</p>


### 4. Create IBM Cloud services

* Create the [IBM Cloud Kubernetes Service](https://cloud.ibm.com/kubernetes/catalog/cluster). You can find the service in the `Catalog`. For this code pattern, we can use the `Free` cluster, and give it a name. Note, that the IBM Cloud allows one instance of a free cluster which expires after 30 days. **Note: it could take 20 minutes for the IBM Cloud Kubernetes Service setup to complete**.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71910506-046ad680-3140-11ea-9f4b-8bcb4d2a651b.gif">
</p>
<br>

* Create the [IBM Cloud Object Storage](https://cloud.ibm.com/catalog/services/cloud-object-storage) service on the IBM Cloud. You can find the service in the `Catalog`, and give it a name.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71918961-80b9e580-3151-11ea-8efc-8d4a08b55380.gif">
</p>
<br>

* Create the [IBM Blockchain Platform](https://cloud.ibm.com/catalog/services/blockchain-platform) service on the IBM Cloud. You can find the service in the `Catalog`, and give it a name.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71910502-046ad680-3140-11ea-9853-3598b9363d91.gif">
</p>
<br>

* After your kubernetes cluster is up and running, you can deploy your IBM Blockchain Platform on the cluster. Again - wait for the IBM Cloud Kubernetes service to indicate it was deployed. The IBM Blockchain Platform service walks through few steps and finds your cluster on the IBM Cloud to deploy the service on.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71910501-046ad680-3140-11ea-8440-9d2fef0be426.gif">
</p>
<br>

* Once the Blockchain Platform is deployed on the Kubernetes cluster, you can launch the console to start configuring your blockchain network.


### 5. Build a network

We will build a network as provided by the IBM Blockchain Platform [documentation](https://cloud.ibm.com/docs/services/blockchain/howto?topic=blockchain-ibp-console-build-network#ibp-console-build-network). This will include creating a channel with a single peer organization with its own MSP and CA (Certificate Authority), and an orderer organization with its own MSP and CA. We will create the respective identities to deploy peers and operate nodes.


#### Create your peer organization CA
  - Navigate to the <b>Nodes</b> tab in the left navigation and click <b>Add Certificate Authority +</b>.
  - Click <b>Create a Certificate Authority +</b> and click <b>Next</b>.
  - Give it a <b>CA display name</b> of `Org1 CA`, a <b>CA administrator enroll ID</b> of `admin` and a <b>CA administrator enroll secret</b> of `adminpw`, then click <b>Next</b>.
  - Review the summary and click <b>Add Certificate Authority</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85798060-cf146e00-b70a-11ea-856b-ef3264428fbc.gif">
</p>
<br>


#### Associate the peer organization CA admin identity
  - In the Nodes tab, select the <b>Org1 CA</b> once it is running (indicated by the green box in the tile).
  - Click <b>Associate identity</b> on the CA overview panel.
  - On the side panel, select the <b>Enroll ID</b> tab. 
  - Provide an <b>Enroll ID</b> of `admin` and an <b>Enroll secret</b> of `adminpw`. Use the default value of `Org1 CA Admin` for the <b>Identity display name</b>.
  - Click <b>Associate identity</b> to associate the `admin` identity with the <b>Org1 CA</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85799219-dfc5e380-b70c-11ea-80a6-afccb0e526fc.gif">
</p>
<br>


#### Use peer organization CA to register the peer and org1 admin identities
  - Select the <b>Org1 CA</b> Certificate Authority and ensure the `admin` identity that was created for the CA is visible in the table.
  - The next step is to register an admin for the organization "Org1". Click on the <b>Register User +</b> button. Give an <b>Enroll ID</b> of `org1admin` and an <b>Enroll secret</b> of `org1adminpw`. Set the <b>Type</b> for this identity as `admin`. Specify to <b>Use root affiliation</b>. Leave the <b>Maximum enrollments</b> field blank. Click <b>Next</b>.
  - Skip the section to add attributes to this user and click <b>Register user</b>.
  - Repeat the process to create an identity of the peer. Click on the <b>Register User +</b> button. Give an <b>Enroll ID</b> of `peer1` and an <b>Enroll secret</b> of `peer1pw`. Set the <b>Type</b> for this identity as `peer`. Specify to <b>Use root affiliation</b>. Leave the <b>Maximum enrollments</b> field blank. Click <b>Next</b>.
  - Skip the section to add attributes to this user and click <b>Register user</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85800394-e35a6a00-b70e-11ea-967a-f37334a685a3.gif">
</p>
<br>


#### Create the peer organization MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition +</b>.
  - Enter the <b>MSP display name</b> as `Org1MSP` and the <b>MSP ID</b> as `Org1MSP`. Click <b>Next</b>.
  - Specify `Org1 CA` as the <b>Root Certificate Authority</b>. Click <b>Next</b>.
  - Select the <b>New identity</b> tab. Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, i.e. `org1admin` and `org1adminpw` respectively. Then, give the <b>Identity name</b> as `Org1 Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and add the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Click <b>Next</b>.
  - Review all the information and click <b>Create MSP definition</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85800904-cbcfb100-b70f-11ea-9b95-376d9ef72caa.gif">
</p>
<br>


#### Create a peer
  - Navigate to the <b>Nodes</b> tab in the left navigation and click <b>Add peer +</b>.
  - Click <b>Create a peer +</b> and then click <b>Next</b>.
  - Give the <b>Peer display name</b> as `Peer Org1` and click <b>Next</b>.
  - On the next screen, select `Org1 CA` as the <b>Certificate Authority</b>. Then, give the <b>Peer enroll ID</b> and <b>Peer enroll secret</b> as `peer1` and `peer1pw` respectively. Select the <b>Organization MSP</b> as `Org1MSP`. Leave the <b>TLS CSR hostname</b> blank and select the highest value available in the drop-down for <b>Fabric version</b>, i.e. `2.1.1-0`. Click <b>Next</b>.
  - Provide `Org1 Admin` as the <b>Peer administrator identity</b> and click <b>Next</b>.
  - Review the summary and click <b>Add peer</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85802117-41d51780-b712-11ea-80b1-06710ec3207d.gif">
</p>
<br>


#### Create your orderer organization CA
  - Navigate to the <b>Nodes</b> tab in the left navigation and click <b>Add Certificate Authority +</b>.
  - Click <b>Create a Certificate Authority +</b> and click <b>Next</b>.
  - Give it a <b>CA display name</b> of `Orderer CA`, a <b>CA administrator enroll ID</b> of `admin` and a <b>CA administrator enroll secret</b> of `adminpw`, then click <b>Next</b>.
  - Review the summary and click <b>Add Certificate Authority</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85802348-c4f66d80-b712-11ea-801b-9f2fbbb66593.gif">
</p>
<br>


#### Associate the orderer organization CA admin identity
  - In the Nodes tab, select the <b>Orderer CA</b> once it is running (indicated by the green box in the tile).
  - Click <b>Associate identity</b> on the CA overview panel.
  - On the side panel, select the <b>Enroll ID</b> tab. 
  - Provide an <b>Enroll ID</b> of `admin` and an <b>Enroll secret</b> of `adminpw`. Use the default value of `Orderer CA Admin` for the <b>Identity display name</b>.
  - Click <b>Associate identity</b> to associate the `admin` identity with the <b>Orderer CA</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85802898-e2780700-b713-11ea-82c7-9ffc09686f0b.gif">
</p>
<br>


#### Use orderer organization CA to register orderer and orderer admin identities
  - Select the <b>Orderer CA</b> Certificate Authority and ensure the `admin` identity that was created for the CA is visible in the table.
  - The next step is to register an admin for the organization "Orderer". Click on the <b>Register User +</b> button. Give an <b>Enroll ID</b> of `ordereradmin` and an <b>Enroll secret</b> of `ordereradminpw`. Set the <b>Type</b> for this identity as `admin`. Specify to <b>Use root affiliation</b>. Leave the <b>Maximum enrollments</b> field blank. Click <b>Next</b>.
  - Skip the section to add attributes to this user and click <b>Register user</b>.
  - Repeat the process to create an identity of the orderer. Click on the <b>Register User +</b> button. Give an <b>Enroll ID</b> of `orderer` and an <b>Enroll secret</b> of `ordererpw`. Set the <b>Type</b> for this identity as `orderer`. Specify to <b>Use root affiliation</b>. Leave the <b>Maximum enrollments</b> field blank. Click <b>Next</b>.
  - Skip the section to add attributes to this user and click <b>Register user</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85803027-4995bb80-b714-11ea-81c7-b4b4cb2ec49d.gif">
</p>
<br>


#### Create the orderer organization MSP definition
  - Navigate to the <b>Organizations</b> tab in the left navigation and click <b>Create MSP definition +</b>.
  - Enter the <b>MSP display name</b> as `OrdererMSP` and the <b>MSP ID</b> as `OrdererMSP`. Click <b>Next</b>.
  - Specify `Orderer CA` as the <b>Root Certificate Authority</b>. Click <b>Next</b>.
  - Select the <b>New identity</b> tab. Give the <b>Enroll ID</b> and <b>Enroll secret</b> for your organization admin, i.e. `ordereradmin` and `ordereradminpw` respectively. Then, give the <b>Identity name</b> as `Orderer Admin`.
  - Click the <b>Generate</b> button to enroll this identity as the admin of your organization and add the identity to the wallet. Click <b>Export</b> to export the admin certificates to your file system. Click <b>Next</b>.
  - Review all the information and click <b>Create MSP definition</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85803287-caed4e00-b714-11ea-94e7-305880e6ba63.gif">
</p>
<br>


#### Create an orderer
  - Navigate to the <b>Nodes</b> tab in the left navigation and click <b>Add ordering service +</b>.
  - Click <b>Create an ordering service +</b> and then click <b>Next</b>.
  - Give the <b>Ordering service display name</b> as `Orderer` and click <b>Next</b>.
  - On the next screen, select `Orderer CA` as the <b>Certificate Authority</b>. Then, give the <b>Ordering service enroll ID</b> and <b>Ordering service enroll secret</b> as `orderer` and `ordererpw` respectively. Select the <b>Organization MSP</b> as `OrdererMSP`. Leave the <b>TLS CSR hostname</b> blank and select the highest value available in the drop-down for <b>Fabric version</b>, i.e. `2.1.1-0`. Click <b>Next</b>.
  - Provide `Orderer Admin` as the <b>Orderer administrator identity</b> and click <b>Next</b>.
  - Review the summary and click <b>Add ordering service</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85803547-5ff04700-b715-11ea-934f-943ffe0439b0.gif">
</p>
<br>


#### Add organization as Consortium Member on the orderer to transact
  - Navigate to the <b>Nodes</b> tab, and click on the <b>Orderer</b> that was created.
  - Under <b>Consortium Members</b>, click <b>Add organization +</b>.
  - Select the <b>Existing MSP ID</b> tab. From the drop-down list, select `Org1MSP (Org1MSP)`, as this is the MSP that represents the peer's organization "Org1".
  - Click <b>Add organization</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85803823-105e4b00-b716-11ea-9ee3-28e0d30ffa95.gif">
</p>
<br>


#### Create the channel
  - Navigate to the <b>Channels</b> tab in the left navigation and click <b>Create channel +</b>.
  - Click <b>Next</b>.
  - Give the <b>Channel name</b> as `mychannel`. Select `Orderer` from the <b>Ordering service</b> drop-down list. Click <b>Next</b>.
  - Under <b>Organizations</b>, select `Org1MSP (Org1MSP)` from the drop-down list to add the organization "Org1" as a member of this channel. Click the <b>Add</b> button. Set the permissions for this member as <b>Operator</b>. Click <b>Next</b>.
  - Leave the <b>Policy</b> as the default value i.e. `1 out of 1`. Click <b>Next</b>.
  - Select the <b>Channel creator MSP</b> as `Org1MSP (Org1MSP)` and the <b>Identity</b> as `Org1 Admin`. Click <b>Next</b>.
  - Review the summary and click <b>Create channel</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85804332-5a93fc00-b717-11ea-81e7-a4b6955575ee.gif">
</p>
<br>


#### Join your peer to the channel
  - Click on the newly crated channel <b>mychannel</b>.
  - In the side panel that opens, under <b>Choose from available peers</b>, select `Peer Org1`. Once the peer is selected, a check mark will be displayed next to it. Ensure that <b>Make anchor peer(s)</b> is marked as `Yes`. Click <b>Join channel</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85804533-e60d8d00-b717-11ea-8066-64d66e4b4d33.gif">
</p>
<br>

### 6. Deploy Blockchain for maintaining Digital Assets Smart Contract on the network

#### Install a smart contract
  - Navigate to the <b>Smart contracts</b> tab in the left navigation and click <b>Install smart contract +</b>.
  - Click on <b>Add file</b>.
  - Browse to the location of the Blockchain for maintaining Digital Assets smart contract package file (it is probably named `blockchain-for-maintaining-digital-assets@0.0.1.cds`), which we packaged earlier using the IBM Blockchain Platform extension for Visual Studio code.
  - Once the contract is uploaded, click <b>Install smart contract</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85815413-562b0b80-b736-11ea-95c7-dbc2293d7e7d.gif">
</p>
<br>


#### Instantiate smart contract
  - Under <b>Installed smart contracts</b>, find the smart contract from the list (**Note: ours is called blockchain-for-maintaining-digital-assets**) installed on our peer and click <b>Instantiate</b> from the overflow menu on the right side of the row.
  - On the side panel that opens, select the channel, `mychannel` on which to instantiate the smart contract. Click <b>Next</b>.
  - Select `Org1MSP` as the organization member to be included in the endorsement policy. Click <b>Next</b>.
  - Skip the <b>Setup private data collection</b> step and simply click <b>Next</b>.
  - Leave the <b>Function name</b> and <b>Arguments</b> blank.
  - Click <b>Instantiate smart contract</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85815857-9dfe6280-b737-11ea-9883-02f86dcaa9c1.gif">
</p>
<br>


## 7. Connect application to the network

#### Connect with sdk through connection profile
  - Navigate to the <b>Organizations</b> tab in the left navigation, and click on <b>Org1MSP</b>.
  - Click on <b>Download Connection Profile</b>. 
  - In the side panel that opens up, select `Yes` as the response for <b>Include Org1 CA for user registration and enrollment?</b>. Under <b> Select peers to include</b>, select `Peer Org1`. Then click <b>Download connection profile</b>. This will download the connection json which we will use to establish a connection between the Node.js web application and the Blockchain Network.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85816453-5973c680-b739-11ea-9ddb-370ae50f9f81.gif">
</p>
<br>

#### Create an application admin
  - Navigate to the <b>Nodes</b> tab in the left navigation, and under <b>Certificate Authorities</b>, choose <b>Org1 CA</b>.
  - Click on the <b>Register User +</b> button. Give an <b>Enroll ID</b> of `app-admin` and an <b>Enroll secret</b> of `app-adminpw`. Set the <b>Type</b> for this identity as `client`. Specify to <b>Use root affiliation</b>. Leave the <b>Maximum enrollments</b> field blank. Click <b>Next</b>.
  - Click on <b>Add attribute +</b>. Enter the <b>attribute name</b> as `hf.Registrar.Roles` and the <b>attribute value</b> as `*`. Click <b>Register user</b>.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85872406-b0ab8280-b79d-11ea-80e8-632d2bd39285.gif">
</p>
<br>


#### Update application connection profile
  - Copy the connection profile you downloaded into the [config folder](web-app/server/config).
  - Update the [config.json](web-app/server/config/config.json) file with:
    - The connection json file name you downloaded.
    - The <b>enroll id</b> and <b>enroll secret</b> for your app admin, which we earlier provided as `app-admin` and `app-adminpw` respectively.
    - The orgMSP ID, which we provided as `Org1MSP`.
    - The caName, which can be found in your connection json file under "organizations" -> "Org1MSP" -> certificateAuthorities". This would be like an IP address and a port.
    - The peerName, which can be found in your connection json file under "organizations" -> "Org1MSP" -> peers". This would be like an IP address and a port.
    - Update gateway discovery to `{ enabled: true, asLocalhost: false }` to connect to IBM Blockchain Platform.
    - Go to your inbox on mailtrap.io and choose `Nodemailer` in the dropdown under `Integrations`. Obtain the host, port, auth.user and auth.pass values and specify them as smtpHost, smtpPort, smtpUserName and smtpPassword values in the config.json file. <br><p align="center"><img src="https://user-images.githubusercontent.com/8854447/85883435-fc1a5c80-b7ae-11ea-885b-20796d4dba81.gif"></p><br>
     - Go to your IBM Cloud Object Storage instance and go to `Buckets` in the left hand navigation pane and click on `Create bucket`. Choose `Standard` under Predefined buckets. Provide a `Unique bucket name` as per the naming rules specified. Skip the `Upload files` step and click `Next`. Skip the `Test bucket out` step and click `Next`. Once the bucket is successfully created, obtain the following information from the webpage:
        - Under `Bucket details`, obtain the bucket name and specify it as cos_bucketName in the config.json.
        - Under `Service Credentials`, obtain the apikey and resource_instance_id values and specify them as the cos_apiKeyId and cos_serviceInstanceId respectively in the config.json.
        - Under `Endpoints`, obtain the `Public` endpoint and specify this value as the cos_endpoint in the config.json file<br><p align="center"><img src="https://user-images.githubusercontent.com/8854447/85887092-2838dc00-b7b5-11ea-8dbd-e70da8f2c9b3.gif"></p><br>
    
Once all this is done, your config.json should look something like this:

```bash
 {
    "channel_name": "mychannel",
    "smart_contract_name": "blockchain-for-maintaining-digital-assets",
    "connection_file": "Org1MSP_profile.json",
    "appAdmin": "app-admin",
    "appAdminSecret": "app-adminpw",
    "orgMSPID": "Org1MSP",
    "caName": "184.172.229.220:31844",
    "peerName": "184.172.229.220:30884",
    "gatewayDiscovery": { "enabled": true, "asLocalhost": false },
    "smtpHost": "smtp.mailtrap.io",
    "smtpPort": 2525,
    "smtpUserName": "cb49e25f8cbe5f",
    "smtpPassword": "3734c09cfdj05f",
    "senderEmail": "no-reply@digitalassetscodepattern.com",
    "cos_endpoint": "s3.us-south.cloud-object-storage.appdomain.cloud",
    "cos_apiKeyId": "QrC2rLBkjEmS755xR88_78seDgD2ai8DIQxVd74G21Je",
    "cos_serviceInstanceId": "crn:v1:bluemix:public:cloud-object-storage:global:a/86ac1b16b6f8b9639124a38d8edbd301:2f8d9627-46ff-46e9-a053-9d3e7121eedf::",
    "cos_bucketName": "blockchain-digital-assets-bucket"
 }
```


### 8. Run the application

#### In a new terminal, navigate to the [`server`](web-app/server) directory:

  ```bash
  cd Blockchain-for-maintaining-digital-assets/web-app/server/
  ```


#### Build the node dependencies:

  ```bash
  npm install
  ```
  
  
#### Enroll the admin and add identity to the wallet:
  
  **Note: This creates public and private key files for the app-admin in the _idwallet folder inside the [config folder](web-app/server/config). If a folder named "app-admin" exists in the "_idwallet" folder, then the following command will not enroll the app-admin as it already exists in the wallet. Remove the app-admin folder and then run the following command.**
  
  ```bash
  node enrollAdmin.js
  ```


#### Start the server:

  ```bash
  npm start
  ```


#### In a separate terminal, navigate to the [`client`](web-app/client) directory:

  ```bash
  cd Blockchain-for-maintaining-digital-assets/web-app/client/
  ```
  
  
#### Build the node dependencies:

  ```bash
  npm install
  ```


#### Start the client:

  ```bash
  npm run serve
  ```

Once both the server and client have successfully started, the UI can be accessed at [http://localhost:8080/?#/](http://localhost:8080/?#/).

Main page of application:
<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71941831-28063f00-3189-11ea-9f02-dfe2f78a6cbb.png">
</p>
<br>

You can have a look at the [Introduction and Demo video](#watch-the-video---introduction-and-demo) for examples of actions that can be taken within the application.


# Troubleshooting

If you get an error that says `Error: Calling register endpoint failed with error [Error: self signed certificate]`, you can get past this by adding `"httpOptions": {"verify": false}` to the certificateAuthorities section of the connection profile that was downloaded from IBM Blockchain Platform.

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85960220-fb7cf400-b96f-11ea-9821-b9e21d6382e5.png">
</p>
<br>

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/85960318-b2796f80-b970-11ea-9fcc-b8af15bf4b38.png">
</p>
<br>


# Extending the code pattern
This application can be extended by:
* Adding additional metadata for the digital assets.
* Adding enhanced features for registering and logging in users.
* Adding encryption to the IBM Cloud Object Storage bucket.


# Links
* [Hyperledger Fabric Docs](http://hyperledger-fabric.readthedocs.io/en/latest/)
* [IBM Code Patterns for Blockchain](https://developer.ibm.com/patterns/category/blockchain/)


# License
This code pattern is licensed under the Apache Software License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
