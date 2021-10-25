import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger'
import { AttachmentUtils } from './attachmentUtils';
// import * as createError from 'http-errors'

// DONE: Implement businessLogic
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodosForUser(userId: string) {
    return todosAccess.getAllTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const itemId = uuid.v4()
    const todoItem = {
        userId,
        todoId: itemId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    }

    return await todosAccess.createTodoItem(userId, todoItem)
}

export async function updateTodo(userId: string, updateTodoRequest: UpdateTodoRequest, todoId: string): Promise<TodoItem> {
    return await todosAccess.updateTodoItem(userId, updateTodoRequest, todoId)
}

export async function deleteTodo(userId: string, todoId: string) {
    return await todosAccess.deleteTodoItem(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
    const url =await attachmentUtils.getSignedUrl(todoId);
    
    return url
}
