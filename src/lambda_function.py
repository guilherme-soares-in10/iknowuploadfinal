# import the json utility package since we will be working with a JSON object
import json
# import the AWS SDK (for Python the package name is boto3)
import boto3
# import time 
import time
from decimal import Decimal

# create a DynamoDB object using the AWS SDK
dynamodb = boto3.resource('dynamodb')
# use the DynamoDB object to select our table
table = dynamodb.Table('iknowuploadfinaltable')

# Helper function to convert Decimal types to regular numbers
def convert_decimal_to_number(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    elif isinstance(obj, dict):
        return {k: convert_decimal_to_number(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimal_to_number(i) for i in obj]
    return obj

# define the handler function that the Lambda service will use as an entry point
def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    # Get the HTTP method from the event
    http_method = event.get('httpMethod', '')
    print("HTTP method:", http_method)

    # Check if this is a DELETE request by looking at the event structure
    if http_method == 'DELETE' or ('id' in event and 'httpMethod' not in event and 'displayName' not in event):
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
                # Get current timestamp
                timestamp = int(time.time())
                
                # Create the company item
                response = table.put_item(
                    Item={
                        'ID': event['companyId'],
                        'displayName': event['displayName'],
                        'categories': event['categories'],
                        'createdAt': timestamp
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
                
                # Convert Decimal types to regular numbers
                items = convert_decimal_to_number(items)
                
                # Sort items by createdAt timestamp
                items.sort(key=lambda x: x.get('createdAt', 0))
                
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
            
            # Convert Decimal types to regular numbers
            items = convert_decimal_to_number(items)
            
            # Sort items by createdAt timestamp
            items.sort(key=lambda x: x.get('createdAt', 0))
            
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
            
            # Get current timestamp
            timestamp = int(time.time())
            
            # Create the company item
            response = table.put_item(
                Item={
                    'ID': body['companyId'],
                    'displayName': body['displayName'],
                    'categories': body['categories'],
                    'createdAt': timestamp
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
    
    elif http_method == 'PUT':
        try:
            # Get the request body - it might be in event['body'] or directly in the event
            body = event.get('body', event)
            if isinstance(body, str):
                body = json.loads(body)
            print("PUT request body:", body)  # Add logging
            
            # Validate required fields
            if 'id' not in body or 'displayName' not in body:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields: id and displayName are required'})
                }
            
            # Update the company item
            response = table.update_item(
                Key={
                    'ID': body['id']
                },
                UpdateExpression='SET displayName = :displayName',
                ExpressionAttributeValues={
                    ':displayName': body['displayName']
                },
                ReturnValues='ALL_NEW'
            )
            
            print("Update response:", response)  # Add logging
            
            # Convert any Decimal types in the response to regular numbers
            updated_item = convert_decimal_to_number(response.get('Attributes', {}))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': f'Successfully updated company: {body["displayName"]}',
                    'updatedItem': updated_item
                })
            }
        except Exception as e:
            print("Error in PUT handler:", str(e))  # Add logging
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