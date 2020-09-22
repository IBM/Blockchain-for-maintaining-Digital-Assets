#!/bin/bash
# Simple shell script calculate helm overwriting arguments 


# Get ingress subdomain for cluster 
INGRESS_SUBDOMAIN=$(ibmcloud ks cluster get --cluster ${PIPELINE_KUBERNETES_CLUSTER_NAME} | grep 'Ingress Subdomain:' | awk '{ print $3 } ' )

# Abort if ingress subdomain not found
[ -z "$INGRESS_SUBDOMAIN" ] && echo "Ingress subdomain for cluster not found.  Exiting " && exit 1


# Set app.apiHost to the ingress subdomain for this cluster
# This makes the assumption that the API host is deployed on the same cluster as the clients
# overwriting app.ApiHost defined in chart/values.yaml
API_HOST_HELM_ARGS=" --set app.apiHost=${INGRESS_SUBDOMAIN}" 

# Pick any values already assigned to this variable and append the additional setting 
HELM_UPGRADE_EXTRA_ARGS=${HELM_UPGRADE_EXTRA_ARGS}${API_HOST_HELM_ARGS}