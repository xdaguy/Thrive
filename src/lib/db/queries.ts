import { db, generateId, type Income, type Expense, type Task, type Weight, type Exercise, type Meal } from './schema'

// Income Operations
export async function addIncome(income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = generateId()
  const now = new Date()
  
  await db.income.add({
    ...income,
    id,
    createdAt: now,
    updatedAt: now
  })
  
  return id
}

export async function getIncome(id: string) {
  return await db.income.get(id)
}

export async function getAllIncome() {
  return await db.income.orderBy('date').reverse().toArray()
}

export async function updateIncome(id: string, updates: Partial<Income>) {
  await db.income.update(id, {
    ...updates,
    updatedAt: new Date()
  })
}

export async function deleteIncome(id: string) {
  await db.income.delete(id)
}

// Expense Operations
export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = generateId()
  const now = new Date()
  
  await db.expenses.add({
    ...expense,
    id,
    createdAt: now,
    updatedAt: now
  })
  
  return id
}

export async function getAllExpenses() {
  return await db.expenses.orderBy('date').reverse().toArray()
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
  await db.expenses.update(id, {
    ...updates,
    updatedAt: new Date()
  })
}

export async function deleteExpense(id: string) {
  await db.expenses.delete(id)
}

// Task Operations
export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = generateId()
  const now = new Date()
  
  await db.tasks.add({
    ...task,
    id,
    createdAt: now,
    updatedAt: now
  })
  
  return id
}

export async function getAllTasks() {
  return await db.tasks.orderBy('createdAt').reverse().toArray()
}

export async function getPendingTasks() {
  return await db.tasks.filter(task => !task.completed).toArray()
}

export async function updateTask(id: string, updates: Partial<Task>) {
  await db.tasks.update(id, {
    ...updates,
    updatedAt: new Date()
  })
}

export async function toggleTaskCompletion(id: string) {
  const task = await db.tasks.get(id)
  if (!task) return
  
  await db.tasks.update(id, {
    completed: !task.completed,
    completedAt: !task.completed ? new Date() : undefined,
    updatedAt: new Date()
  })
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id)
}

// Weight Operations
export async function addWeight(weight: Omit<Weight, 'id' | 'createdAt'>) {
  const id = generateId()
  
  await db.weight.add({
    ...weight,
    id,
    createdAt: new Date()
  })
  
  return id
}

export async function getAllWeight() {
  return await db.weight.orderBy('date').reverse().toArray()
}

export async function deleteWeight(id: string) {
  await db.weight.delete(id)
}

// Exercise Operations
export async function addExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>) {
  const id = generateId()
  
  await db.exercise.add({
    ...exercise,
    id,
    createdAt: new Date()
  })
  
  return id
}

export async function getAllExercise() {
  return await db.exercise.orderBy('date').reverse().toArray()
}

export async function deleteExercise(id: string) {
  await db.exercise.delete(id)
}

// Meal Operations
export async function addMeal(meal: Omit<Meal, 'id' | 'createdAt'>) {
  const id = generateId()
  
  await db.meals.add({
    ...meal,
    id,
    createdAt: new Date()
  })
  
  return id
}

export async function getAllMeals() {
  return await db.meals.orderBy('date').reverse().toArray()
}

export async function deleteMeal(id: string) {
  await db.meals.delete(id)
}

// Statistics
export async function getMonthlyIncome(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  
  const income = await db.income
    .where('date')
    .between(startDate, endDate)
    .toArray()
  
  return income.reduce((sum, item) => sum + item.amount, 0)
}

export async function getMonthlyExpenses(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  
  const expenses = await db.expenses
    .where('date')
    .between(startDate, endDate)
    .toArray()
  
  return expenses.reduce((sum, item) => sum + item.amount, 0)
}

export async function getTotalBalance() {
  const allIncome = await db.income.toArray()
  const allExpenses = await db.expenses.toArray()
  
  const totalIncome = allIncome.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = allExpenses.reduce((sum, item) => sum + item.amount, 0)
  
  return totalIncome - totalExpenses
}

export async function getTasksCompletedToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const tasks = await db.tasks
    .where('completedAt')
    .between(today, tomorrow)
    .toArray()
  
  return tasks.length
}

export async function getTotalTasksToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tasks = await db.tasks
    .where('dueDate')
    .equals(today)
    .toArray()
  
  return tasks.length
}
