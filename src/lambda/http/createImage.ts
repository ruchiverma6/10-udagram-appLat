import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

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

 const imageId = uuid.v4();
 const newItem = await createImage(imageId, groupId, event)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem : newItem
    })
  }
}

async function groupExists(groupId:string) {
    const result = await docClient.get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
    }).promise()
    return !!result.Item
}

async function createImage(groupId:string, imageId:String, event: any) {
    const timestamp = new Date().toISOString()
    const newImage = JSON.parse(event.body)

    const newItem = {
        groupId,
        timestamp,
        imageId,
        ...newImage
    }

    await docClient.put({
        TableName: imagesTable,
        Item: newItem
    }).promise()

    return newItem
}
