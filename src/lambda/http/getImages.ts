import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUP_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
 const groupId = event.pathParameters.groupId
 const validGroupId = await groupExists(groupId)
 if(!validGroupId){
     return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      error : 'Group does not exist'
    })
  }
 }

 const images =  await getImagesPerGroup(groupId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      images
    })
  }
}

async function groupExists(groupId:string) {
    const result = await docClient.get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
    }).promise
    if(result.Count>0){
        return true
    }else{
        return false
    }
}

async function getImagesPerGroup(groupId:string) {
    const result = await docClient.query({
        TableName: imagesTable,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
            ':groupId' : groupId
        },
        scanIndexForward: false
    }).promise
    return result.items
}
