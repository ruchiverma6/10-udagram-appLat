import { CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult } from "aws-lambda";

export const handler: CustomAuthorizerHandler = async(event : CustomAuthorizerEvent): Promise<CustomAuthorizerResult>=>{
 try{
    verifyToken(event.authorizationToken);
    console.log('User was authorized')
    return{
        principalId: 'user',
        policyDocument: {
            Version : '2021-10-30',
             Statement: [ {
               Action: 'execute-api:Invoke',
               Effect: 'Allow',
               Resource: '*'
            }
        ]
        }
    }
 }catch(e){
  console.log('User was not authorized', e.message)
  return{
    principalId: 'user',
    policyDocument: {
        Version : '2021-10-30',
         Statement: [ {
           Action: 'execute-api:Invoke',
           Effect: 'Deny',
           Resource: '*'
        }
    ]
    }
}
 }   
}

function verifyToken(authHeader: String) {
    if(!authHeader){
        throw new Error("No authentication header");
        }

    if(!authHeader.toLocaleLowerCase().startsWith('bearer '))  {
        throw new Error('Invalid authorization header')
    }  

    const split = authHeader.split(' ')
    const token = split[1]

    if(token!=='123'){
        throw new Error('Invalid token')
    }
  //A request is authorized.
}
