# NodeJs-challange-01

## About this challange

In this challenge, i need to develop an CRUD API of my tasks.

- [ ] I should be able to create a new task.
- [ ] I should be able to get all tasks.
- [ ] I should be able to update a task by Id.
- [ ] I should be able to delete a task by Id.
- [ ] I should be able to mark a task by Id as completed.
- [ ] I should be able to import my tasks in a CSV file.

## Business Rules

Before the routes, this is the strutucture(properites) that my tasks should follow:

+ id - Unnique identifier of each task.
+ title - Title of the task.
+ description - Description of the task.
+ completed_at - Date when the task wass completed (initial value is null)
+ created_at  - Date when the task was created.
+ updated_at - Date when the task was updated.

## Routes
+ POST - /tasks
+ GET - /tasks
+ PUT - /tasks/:id
+ DELETE - /tasks/:id
+ PATCH - /tasks/:id/complete