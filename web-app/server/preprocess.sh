#!/bin/bash
# Simple shell script calculate helm overwriting arguments 


# Get ingress subdomain for cluster 
INGRESS_SUBDOMAIN=$(ibmcloud ks cluster get --cluster ${PIPELINE_KUBERNETES_CLUSTER_NAME} | grep 'Ingress Subdomain:' | awk '{ print $3 } ' )

# Abort if ingress subdomain not found
[ -z "$INGRESS_SUBDOMAIN" ] && echo "Ingress subdomain for cluster not found.  Exiting " && exit 1


# Set ingress.host value for Helm 
API_HOST_HELM_ARGS=" --set ingress.host=${INGRESS_SUBDOMAIN}" 

# Pick any values already assigned to this variable and append the additional setting 
HELM_UPGRADE_EXTRA_ARGS=${HELM_UPGRADE_EXTRA_ARGS}${API_HOST_HELM_ARGS}