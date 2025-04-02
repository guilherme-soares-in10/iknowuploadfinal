# import the json utility package since we will be working with a JSON object
import json
# import the AWS SDK (for Python the package name is boto3)
import boto3
# import time 
import time
# import two packages to help us with dates and date formatting

# create a DynamoDB object using the AWS SDK
dynamodb = boto3.resource('dynamodb')
# use the DynamoDB object to select our table
table = dynamodb.Table('iknowuploadfinaltable')

# define the handler function that the Lambda service will use as an entry point
def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    # Get the HTTP method from the event
    http_method = event.get('httpMethod', '')
    print("HTTP method:", http_method)

    # Check if this is a DELETE request by looking at the event structure
    if 'id' in event and 'httpMethod' not in event:
        # This is a DELETE request
        try:
            # Get the ID of the company to delete
            company_id = event.get('id')
            
            if not company_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Company ID is required for deletion'})
                }
            
            # Delete the company from DynamoDB
            response = table.delete_item(
                Key={
                    'ID': company_id
                }
            )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': f'Successfully deleted company with ID: {company_id}'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)})
            }
    
    # If no httpMethod (console test), check if it's a POST or GET based on event structure
    if not http_method:
        # If event has company data, treat as POST
        if 'companyId' in event and 'displayName' in event and 'categories' in event:
            try:
                # Create the company item
                response = table.put_item(
                    Item={
                        'ID': event['companyId'],
                        'displayName': event['displayName'],
                        'categories': event['categories']
                    }
                )
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': f'Successfully created company: {event["displayName"]}'})
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': str(e)})
                }
        # If no company data, treat as GET
        else:
            try:
                # Scan the DynamoDB table
                response = table.scan()
                items = response.get('Items', [])
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(items)
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': str(e)})
                }
    
    # Handle API Gateway requests
    elif http_method == 'GET':
        try:
            # Scan the DynamoDB table
            response = table.scan()
            items = response.get('Items', [])
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(items)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)})
            }
    
    elif http_method == 'POST':
        try:
            # Parse the JSON string from the event body
            body = json.loads(event['body'])
            
            # Validate required fields
            if 'companyId' not in body or 'displayName' not in body or 'categories' not in body:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields: companyId, displayName, and categories are required'})
                }
            
            # Create the company item
            response = table.put_item(
                Item={
                    'ID': body['companyId'],
                    'displayName': body['displayName'],
                    'categories': body['categories']
                }
            )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': f'Successfully created company: {body["displayName"]}'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)})
            }
    
    # Handle unsupported methods
    else:
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }