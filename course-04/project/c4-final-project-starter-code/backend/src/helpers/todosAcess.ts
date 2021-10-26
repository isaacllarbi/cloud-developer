import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }

    async getAllTodoItems(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all TodoItem for user with ID: ${userId}`);

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: 'CreatedAtIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        return result.Items as TodoItem[]
    }

    async createTodoItem(todoItem): Promise<TodoItem> {
        logger.info(`Creating TodoItem with id ${todoItem.itemId}`);
        const results = await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem,
            ReturnValues: "ALL_NEW"
        }).promise()

        return results.Attributes as TodoItem
    }

    async updateTodoItem(userId: string, todoItem: UpdateTodoRequest, todoId: string): Promise<TodoItem> {
        logger.info(`Updating TodoItem with id ${todoId}`);

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId, userId },
            UpdateExpression: "set #name=:name, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
                ":name": todoItem.name,
                ":dueDate": todoItem.dueDate,
                ":done": todoItem.done
            },
            ExpressionAttributeNames: { "#name": "name", "dueDate":"dueDate","done":"done" },
            ReturnValues: "ALL_NEW"
        }).promise()

        return result.Attributes as TodoItem

    }

    async deleteTodoItem(userId: string, todoId: string): Promise<{}> {
        logger.info(`Deleting TodoItem with id ${todoId}`);

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { todoId, userId }
        }).promise()

        return {}
    }

}